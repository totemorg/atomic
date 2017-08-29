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
					/*
					sql.query("DELETE FROM app.simcores", function (err) {
						Trace(err || "RESET ENGINE CORES");
					});*/

					ENGINE.nextcore = ENGINE.cores ? 1 : 0;

					if (CLUSTER.isWorker) 	
						CLUSTER.worker.process.on("message", function (req,socket) {
							
							function run(state, ctx) {
								Trace("CORE"+CLUSTER.worker.id+" RUNING ");
								Copy(state, ctx.state);
								
								switch ( ctx.action ) {
									case "update": 
										socket.end( "" );
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
							}
							
							if (req.action) { 		// process only tau messages (ignores sockets, etc)
								
								Trace("CORE"+CLUSTER.worker.id+" GRABBING "+req.thread+" FOR "+req.action);
								
								if ( ctx = ENGINE.context[req.thread] )
									run( req.state, ctx );
								
								else {
									var ctx = ENGINE.context[req.thread] = new Object(req);
									Trace("CORE"+CLUSTER.worker.id+" INITING "+req.thread);
									console.log( ENGINE.context );
									
									ENGINE.thread( function (sql) {
										Trace("CORE"+CLUSTER.worker.id+" PGMING "+req.thread);
										console.log({ctx:ctx});
										ENGINE.run( sql, ctx, function (step) {
											console.log({stepper: step});
											if (step)
												run( req.state, ctx );
											else
												socket.end( "worker failed to initialize" );
										});
									});										
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
		vmcontext: {},
			
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
			if ( initEngine = ctx.init )
				ENGINE.prime(sql, ctx.state, function (state) {  // prime its state via sql
					
					if (state) 
						initEngine(ctx.thread, ctx.code || "", state, function (err, state) {
							cb( err ? null : ctx );
						});
					
					else
						cb( null );
				});
							   
			else
				cb( null );
		},
					
		getCore: function (req, cb) {  // callback cb(ctx) with existing/new engine context or null if error
			var
				sql = req.sql,
				thread = `${req.client}.${req.table}.${req.type}.${req.body.thread || "0"}`,
				newctx = {
					thread: thread,
					action: req.action,
					group: req.group,
					name: req.table,
					state: Copy( req.query, {
						tau: req.body.tau || [],
						port: req.body.port || ""
					})
				},
				myid = CLUSTER.isMaster ? 0 : CLUSTER.worker.id;

			function run(ctx, cb) {
				Copy( newctx.state, ctx.state );	
				cb( ctx );
			}			
			
			if ( ctx = ENGINE.context[thread] ) {  // work/handoff this context thread
				
				newctx.id = ctx.id;
				if ( ctx.id == myid )  // its mine so work it
					run( ctx, cb);
			
				else 
				if ( !myid )  // the master can handoff	to workers
					if ( worker = CLUSTER.workers[ ctx.id ] )  //handoff to worker on this socket
						worker.send( newctx , req.connection );

					else  // handoff failed
						cb( null );
					
				else  // workers cant handoff
					cb( null );
			}
			
			else {  // create new context thread and work/handoff
				var ctx = {
					id: CLUSTER.isMaster	// let master allocate a worker
								? ENGINE.cores 
										? ENGINE.nextcore++ % ENGINE.cores  // use next worker
										: myid 					// no cores so use me

								: myid, // use me

					group: req.group,
					name: req.table,
					thread: thread
				};
				
				if ( ctx.id == myid)  {  // assigned to me so run it in its state context
					ENGINE.context[thread] = ctx;
					
					ENGINE.getState(sql, ctx, function (ctx) {   // try to get an engine to prime ctx.state
						if (ctx) 
							run( ctx, cb );
						else
							cb( null );
					});
				}
				
				else 
				if ( worker = CLUSTER.workers[ ctx.id ] ) 	//handoff to worker on this socket
					worker.send( newctx , req.connection );

				else  // handoff failed
					cb( null );					
			}
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
		/*
		Get assocated engine core if already allocated; otherwise allocate a new core.  We keep the
		cores in a sql table so that all cluster workers have a common place to access engine
		cores, thus allowing the engine to stay on the same worker core.  In this way, we can
		step the engine on the same thread (hence state) is was compiled on.  If no thread is
		specified (e.g. when engine called outside a workflow), then the engine will be forced
		to recompile itself.
		*/
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
			ENGINE.getCore(req, function (ctx) {
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
			ENGINE.getCore(req, function (ctx) {
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
					thread: `${req.client}.${req.table}.${req.type}.${req.body.thread || "0"}`,
					group: req.group,
					name: req.table,
					state: req.query
				};

			ENGINE.run( sql, ctx, function (step) {
				if (step) 
					if ( err = step( ctx ) )
						res( err );

					else 
						res( ctx.state.tau );
				
				else
					res( ENGINE.errors.noStepper );
			});
		},
			
		update: function (req,res) {	// compile a stateful engine
			ENGINE.getCore( req, function (ctx) {
console.log([">init",ctx]);

				if ( ctx )
					ENGINE.program( req.sql, ctx, function (ctx) {
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

		getState: function (sql, ctx, cb) { //< callback cb(ctx) with engine defined by its context
			
			sql.query(
				"SELECT * FROM ??.engines WHERE least(?) LIMIT 0,1", [ ctx.group, {
					Name: ctx.name,
					Enabled: true
			}], function (err, engs) {
				
				if (err) 
					cb( null );
				
				else {
					var isEmpty = engs.each( function (n, eng, isLast) {
						
						try {  // prime its state
							ctx.state = JSON.parse(eng.State) || {};
							if (ctx.state.constructor != Object) ctx.state = {};
						}

						catch (err) {
							ctx.state = {};
							//Trace(err);
						}

						if (isLast) cb( Copy({
							type: eng.Type, 
							code: eng.Code,
							init: ENGINE.init[ eng.Type ],
							step: ENGINE.step[ eng.Type ]							
						}, ctx ) );
						
					});
						
					if (isEmpty) cb( null );
				}
			})

		},
			
		run: function (sql, ctx, cb) { //< callback cb(step) with its advance
			
			ENGINE.getState( sql, ctx, function (ctx) {				
				if (ctx) 
					ENGINE.program( sql, ctx, function (ctx) {
						if (ctx) 
							cb( ENGINE.advance );

						else
							cb( null );
					});
				
				else
					cb( null );
			});
		},
			
		init: {  // program engines on thread thread
			py: function pyInit(thread,code,ctx,cb)  {
				if ( !ctx.ports ) ctx.ports = {};
				
				cb( ENGINE.python(thread,code,ctx), ctx );
			},
			
			cv: function cvInit(thread,code,ctx,cb)  {
				if ( ctx.frame && ctx.detector )
					if ( err = ENGINE.opencv(thread,code,ctx) )
						cb( null, ctx );
						//cb( ENGINE.errors[err] || ENGINE.errors.badError, ctx );
				
					else
						cb( null, ctx );
				
				else
					cb( ENGINE.errors.badContext, ctx );
			},
			
			js: function jsInit(thread,code,ctx,cb)  {
				var vmctx = ENGINE.vmcontext[thread] = VM.createContext( Copy(ENGINE.plugins, ctx) );
				
				VM.runInContext(code,vmctx);
				cb( null, ctx );
			},
			
			ma: function maInit(thread,code,ctx,cb) {

				Copy(ENGINE.plugins, ctx);
				
				if (ctx.require) 
					ENGINE.plugins.MATH.import( ctx.require );

				ENGINE.plugins.MATH.eval(code,ctx);

				//Trace({ma: ctx});
				cb( null, ctx );
			},
			
			sq:  function sqInit(thread,code,ctx,cb) {
				ENGINE.thread( function (sql) {
					ctx.SQL[ctx.action](sql, [], function (recs) {
						ctx.tau = [1,2,3];  // cant work as no cb exists
					});
				});
				
				return null;	
			},
			
			sh: function (thread,port,tau,context,code) {  // Linux shell engines
				if (code) context.code = code;

				CP.exec(context.code, function (err,stdout,stderr) {
					Trace(err || stdout);
				});

				return null;
			}			
		},
			
		step: {  // step engines on thread thread
			py: function pyStep(thread,code,ctx) {
				if ( err = ENGINE.python(thread,code,ctx) )
					return ENGINE.errors[err] || ENGINE.errors.badError;
				else
					return null;
			},
			
			cv: function cvStep(thread,code,ctx) {
				
				if ( ctx.frame && ctx.detector )
					if ( err = ENGINE.opencv(thread,code,ctx) )
						return ENGINE.errors[err] || ENGINE.errors.badError;
					
					else 
						return null;
				
				else
					return ENGINE.errors.badContext;
			},
			
			js: function jsStep(thread,code,ctx) {
				var vmctx = ENGINE.vmcontext[thread];

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
						VM.runInContext(code,vmctx);
						return null;
					}
				
				else 
					return ENGINE.errors.lostContext;
			},
			
			ma: function maStep(thread,code,ctx) {
				ENGINE.plugins.MATH.eval(code,ctx);

				//Trace({R:ctx.R, A:ctx.A, X:ctx.X});
				return null;
			},
			
			sq: function sqStep(thread,code,ctx) {

				ctx.SQL = {};
				ctx.ports = ctx.ports || {};

				VM.runInContext(code,ctx);

				ENGINE.app.select[thread] = function (req,cb) { ctx.SQL.select(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.insert[thread] = function (req,cb) { ctx.SQL.insert(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.delete[thread] = function (req,cb) { ctx.SQL.delete(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.update[thread] = function (req,cb) { ctx.SQL.update(req.sql,[],function (recs) {cb(recs);}); }

				return null;	
			},
			
			sh: function (thread,port,tau,context,code) {  // Linux shell engines
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
