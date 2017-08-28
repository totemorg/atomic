// UNCLASSIFIED

/**
 * @class ENGINE
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
		
		/**
		@cfg {Object}
		@private
		@member ENGINE
		Paths to various things.
		*/
		paths: {
			jobs: "./jobs/"
		},
		
		/**
		@cfg {Function}
		@private
		@member ENGINE
		@method thread
		Start a sql thread
		*/
		thread: null,
		
		/**
		@cfg {Number}
		@member ENGINE
		Number of worker cores (aka threads) to provide in the cluster.  0 cores provides only the master.
		*/
		cores: 0,  //< number if cores: 0 master on port 8080; >0 master on 8081, workers on 8080
			
		/**
		@cfg {Number}
		@private
		Next available core
		*/
		nextcore: 0,
		
		/**
		@cfg {Object}
		@method config
		@member ENGINE
		Configure are start the engine interface, estblish worker core connections
		*/
		config: function (opts) {  // configure with options
	
			Trace(`Engines configured`);

			if (opts) Copy(opts,ENGINE);

			if (thread = ENGINE.thread)
				thread( function (sql) { // compile engines defined in engines DB

					/*
					function compileEngine(engine, name, code, res) {
						try {
							VM.runInContext( "FLEX."+engine+"."+name+"="+code, VM.createContext({FLEX:FLEX})  );

							if (res) res("ok");
						}
						catch (err) {
							if (res) res(new Error(err+""));
						}
					}	
					*/
					
					sql.query("DELETE FROM app.simcores", function (err) {
						Trace(err || "RESET ENGINE CORES");
					});

					ENGINE.nextcore = ENGINE.cores ? 1 : 0;

					if (CLUSTER.isWorker) 	
						CLUSTER.worker.process.on("message", function (ctx,socket) {
							
							if (ctx.state) { 		// process only tau messages (ignores sockets, etc)
								ctx.init = ENGINE.init[ ctx.type ];
								ctx.step = ENGINE.step[ ctx.type ];
								Trace("GRAB "+ctx.thread+" ON " +ctx.wid);

								switch ( ctx.action ) {
									case "update": 
										ENGINE.thread( function (sql) {
											ENGINE.program( sql, ctx, function (ctx) {
												if (ctx)
													socket.end( "" );
												else
													socket.end( "worker failed engine program" );
											});
										});
										break;
										
									case "delete":
									case "select":
										socket.end( "worker tbd" );
										break;
										
									case "insert":
										var err = ENGINE.advance(ctx);
										socket.end( err ? "worker failed engine step" : JSON.stringify( ctx.state.tau || null ) );
										break;
										
									default:
										socket.end( "bad worker action" );
										
								}
								/*ENGINE.thread(function (sql) {
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
										*/

							}
						});
				});

			return ENGINE;
		},

		flex: null,
		
		/**
		@cfg {Object}
		@member ENGINE
		Modules to share accross all js-engines
		*/
		plugins: {  // plugins libs available to all engines
			MATH: require('mathjs'),
			LWIP: require('graceful-lwip'),
			DSP: require('digitalsignals'),
			CRYPTO: require('crypto'),
			RAN: require("randpr"),
			SVD: require("node-svd"),
			MLE: require("expectation-maximization"),
			MVN: require("multivariate-normal"),
			CON: console,
			console: console,
			JSON: JSON
		},
			
		/**
		@cfg {Object}
		@private
		@member ENGINE
		Error messages
		*/
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
			badError: new Error("engine returned invalid code"),
			lostContext: new Error("engine context lost"),
			noStepper: new Error("engine does not exist, is disabled, or has no context"),
			badStep: new Error("engine step faulted"),
			badContext: new Error("engine context bad"),
			badProgram: new Error("engine failed to program")
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

		advance: function (ctx) {
			if ( stepEngine = ctx.step )
				try {  	// step the engine
					// dont  combine err with return because of order of evaluations
					//console.log( stepEngine, ctx.type, ENGINE.step[ctx.type] );
					var err =  stepEngine(ctx.thread, ctx.code, ctx.state); 
					return err ? ENGINE.errors[err] || ENGINE.badError : null;
				}

				catch (err) {
					return err;
				}

			else 
				return ENGINE.errors.noStepper;
		},
			
		program: function (sql, ctx, cb) {  //< callback cb(ctx) with programed engine context or null if error
			ctx.state = {};
			try {  // prime its state
				ctx.state = JSON.parse(ctx.state) || {};
				if (ctx.state.constructor != Object) ctx.state = {};
			}

			catch (err) {
				Trace(err);
			}
			
			if ( initEngine = ctx.init )
				ENGINE.prime(sql, ctx.state, function (state) {  // prime its state via sql
					
					if (state) 
						initEngine(ctx.thread, ctx.code || "", state, function (err, ctx) {
							cb( err ? null : ctx );
						});
					
					else
						cb( null );
				});
							   
			else
				cb( null );
		},
									   
		/**
		* @method allocate
		* @member ENGINE
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
		getCore: function (sql, ctx, cb) {  // callback cb(ctx) with existing/new engine context or null if error
			sql.query("SELECT * FROM ??.simcores WHERE Thread=? LIMIT 0,1", [
				ctx.group, ctx.thread
			], function (err,cores) {
				if (err) 
					cb( null );

				else {
					var isEmpty = cores.each( function (n, core, isLast) {
						if (isLast) 
							cb( Copy( { wid: core.wid }, ctx) );
						else
							cb( null );
					});

					if (isEmpty)  { // assign a core
						cb( Copy( {
								wid:  CLUSTER.isMaster 			// request is on the master
											? ENGINE.cores 			// provide stateful worker
													? ENGINE.nextcore++ % ENGINE.cores   // use next core then advance
													: 0			// no cores so use master

											:  CLUSTER.worker.id  	// provide stateless worker
						}, ctx ));

						Trace("WORKER "+ctx.wid+" ASSIGNED TO "+ctx.thread);
						
						sql.query("INSERT INTO ??.simcores SET ?", [
							ctx.group, {
							thread: ctx.thread,
							wid: ctx.wid
						}]);
					}
				}
			});
		},

		/*
		call: function (ctx,cb) { // Call (compile and/or step) an engine with callback cb(context) in its context.

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
		} */
								
		allocate: function (sql, req, cb) {  // callback cb(ctx); context ctx null if thread dropped; no cb if handoff
			var 
				ctx = {
					state: Copy(req.query, {
						tau: req.body.tau || [],
						port: req.body.port || "",					
						port: ""
					}),
					group: req.group,
					name: req.table,
					thread: `${req.client}.${req.table}.${req.type}.${req.body.thread || "0"}`
				};

			/*
			Get assocated engine core if already allocated; otherwise allocate a new core.  We keep the
			cores in a sql table so that all cluster workers have a common place to access engine
			cores, thus allowing the engine to stay on the same worker core.  In this way, we can
			step the engine on the same thread (hence state) is was compiled on.  If no thread is
			specified (e.g. when engine called outside a workflow), then the engine will be forced
			to recompile itself.
			*/
			ENGINE.getEngine( sql, ctx, function (ctx) {
				if (ctx)
					ENGINE.getCore( sql, ctx, function (ctx) {  // run(args,core,cb)
						
						if (ctx) {
							var mywid = CLUSTER.isMaster ? 0 : CLUSTER.worker.id;

							console.log({ismas:CLUSTER.isMaster, ctxwid:ctx.wid, mywid: mywid, cores:ENGINE.cores, next:ENGINE.nextcore});

							if ( ctx.wid == mywid )   	// was assigned to this stateful worker/master
								cb( ctx );

							else
								if ( mywid ) 		// im a worker so I dont know about other workers (req made on 8080) 
									cb( null ); 

								else 				// im the master so I know about my workers
								if ( worker = CLUSTER.workers[ ctx.wid ] ) {		// let assigned stateful engine respond on this socket
									delete ctx.init;
									delete ctx.step;
									ctx.action = req.action;
									worker.send( ctx, req.connection );
								}

								else // naughty worker dropped its thread
									cb( null ); 
						}
						
						else
							cb( null );
					});
								   
				else
					cb( null );
			});	
		},

		/**
		 * @method save
		 * @member ENGINE
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
		returns: function (context) {  //< legacy
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
		 * @method insert(step)
		 * @method delete(kill)
		 * @method select(read)
		 * @method update(init)
		 * 
		 * Provide methods to step/insert/POST, compile/update/PUT, run/select/GET, and free/delete/DELETE and engine.
		*/
		insert: function (req,res) {	// step a stateful engine
			var sql = req.sql;
			ENGINE.allocate(sql, req, function (ctx) {
console.log([">step ",ctx]);
				if ( ctx ) {
					var err = ENGINE.advance( ctx );
					res( err ? (ENGINE.errors[err] || ENGINE.errors.badError)+"" : JSON.stringify( ctx.state.tau || "[]" ) ); 
				}
				
				else
					res( ENGINE.errors.badThread );
				
			});
		},
			
		delete: function (req,res) {	// free a stateful engine
			var sql = req.sql;
			ENGINE.allocate(sql, req, function (ctx) {
console.log([">kill ",ctx]);

				if (ctx)  {
					sql.query("DELETE FROM ??.simcores WHERE Thread=?", [ctx.group,ctx.thread]);
					res( ctx ? "" : ENGINE.errors.hadFault+"" ); 
				}
				
				else
					res( ENGINE.errors.badThread );				
			});
		},
			
		select: function (req,res) {	// run a stateless engine 
			var 
				sql = req.sql,
				ctx = {
					thread: req.client.replace(/\./g,"") + "." + req.table,
					group: req.group,
					name: req.table,
					state: req.query
				};

			ENGINE.run( sql, ctx, function (step) {
				if (step)
					if ( err = step(ctx) )
						res( err );
					else 
						res( ctx.state.tau );
				
				else
					res( ENGINE.errors.noStepper );
			});
		},
			
		update: function (req,res) {	// compile a stateful engine
			var sql = req.sql;
			ENGINE.allocate( sql, req, function (ctx) {
console.log([">init",ctx]);

				if ( ctx )
					ENGINE.program(sql, ctx, function (ctx) {
						res( ctx ? "" : ENGINE.errors.badProgram+"" ); 
					});
				
				else
					res( ENGINE.errors.badThread );
			
			});
		},
			
		prime: function (sql, ctx, cb) {  //< callback cb(ctx) with state ctx primed by sql entry/exit keys
		/**
		@method prime

		Callback engine cb(ctx) with its state ctx primed with state from its ctx.entry, then export its 
		ctx state specified by its ctx.exit.
		The ctx.sqls = {var:"query...", ...} || "query..." enumerates the engine's ctx.entry (to import 
		state into its ctx before the engine is run), and enumerates the engine's ctx.exit (to export 
		state from its ctx after the engine is run).  If an sqls entry/exit exists, this will cause the 
		ctx.state = [var, ...] list to be built to synchronously import/export the state into/from the 
		engine's context.
		 * */
			var keys = ctx.keys;
			
			if (keys) {    	  // enumerate over each sqls key
				if ( keys.length ) { 							// more keys to import/export
					var 
						key = keys.pop(), 					// var to import/export
						query = ctx.sqls[key]; 	// sql query to import/export

					if (typeof query != "string") {
						query = query[0];
						args = query.slice(1);
					}

		//Trace([key,query]);

					if (ctx.sqls == ctx.entry) {  	// importing this var into the ctx
						var data = ctx[key] = [];
						var args = ctx.query;
					}
					
					else { 									// exporting this var from the ctx
						var data = ctx[key] || [];
						var args = [key, {result:data}, ctx.query];
					}

		//Trace(JSON.stringify(args));

					sql.query(query, args, function (err, recs) { 	// import/export this var

		//Trace([key,err,q.sql]);

						if (err) {
							ctx.err = err;
							ctx[key] = null;
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
				
				else 					// no more keys to load
				if (cb) {				// run engine in its ctx
					cb(ctx);

					if (ctx.exit) {	// save selected engine ctx keys
						var sqls = ctx.sqls = ctx.exit;
						var keys = ctx.keys = []; for (var n in sqls) keys.push(n);

						ENGINE.prime(sql,ctx);
					}
				}
			}
			
			else
			if (ctx.entry) {  // build ctx.keys from the ctx.entry sqls
				var sqls = ctx.sqls = ctx.entry;
				
				if (sqls.constructor == String)   // load entire ctx
					sql.query(sqls)
					.on("result", function (rec) {
						cb( Copy(rec, ctx) );
					});
				
				else {  // load specific ctx keys
					var keys = ctx.keys = []; 
					for (var key in sqls) keys.push(key);
				}

				ENGINE.prime(sql, ctx, cb);
			}
			
			else
				cb(ctx);
		},

		getEngine: function (sql, ctx, cb) { //< callback cb(ctx) with engine defined by its context
			
			sql.query(
				"SELECT * FROM ??.engines WHERE least(?) LIMIT 0,1", [ ctx.group, {
					Name: ctx.name,
					Enabled: true
			}], function (err, engs) {
				
				if (err) 
					cb( null );
				
				else 
					if ( isEmpty = engs.each( function (n, eng, isLast) {
						
						if (isLast) cb( Copy({
							type: eng.Type, 
							state: eng.State,
							code: eng.Code,
							init: ENGINE.init[ eng.Type ],
							step: ENGINE.step[ eng.Type ]
						}, ctx));
						
					}) ) cb( null );
			})

		},
			
		run: function (sql, ctx, cb) { //< callback cb(step) with its advance
			ENGINE.getEngine(sql, ctx, function (ctx) {		
				if (ctx)  // progam and advance it
					ENGINE.program(sql, ctx, function (ctx) {
						if (ctx) 
							cb( ENGINE.advance );
						
						else
							cb( null );
					});
			
				else
					cb( null );
			});
		},
			
		init: {  // program engines on thread name
			py: function pyInit(name,code,ctx,cb)  {
				if ( !ctx.ports ) ctx.ports = {};
				
				cb( ENGINE.python(name,code,ctx), ctx );
			},
			
			cv: function cvInit(name,code,ctx,cb)  {
				if ( ctx.frame && ctx.detector )
					if ( err = ENGINE.opencv(name,code,ctx) )
						cb( null, ctx );
						//cb( ENGINE.errors[err] || ENGINE.errors.badError, ctx );
				
					else
						cb( null, ctx );
				
				else
					cb( ENGINE.errors.badContext, ctx );
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

				Copy(ENGINE.plugins, ctx);
				
				if (ctx.require) 
					ENGINE.plugins.MATH.import( ctx.require );

				ENGINE.plugins.MATH.eval(code,ctx);

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
			},
			
			sh: function (name,port,tau,context,code) {  // Linux shell engines
				if (code) context.code = code;

				CP.exec(context.code, function (err,stdout,stderr) {
					Trace(err || stdout);
				});

				return null;
			}			
		},
			
		step: {  // step engines on thread name
			py: function pyStep(name,code,ctx) {
				if ( err = ENGINE.python(name,code,ctx) )
					return ENGINE.errors[err] || ENGINE.errors.badError;
				else
					return null;
			},
			
			cv: function cvStep(name,code,ctx) {
				
				if ( ctx.frame && ctx.detector )
					if ( err = ENGINE.opencv(name,code,ctx) )
						return ENGINE.errors[err] || ENGINE.errors.badError;
					
					else 
						return null;
				
				else
					return ENGINE.errors.badContext;
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
				ENGINE.plugins.MATH.eval(code,ctx);

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
			},
			
			sh: function (name,port,tau,context,code) {  // Linux shell engines
				if (code) context.code = code;

				CP.exec(context.code, function (err,stdout,stderr) {
					Trace(err || stdout);
				});

				return null;
			}			
		}
			
	});

function Trace(msg,arg) {
	ENUM.trace("E>",msg,arg);
}
	
// UNCLASSIFIED
