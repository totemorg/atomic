// UNCLASSIFIED

/**
 * @class engine
 * @requires engineIF
 * @requires child_process
 * @requires fs
 * @requires enum
 * @requires mathjs
 * @requires digitalsignals
 * @requires graceful-lwip
 * @requires crypto
 */

var 														// NodeJS modules
	CP = require("child_process"),
	FS = require("fs"),	
	CLUSTER = require("cluster"),
	VM = require("vm");
	
var 														// Totem modules
	ENUM = require("enum");
	
var															// shortcuts
	Copy = ENUM.copy,
	Each = ENUM.each;
	
function Trace(msg,arg) {
	console.log("E>"+msg);
	if (arg) console.log(arg);
};
	
var
	ENGINE = module.exports = Copy( 
		 //< engineIF built by node-gyp
		require("./ifs/build/Release/engineIF"), {
		
		paths: {
			jobs: "./jobs/"
		},
		thread: null,
		builtins: null,
		cores: 0,
		nextcore: 0,
			
		config: function (opts) {  // configure with options
	
			Trace(`Engines configured`);

			if (opts) Copy(opts,ENGINE);

			if (ENGINE.thread)
			ENGINE.thread( function (sql) { // compile engines defined in engines DB

				function compileEngine(engine, name, code, res) {
					try {
						VM.runInContext( "FLEX."+engine+"."+name+"="+code, VM.createContext({FLEX:FLEX})  );

						if (res) res("ok");
					}
					catch (err) {
						if (res) res(new Error(err+""));
					}
				}	

				sql.query("DELETE FROM app1.simcores", function (err) {
					Trace(err || "RESET ENGINE CORES");
				});

				ENGINE.nextcore = ENGINE.cores ? 1 : 0;

				if (builtins = ENGINE.builtins)
					for (var eng in  builtins) 
						sql.query("INSERT INTO app1.engines SET ?", {
							Name: eng,
							Enabled: 0,
							Engine: "js",
							Code: builtins[eng]+""
						});

				if (CLUSTER.isWorker) 	
					CLUSTER.worker.process.on("message", function (eng,socket) {

						if (eng.core) { 		// process only tau messages (ignores sockets, etc)

		Trace(">worker run");	
							var 
								args = eng.args,
								core = eng.core,
								format = eng.format;

							ENGINE.thread(function (sql) {
								args.sql = sql;

								ENGINE.compute(core, args, function (context) {

									if (engine = ENGINE[core.type] )
										try {
											var rtn = engine(core.name,args.port,context.tau,context,core.code);
										}
										catch (err) {
											var rtn = 110; //err+"";
										}
									else
										var rtn = 110;

									var rtn = ENGINE.errors[rtn];

		Trace(">engine="+rtn+" fmt="+format);

									switch (format) {
										case "db":
											socket.end( JSON.stringify({ 
												success: true,
												msg: rtn,
												count: 0,
												data: 0 //ENGINE.maptau(context)
											}) );
											break;

										default:
											socket.end( JSON.stringify(context.tau) );
									}

								});
							});
						}
					});
			});

			return ENGINE;
		},
			
		plugin: {  // plugin libs available to all engines
			MATH: require('mathjs'),
			LWIP: require('../graceful-lwip'),
			DSP: require('digitalsignals'),
			CRYPTO: require('crypto'),
			RAN: require('randpr'),
			GRP: require('groups'),
			CON: console,
			console: console,
			JSON: JSON
		},
			
		errors: {  // error messages
			0: null,
			101: new Error("engine could not be loaded"),
			102: new Error("engine received bad port/query"),
			103: new Error("engine could not be compiled"),
			104: new Error("engine failed entry/exit"),
			105: new Error("engine exhausted engine pool"),
			106: new Error("engine received bad query"),
			107: new Error("engine cant reach assigned worker at this port"),
			108: new Error("engine has no context"),
			109: new Error("engine could not handoff to worker"),
			110: new Error("engine type not supported"),
			111: new Error("engine does not exists or is not enabled"),
			200: new Error("engine provided invalid port")	
		},
			
		context: {},
			
		tau: function (job) { // default event token sent to and produced by engines in workflows
			return {
				job: job || "", // Current job thread N.N... 
				work: 0, 		// Anticipated/delivered data volume (dims, bits, etc)
				disem: "", 		// Disemination channel for this event
				classif: "", 	// Classification of this event
				cost: "",		// Billing center
				policy: "", 	// Data retention policy (time+place to hold, method to remove, outside disem rules)
				status: 0, 		// Status code (health, purpose, etc)
				value: 0		// Flow calculation
			 };
		},

		/**
		* @method allocate
		* 
		* Execute the supplied callback with the engine core that is/was allocated to a Client.Engine.Type.Instance
		* thread as defined by this request (in the req.body and req.log).  If a workflow Instance is 
		* provided, then the engine is assumed to be in a workflow (thus the returned core will remain
		* on the same compile-step thread); otherwise, the engine is assumed to be standalone (thus forcing
		* the engine to re-compile each time it is stepped).
		* 
		* As used here (and elsewhere) the terms "process", "engine core", "safety core", and "worker" are 
		* equivalent, and should not be confused with a physical "cpu core".  Because heavyweight 
		* (spawned) workers run in their own V8 instance, these workers can tollerate all faults (even 
		* core-dump exceptions). The lightweight (cluster) workers used here, however, share the same V8 
		* instance.  Heavyweight workers thus provide greater safety for bound executables (like opencv and 
		* python) at the expense of greater cpu overhead.  
		*
		* The goal of hyperthreading is to balance threads across cpu cores.  The workerless (master only)
		* configuration will intrinsically utilize only one of its underlying cpu cores (the OS remains, 
		* however, free to bounce between cpu cores via SMP).  A worker cluster, however, tends to 
		* balance threads across all cpu cores, especially when the number of allocated workers exceeds
		* the number of physical cpu cores.
		* 
		* Only the cluster master can see its workers; thus workers can not send work to other workers, only
		* the master can send work to workers.  Thus hyperthreading to *stateful* engines can be supported
		* only when master and workers are listening on different ports (workers are all listening on 
		* same ports to provide *stateless* engines).  So typically place master on port N+1 (to server
		* stateful engines) and its workers on port N (to serve stateless engines).  
		*
		* This method will callback cb(core) with the requested engine core; null if the core could not
		* be located or allocated.
		*/
		allocate: function (req,args,cb) {	  // called by master to thread a stateful engine
			var 
				sql = req.sql,
				name = `${req.client}.${req.table}.${req.type}.${req.body.thread || "0"}`;

			function execute(args,core,cb) {

				var my_wid = CLUSTER.isMaster ? 0 : CLUSTER.worker.id;

		//Trace(">exec isMas="+CLUSTER.isMaster);

				if (CLUSTER.isMaster) 		// only the master can send work to its workers (and itself)

					if (core.wid) { 		// engine was assigned to a worker
		//Trace(">worker wid="+core.wid,args);
						var worker = CLUSTER.workers[core.wid];
						delete args.sql;

						if (worker) 		// let assigned stateful engine respond on this socket
							worker.send({core:core,args:args,format:req.type}, req.connection);
						
						else 
							cb( ENGINE.errors[107] ); 
					}
					
					else  					// engine was assigned to the master
						ENGINE.compute(core, args, function (context) {
							ENGINE.call(core, context, cb);
						});

				else
				if (core.wid == my_wid)   	// client on worker port, but got lucky - pass to this stateful worker
					ENGINE.compute(core, args, function (context) {
						ENGINE.call(core, context, cb);
					});

				else 						// client on worker port and unlucky - should be using master port
					cb( ENGINE.errors[107] );
			}

			/*
			Get assocated engine core if already allocated; otherwise allocate a new core.  We keep the
			cores in a sql table so that all cluster workers have a common place to access engine
			cores, thus allowing the engine to stay on the same worker core.  In this way, we can
			step the engine on the same thread (hence state) is was compiled on.  If no thread is
			specified (e.g. when engine called outside a workflow), then the engine will be forced
			to recompile itself.
			*/
			
			sql.query("SELECT *,count(ID) AS found FROM simcores WHERE ? LIMIT 0,1", { // look for core
				name:name
			}) .on("result", function (core) { 	// found core

				if (core.found) {  // core already initialized so execute it
					Trace("CORE"+core.wid+" SWITCHED TO "+name);

					core.code = "";
					core.vars = "";

					execute(args,core,cb);
				}
				
				else // initialize core if an engine can be located 
					sql.query(
						"SELECT *,count(ID) AS found FROM engines WHERE least(?) LIMIT 0,1", {
							Name:req.table,
							Engine:req.type,
							Enabled:true
					}).on("result", function (eng) { // progam its engine

		//Trace(">new engine");

						if (eng.found) {
							if (CLUSTER.isMaster)
								var wid = ENGINE.cores 			// provide stateful worker
										? ENGINE.nextcore = (ENGINE.nextcore % ENGINE.cores) + 1 
										: 0;
							else
								var wid = CLUSTER.worker.id;  	// provide stateless worker

							var core = { 								// provide an engine core
								name: name,
								type: eng.Engine.toLowerCase(),
								wid: wid,
								client: req.client,
								code: eng.Code,
								vars: eng.Vars
							};

							Trace("CORE"+core.wid+" ASSIGNED TO "+name);

							sql.query("INSERT INTO simcores SET ?", {
								name:core.name,
								type:core.type,
								wid:core.wid,
								client:core.client
							});

							execute(args,core,cb);
						}
						
						else
							cb( ENGINE.errors[111] );

					});			

			});
		},

		/**
		 * @method save
		 * 
		 * Save fully addressed tau job files.
		*/
		save: function (sql,taus,port,engine,saves) {	// called by cluster worker to log engine output ports
			var t = new Date();

			Each(taus, function (n,tau) {
				if (tau.job) {
					var hasjpg = FS.existsSync(tau.job+".jpg");
					var log = hasjpg ? {jpg: "jpg".tag("a",{href:tau.job+".jpg"})} : {};

					FS.readFile(tau.job+".json", {encoding: "utf8"}, function (err,data) {
						if (!err) {
							var rtn = data.parse({});

							Each(saves.split(","), function (i,save) {
								if (save in rtn)
									switch (save) {
										case "file":
										case "jpg":
											log[save] = "jpg".tag("a",{href:rtn[save]});
											break;

										default:
											log[save] = rtn[save];
									}
							});
						}

						Each( log, function (logn,logv) {
							sql.query("INSERT INTO simresults SET ?", {
								t: t,
								input: tau.job,
								output: `${engine}.${port}`,
								name: logn,
								value: logv,
								special: logv
							});
						});						
					});	
				}
			});
		},

		/**
		 * @method call
		 * Compile and/or step an engine in its context.
		 * */
		call: function (core,context,cb) {

			//Trace(">call");

			Each(context.tau, function (n,tau) { 			// prefix jobs with mount point
				tau.job = ENGINE.paths.jobs + tau.job;
			});

			if ( engine = ENGINE[core.type] )
				try {  												// call the engine
		//Trace(">context",context);
					var rtn = engine(core.name,context.port,context.tau,context,core.code);

					Each(context.tau, function (n,tau) { 			// remove mount point from jobs
						if (tau.job) 
							tau.job = tau.job.substr(ENGINE.paths.jobs.length);
					}); 

					cb(null,context);
				}

				catch (err) {
					cb(err,context);
				}

			else
				cb (new Error(`Bad engine type ${core.type}`));

			//save(sql,context.otau,context.port,core.name,core.save);
		},

		// CRUD interface

		/**
		 * @method insert(step)
		 * @method delete(kill)
		 * @method select(read)
		 * @method update(init)
		 * 
		 * The step, kill, read, and init methods provide a means to advance, deallocate, 
		 * read and compile an engine (implmementeed via restfull insert/POST, update/PUT,
		 * select/GET, and delete/DELETE).  
		*/
		insert: function (req,res) {	// called by worker to step a stateful engine
			var args = {
				tau: req.body.tau || [],
				port: req.body.port || "",
				sql: req.sql,
				query: false,
				action: "insert"
			};

			ENGINE.allocate(req,args,function (err,context) {
console.log(">step "+err);
				res(err || context.tau);
			});
		},
			
		delete: function (req,res) {	// called by worker to free a stateful engine
			var 
				sql = req.sql;
	
			var args = {
				tau: [],
				port: "",
				sql: req.sql,
				action: "delete"
			};
			
			ENGINE.allocate(req,args,function (err,context) {
console.log([">kill ",err]);

				if (err) 
					res(err);
				
				else {
					sql.query("DELETE FROM simcores WHERE ?", {client:req.client});
					res( "ok" ); 
				}
			});
		},
			
		select: function (req,res) {	// called by worker to read a stateless engine 
			/*function guard(q) {
				if (q != true) {
					for (var n in q) 
						try { q[n] = (q[n]||"").parse(0); } catch (err) { }

					for (var n in q) return q;
				}

				return true;
			}*/

			function isempty(h) {
				for (var n in h) return false;
				return true;
			}

			var args = {
				tau: [ENGINE.tau()],
				port: req.query.port || "",
				sql: req.sql,
				action: "select"
			};

			// override the engines query if a request query was given
			delete req.query[""];
			if ( !isempty(req.query) ) args.query = req.query;

			ENGINE.allocate(req,args,function (err,context) {
				res( err || ENGINE.maptau(context) );
			});
		},
			
		update: function (req,res) {	// called by worker to initialize a stateful engine
	
			var args = {
				tau: [ENGINE.tau()],
				port: "",
				sql: req.sql,
				query: false,
				action: "update"
			};

			ENGINE.allocate(req,args,function (err,context) {
console.log([">init",err]);

				res(err || "ok"); 
			});
		},
			
		// Execute interfaces

		/**
		 * @method maptau
		 * */
		maptau: function (context) {
			var tau = context.tau || [];

			return tau;

			if (tau.constructor == Array) {
				for (var n=0,N=tau.length; n<N; n++)
					switch ( tau[n].constructor ) {
						case Array:
							var fix = {};
							for (var m=0,M=tau[n].length; m<M; m++)
								fix['tau'+m] = tau[n][m];

							tau[n] = fix;
							break;

						case Object:
							break;

						default:
							tau[n] = {tau: JSON.stringify(tau[n])};
					}

				return tau;
			}
			
			else
				return [{tau: JSON.stringify(tau)}];

			/*
			for (var x in tau) {
				var vec = tau[x];
				if (typeof vec == "object") 
					if (vec.length > N) N = vec.length;					
			}

			var recs = new Array(N);
			for (var n=0; n<N; n++) {
				var an = recs[n] = {};
				for (x in tau) 
					if (tau.hasOwnProperty(x)) {
						var vec = tau[x];
						if (typeof vec == "object") an[x] = vec[n] || 0;
					}
			}

			return recs;
			* */
		},
			
		/**
		 * @method prime
		 * 
		 * Run the engine at callback cb in its context primed with vars from its context.entry, then export its 
		 * context vars specified by its context.exit.
		 * */
		prime: function (context,cb) {
			var vars = context.vars, sql = context.sql;

			/*
			The context.sqls = {var:"query...", ...} || "query..." enumerates the engine's context.entry (to import 
			vars into its context before the engine is run), and enumerates the engine's context.exit (to export 
			vars from its context after the engine is run).  If an sqls entry/exit exists, this will cause the 
			context.vars = [var, ...] list to be built to synchronously import/export the vars into/from the engine's 
			context.
			*/

			if (vars) {    	  // enumerate over each sqls var
				if ( vars.length ) { 							// more vars to import/export
					var 
						varn = vars.pop(), 					// var to import/export
						query = context.sqls[varn]; 	// sql query to import/export

					if (typeof query != "string") {
						query = query[0];
						args = query.slice(1);
					}

		//Trace([varn,query]);

					if (context.sqls == context.entry) {  	// importing this var into the context
						var data = context[varn] = [];
						var args = context.query;
					}
					
					else { 									// exporting this var from the context
						var data = context[varn] || [];
						var args = [varn, {result:data}, context.query];
					}

		//Trace(JSON.stringify(args));

					var q = sql.query(query, args, function (err, recs) { 	// import/export this var

		//Trace([varn,err,q.sql]);

						if (err) {
							context.err = err;
							context[varn] = null;
						}
						
						else 
							if (context.sqls == context.entry)   // importing matrix
								recs.each( function (n,rec) {
									var vec = [];
									data.push( vec );
									for ( var x in rec ) vec.push( rec[x] );
								});
							
							else { 								// exporting matrix
							}					

						ENGINE.prime(context,cb);
					});
				}
				
				else 					// no more vars to load
				if (cb) {				// run engine in its context
					cb(context);

					if (context.exit) {	// save selected engine context vars
						var sqls = context.sqls = context.exit;
						var vars = context.vars = []; for (var n in sqls) vars.push(n);

						ENGINE.prime(context);
					}
				}
			}
			
			else
			if (context.entry) {  // build context.vars from the context.entry sqls
				var sqls = context.sqls = context.entry;
				
				if (sqls.constructor == String)   // load entire context
					sql.query(sqls)
					.on("result", function (vars) {
						cb( Copy(vars, context) );
					});
				
				else {  // load specific context vars
					var vars = context.vars = []; 
					for (var n in sqls) vars.push(n);
				}

		//Trace("entry vars="+vars);
				ENGINE.prime(context, cb);
			}
			
			else
				cb(context);
		},
			
		/**
		 * @method compute
		 * */
		compute: function (core,args,cb) {	

		//Trace(">compute",core);

			if (core.code) {
				try {
					eval("var vars = "+ (core.vars || "{}"));
				}
				catch (err) {
					var vars = {};
				}

				var context = ENGINE.context[core.name] = VM.createContext(Copy(ENGINE.plugin,Copy(args,vars)));
				ENGINE.prime(context,cb);
			}
			
			else {
				var context = Copy( args, ENGINE.context[core.name] || VM.createContext({}) );
				cb(context);
			}
		},
			
		// SQL engines
		sql: function (name,port,tau,context,code) {

			if (port) 
				return context[port](context.tau,context.ports[port]);

			if (code) { 
				context.SQL = {};
				context.ports = context.ports || {};

				VM.runInContext(code,context);

				ENGINE.app.select[name] = function (req,cb) { context.SQL.select(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.insert[name] = function (req,cb) { context.SQL.insert(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.delete[name] = function (req,cb) { context.SQL.delete(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.update[name] = function (req,cb) { context.SQL.update(req.sql,[],function (recs) {cb(recs);}); }
			}
			
			else  // in cluster mode, so no req,cb exists to call ENGINE.app[action], so call custom version
				context.SQL[context.action](context.sql,[],function (recs) {
					context.tau = [1,2,3];  // cant work as no cb exists
				});

			return 0;	
		},

		// MATLAB-like engines
		mat: function (name,port,tau,context,code) {
	
			if (port)
				return context[port](context.tau,context.context[port]);

			if (code) {
				context.code = code;
				if (context.require) 
					ENGINE.plugin.MATH.import( context.require );
			}

			ENGINE.plugin.MATH.eval(context.code,context);

			Trace({R:context.R, A:context.A, X:context.X});
			return 0;
		},
			
		// Javascript engines
		js: function (name,port,tau,context,code) {

		//Trace([name,port,tau,code]);

			if (tau.constructor == Object) {
				context = ENGINE.context[name] = VM.createContext(Copy(ENGINE.plugin,tau));
				context.code = port;
				port = "";
			}
			
			else	
			if (!context) 
				context = ENGINE.context[name];
			
			else
			if (code)
				context.code = code;

			if (port) 
				if (engine = context[port]) 
					var err = engine(tau, context.ports[port]);  		//context[port](context.tau,context.context[port]);
				else
					var err = 200;

			else {
		//console.log(context.query);
		//console.log(context.code);
				VM.runInContext(context.code,context);
		console.log(context.tau);		
				var err = 0;
			}

			return ENGINE.errors[err];
		},

		// Python engines
		py: function (name,port,tau,context,code) {

		//Trace(">py run",[name,port,code]);

			if (code) {
				context.ports = context.ports || {};  	// engine requires valid ports hash
				context.tau = tau || []; 				// engine requires valid event list

				delete context.sql;				// remove stuff that would confuse engine

				for (var n in ENGINE.plugin) 	
					delete context[n];

				var err = ENGINE.python(name,code,context);

				for (var n=0,N=context.tau.length; n<N; n++) 
					tau[n] = context.tau[n];
			}
			
			else
				var rtn = ENGINE.python(name,port,tau);

			return ENGINE.errors[err];
		},
			
		// OPENCV engines
		cv: function (name,port,tau,context,code) {

		//Trace(">cv run",[name,port,code]);

			if (code) {
				context.ports = context.ports || {};  	// engine requires valid ports hash
				context.tau = tau || []; 				// engine requires valid event list

				delete context.sql;				// remove stuff that would confuse engine

				for (var n in ENGINE.plugin) 	
					delete context[n];

				var err = ENGINE.opencv(name,code,context);

				for (var n=0,N=context.tau.length; n<N; n++) 
					tau[n] = context.tau[n];
			}
			
			else
				var err = ENGINE.opencv(name,port,tau);

			return ENGINE.errors[err];
		},

		// Linux shell engines
		sh: function (name,port,tau,context,code) {
			if (code) context.code = code;

			CP.exec(context.code, function (err,stdout,stderr) {
				Trace(err || stdout);
			});

			return null;
		}

	});

// UNCLASSIFIED
