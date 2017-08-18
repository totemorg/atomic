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
	
var
	ENGINE = module.exports = Copy( //< extend the engineIF built by node-gyp
		require("./ifs/build/Release/engineIF"), {
		
		paths: {
			jobs: "./jobs/"
		},
		thread: null,
		cores: 0,
		nextcore: 0,
			
		config: function (opts) {  // configure with options
	
			Trace(`Engines configured`);

			if (opts) Copy(opts,ENGINE);

			if (thread = ENGINE.thread)
				thread( function (sql) { // compile engines defined in engines DB

					function compileEngine(engine, name, code, res) {
						try {
							VM.runInContext( "FLEX."+engine+"."+name+"="+code, VM.createContext({FLEX:FLEX})  );

							if (res) res("ok");
						}
						catch (err) {
							if (res) res(new Error(err+""));
						}
					}	

					sql.query("DELETE FROM app.simcores", function (err) {
						Trace(err || "RESET ENGINE CORES");
					});

					ENGINE.nextcore = ENGINE.cores ? 1 : 0;

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

									ENGINE.execute(core, args, function (context) {

										if (engine = ENGINE[core.type] )
											try {
												var rtn = engine(core.name,args.port,context.tau,context,core.code);
											}
											catch (err) {
												var rtn = ENGINE.errors.badType; //err+"";
											}
										else
											var rtn = ENGINE.errors.badType;

										var rtn = ENGINE.errors[rtn];

			Trace(">engine="+rtn+" fmt="+format);

										switch (format) {
											case "db":
												socket.end( JSON.stringify({ 
													success: true,
													msg: rtn,
													count: 0,
													data: 0 //ENGINE.returns(context)
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

		flex: null,
			
		plugins: {  // plugins libs available to all engines
			MATH: require('mathjs'),
			LWIP: require('graceful-lwip'),
			DSP: require('digitalsignals'),
			CRYPTO: require('crypto'),
			RAN: require("randpr"),
			SVD: require("node-svd"),
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
			badType: new Error("engine type not supported"),
			noEngine: new Error("engine does not exists or is not enabled"),
			badPort: new Error("engine provided invalid port"),
			badCode: new Error("engine returned invalid code"),
			lostContext: new Error("engine context lost"),
			noStepper: new Error("engine does not exists, is not enabled, or has no stepper"),
			badStep: new Error("engine step faulted")
		},
			
		context: {},
			
		tau: function (job) { // default event token sent to and produced by engines in workflows
			return new Object({
				job: job || "", // Current job thread N.N... 
				work: 0, 		// Anticipated/delivered data volume (dims, bits, etc)
				disem: "", 		// Disemination channel for this event
				classif: "", 	// Classification of this event
				cost: "",		// Billing center
				policy: "", 	// Data retention policy (time+place to hold, method to remove, outside disem rules)
				status: 0, 		// Status code (health, purpose, etc)
				value: 0		// Flow calculation
			 });
		},

		/**
		* @method allocate
		* 
		* Allocate the supplied callback cb(core) with the engine core that is/was allocated to a Client.Engine.Type.Instance
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
		allocate: function (req,args,cb) {
			var 
				sql = req.sql,
				name = `${req.client}.${req.table}.${req.type}.${req.body.thread || "0"}`;

			function run(args,core,cb) {  //< run engine

				function call(core,context,cb) {  //< Call (compile and/or step) an engine with callback cb(context) in its context.

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
				}
				
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
					
					else  					// execute engine that was assigned to the master
						ENGINE.execute(core, args, function (context) {
							call(core, context, cb);
						});

				else
				if (core.wid == my_wid)   	// execute engine that was assigned to this stateful worker
					ENGINE.execute(core, args, function (context) {
						call(core, context, cb);
					});

				else 						// client on worker port - should be using master port
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
			sql.query("SELECT *,count(ID) AS found FROM app.simcores WHERE ? LIMIT 0,1", { // look for core
				name:name
			})
			.on("result", function (core) { 	// found core

				if (core.found) {  // core already allocated so run it
					Trace("CORE"+core.wid+" SWITCHED TO "+name);

					core.code = "";
					core.vars = "";

					run(args,core,cb);
				}
				
				else  // initialize core if an engine can be located 
					ENGINE.find( sql, {name: name}, function (err,eng) {
						if (err)
							cb( ENGINE.errors.noEngine );
						
						else {
							if (CLUSTER.isMaster)
								var wid = ENGINE.cores 			// provide stateful worker
										? ENGINE.nextcore = (ENGINE.nextcore % ENGINE.cores) + 1 
										: 0;
							else
								var wid = CLUSTER.worker.id;  	// provide stateless worker

							var core = { 								// provide an engine core
								name: name,
								type: eng.Engine,
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

							run(args,core,cb);
						}
					});	
			});
		},

		/**
		 * @method save
		 * 
		 * Save tau job files.
		*/
		save: function (sql,taus,port,engine,saves) {
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
		 * @method returns
		 * Return tau parameters in matrix format
		 * */
		returns: function (context) {
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
			
		//============= DUIS interface between multiple client workflows
			
		sq: function (name,port,tau,context,code) {  // SQL engines

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
				ENGINE.thread( function (sql) {
					context.SQL[context.action](sql,[],function (recs) {
						context.tau = [1,2,3];  // cant work as no cb exists
					});
				});
			
			return 0;	
		},

		ma: function (name,port,tau,context,code) {  // MATLAB-like engines
	
			if (port)
				return context[port](context.tau,context.context[port]);

			if (code) {
				context.code = code;
				if (context.require) 
					ENGINE.plugins.MATH.import( context.require );
			}

			ENGINE.plugins.MATH.eval(context.code,context);

			Trace({R:context.R, A:context.A, X:context.X});
			return 0;
		},
			
		js: function (name,port,tau,context,code) {  // Javascript engines

		//Trace([name,port,tau,code]);

			if (tau.constructor == Object) {
				context = ENGINE.context[name] = VM.createContext(Copy(ENGINE.plugins,tau));
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
					var err = ENGINE.errors.badPort;

			else {
		//console.log(context.query);
		//console.log(context.code);
				VM.runInContext(context.code,context);
		//console.log(context.tau);		
				var err = 0;
			}

			return ENGINE.errors[err];
		},

		py: function (name,port,tau,context,code) {  // Python engines

		//Trace(">py run",[name,port,code]);
			
			if (code) {
				context.ports = context.ports || {};  	// engine requires valid ports hash
				//context.tau = tau || []; 				// engine requires valid event list

				/*
				delete context.sql;				// remove stuff that would confuse engine

				for (var n in ENGINE.plugins) 	
					delete context[n];
				*/
				
				var err = ENGINE.python(name,code,context);

				if (ctxtau = context.tau)
					for (var n=0,N=ctxtau.length; n<N; n++) tau[n] = ctxtau[n];
			}
			
			else
				var rtn = ENGINE.python(name,port,context);

			return ENGINE.errors[err];
		},
			
		cv: function (name,port,tau,context,code) {  // OPENCV engines

		//Trace(">cv run",[name,port,code]);

			if (code) {
				context.ports = context.ports || {};  	// engine requires valid ports hash
				context.tau = tau || []; 				// engine requires valid event list

				/*
				delete context.sql;				// remove stuff that would confuse engine

				for (var n in ENGINE.plugins) 	
					delete context[n];
				*/
				
				var err = ENGINE.opencv(name,code,context);

				for (var n=0,N=context.tau.length; n<N; n++) 
					tau[n] = context.tau[n];
			}
			
			else
				var err = ENGINE.opencv(name,port,tau);

			return ENGINE.errors[err];
		},
		
		sh: function (name,port,tau,context,code) {  // Linux shell engines
			if (code) context.code = code;

			CP.exec(context.code, function (err,stdout,stderr) {
				Trace(err || stdout);
			});

			return null;
		},

		/**
		 * @method insert(step)
		 * @method delete(kill)
		 * @method select(read)
		 * @method update(init)
		 * 
		 * Provide methods to step/insert/POST, compile/update/PUT, run/select/GET, and free/delete/DELETE and engine.
		*/
		insert: function (req,res) {	// step a stateful engine
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
			
		delete: function (req,res) {	// free a stateful engine
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
			
		select: function (req,res) {	// run a stateless engine 
			var 
				sql = req.sql,
				ctx = Copy(req.query, {
					name: req.table,
					thread: req.client.replace(/\./g,"") + "." + req.table
				});
			
			ENGINE.run( sql, ctx, function (step) {
				if ( step ) 
					res( step() );
				
				else
					res( ENGINE.errors.noStepper );
			});
		},
			
		update: function (req,res) {	// compile a stateful engine
	
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
			
		execute: function (core,args,cb) {	// add args and plugins to engine context then callback cb(context)
		/**
		 * @method execute
		 * Execute engine cb(context) in its primed context.
		 * */

		//Trace(">execute",core);			
			if (core.code) {  // define new context and prime
				try {  // get context vars for this engine
					eval("var vars = "+ (core.vars || "{}"));
				}
				
				catch (err) {
					var vars = {};
				}

				var context = ENGINE.context[core.name] = VM.createContext(Copy(ENGINE.plugins,Copy(args,vars)));
				ENGINE.prime(core.sql, context,cb);  // core.sql ??
			}
			
			else {  // use existing context
				var context = Copy( args, ENGINE.context[core.name] || VM.createContext({}) );
				cb(context);
			}
		},
			
		prime: function (sql,ctx,cb) {
			/**
			@method prime
			 
			Callback engine cb(ctx) with its ctx primed with vars from its ctx.entry, then export its 
			ctx vars specified by its ctx.exit.
			The ctx.sqls = {var:"query...", ...} || "query..." enumerates the engine's ctx.entry (to import 
			vars into its ctx before the engine is run), and enumerates the engine's ctx.exit (to export 
			vars from its ctx after the engine is run).  If an sqls entry/exit exists, this will cause the 
			ctx.vars = [var, ...] list to be built to synchronously import/export the vars into/from the 
			engine's context.
			 * */
			var vars = ctx.vars;

			if (vars) {    	  // enumerate over each sqls var
				if ( vars.length ) { 							// more vars to import/export
					var 
						varn = vars.pop(), 					// var to import/export
						query = ctx.sqls[varn]; 	// sql query to import/export

					if (typeof query != "string") {
						query = query[0];
						args = query.slice(1);
					}

		//Trace([varn,query]);

					if (ctx.sqls == ctx.entry) {  	// importing this var into the ctx
						var data = ctx[varn] = [];
						var args = ctx.query;
					}
					
					else { 									// exporting this var from the ctx
						var data = ctx[varn] || [];
						var args = [varn, {result:data}, ctx.query];
					}

		//Trace(JSON.stringify(args));

					sql.query(query, args, function (err, recs) { 	// import/export this var

		//Trace([varn,err,q.sql]);

						if (err) {
							ctx.err = err;
							ctx[varn] = null;
						}
						
						else 
							if (ctx.sqls == ctx.entry)   // importing matrix
								recs.each( function (n,rec) {
									var vec = [];
									data.push( vec );
									for ( var x in rec ) vec.push( rec[x] );
								});
							
							else { 								// exporting matrix
							}					

						ENGINE.prime(sql,ctx,cb);
					});
				}
				
				else 					// no more vars to load
				if (cb) {				// run engine in its ctx
					cb(ctx);

					if (ctx.exit) {	// save selected engine ctx vars
						var sqls = ctx.sqls = ctx.exit;
						var vars = ctx.vars = []; for (var n in sqls) vars.push(n);

						ENGINE.prime(sql,ctx);
					}
				}
			}
			
			else
			if (ctx.entry) {  // build ctx.vars from the ctx.entry sqls
				var sqls = ctx.sqls = ctx.entry;
				
				if (sqls.constructor == String)   // load entire ctx
					sql.query(sqls)
					.on("result", function (vars) {
						cb( Copy(vars, ctx) );
					});
				
				else {  // load specific ctx vars
					var vars = ctx.vars = []; 
					for (var n in sqls) vars.push(n);
				}

		//Trace("entry vars="+vars);
				ENGINE.prime(sql,ctx, cb);
			}
			
			else
				cb(ctx);
		},

		find: function (sql, ctx, cb) { //< callback cb(eng) with engine defined by its context
			sql.query(
				"SELECT *,count(ID) AS Count FROM app.engines WHERE least(?) LIMIT 0,1", {
					Name: ctx.name,
					Enabled: true
			})

			.on("result", function (eng) { // progam its engine
				cb(eng.Count ? null : ENGINE.errors.noEngine, eng);
			})

			.on("error", function (err) {
				cb( err, null );
			});
		},
			
		run: function (sql, ctx, cb) { //< callback cb(step) with its stepper
			ENGINE.find(sql, ctx, function (err,eng) {
				
				if (err)
					cb(null);

				else { // progam and prime it
					var 
						thread = ctx.thread,
						type = eng.Engine,
						initEngine = ENGINE.init[type],
						stepEngine = ENGINE.step[type];

					if (eng.Count) 
						if ( initEngine && stepEngine ) {

							try {  // prime its vars
								Copy(JSON.parse(eng.Vars), ctx );
							}

							catch (err) {
								Trace(err);
							}

							ENGINE.prime(sql, ctx, function () {  // prime its vars via sql

								initEngine(ctx.thread, eng.Code || "", ctx, function (err, ctx) {

									if ( err ) 
										cb( null );

									else
										cb( function EngineStepper() {  // Callback with this stepper	
											try {  	// step the engine
												var err =  stepEngine(ctx.thread, eng.Code, ctx);
												return err || ctx.tau;
											}

											catch (err) {
												return( err );
											}
										});

								});

							});
						}

						else
							cb( null );
				}
			});
		},
			
		init: {  // program engines on thread name
			py: function pyInit(name,code,ctx,cb)  {
				if ( !ctx.ports ) ctx.ports = {};
				cb( ENGINE.python(name,code,ctx), ctx );
			},
			
			cv: function cvInit(name,code,ctx,cb)  {
				cb( ENGINE.opencv(name,code,ctx), ctx );
			},
			
			js: function jsInit(name,code,ctx,cb)  {
				var vmctx = ENGINE.context[name];

				if ( !vmctx )
					var vmctx = ENGINE.context[name] = VM.createContext( Copy(ENGINE.plugins,ctx) );
				
				vmctx.code = code;
				
				VM.runInContext(code,vmctx);
				cb( null, vmctx );
			},
			
			ma: function maInit(name,code,ctx,cb) {

				ctx.code = code;
				Copy(ENGINE.plugins,ctx);
				
				if (ctx.require) 
					ENGINE.plugins.MATH.import( ctx.require );

				ENGINE.plugins.MATH.eval(ctx.code,ctx);

				//Trace({ma: ctx});
				cb( null, ctx );
			},
			
			sq:  function sqInit(name,code,ctx,cb) {
				ENGINE.thread( function (sql) {
					ctx.SQL[ctx.action](sql, [], function (recs) {
						ctx.tau = [1,2,3];  // cant work as no cb exists
					});
				});
				
				return null;	
			}
		},
			
		step: {  // step engines on thread name
			py: function pyStep(name,code,ctx) {
				if ( err = ENGINE.python(name,code,ctx) )
					return ENGINE.errors[err] || ENGINE.errors.badCode;
				else
					return null;
			},
			
			cv: function cvStep(name,code,ctx) {
				if ( err = ENGINE.opencv(name,code,ctx) )
					return ENGINE.errors[err] || ENGINE.errors.badCode;
				else 
					return null;
			},
			
			js: function jsStep(name,code,ctx) {
				var vmctx = ENGINE.context[name];

				if ( vmctx )
					if (vmctx.port) 
						if ( port = vmctx[vmctx.port] ) {
							port( ctx, function (rtn) {
								vmctx.tau = rtn;
							});
							return null;
						}
				
						else 
							return ENGINE.errors.badPort;
					
					else {
						VM.runInContext(vmctx.code,vmctx);
						return null;
					}
				
				else 
					return ENGINE.errors.lostContext;
			},
			
			ma: function maStep(name,code,ctx) {
				ENGINE.plugins.MATH.eval(ctx.code,ctx);

				//Trace({R:ctx.R, A:ctx.A, X:ctx.X});
				return null;
			},
			
			sq: function sqStep(name,code,ctx) {

				ctx.SQL = {};
				ctx.ports = ctx.ports || {};

				VM.runInContext(code,ctx);

				ENGINE.app.select[name] = function (req,cb) { ctx.SQL.select(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.insert[name] = function (req,cb) { ctx.SQL.insert(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.delete[name] = function (req,cb) { ctx.SQL.delete(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.update[name] = function (req,cb) { ctx.SQL.update(req.sql,[],function (recs) {cb(recs);}); }

				return null;	
			}			
		}
			
	});

function Trace(msg,arg) {
	ENUM.trace("E>",msg,arg);
}
	
// UNCLASSIFIED
