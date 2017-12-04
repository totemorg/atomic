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
	NET = require("net"),
	VM = require("vm");
	
var 														// Totem modules
	ENUM = require("enum"),
	Copy = ENUM.copy,
	Each = ENUM.each,
	Log = console.log;
	
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
	
			Trace(`CONFIG ENGINES`);

			if (opts) Copy(opts,ENGINE);

			if (CLUSTER.isMaster) {
				/*var ipcsrv = NET.createServer( function (c) {
					L("srv got connect");
					c.on("data", function (d) {
						L("srv got data",d);
					});
					c.on("end", function () {
						L("srv got end");
					});
					//c.pipe(c);
					//c.write("your connected");
				});
				ipcsrv.listen("/tmp/totem.sock");*/
				
				/*
				var sock = ENGINE.ipcsocket = NET.createConnection("/tmp/totem.sock", function () {
					console.log("connected?");
				});
				sock.on("error", function (err) {
					console.log("sockerr",err);
				});
				sock.on("data", function (d) {
					console.log("got",d);
				}); */
			}
			
			if (thread = ENGINE.thread)
				thread( function (sql) { // compile engines defined in engines DB

					// Using https generates a TypeError("Listener must be a function") at runtime.
					
					process.on("message", function (req,socket) {  // cant use CLUSTER.worker.process.on

						if (req.action) { 		// process only our messages (ignores sockets, etc)
							if (CLUSTER.isWorker) {
								console.log("CORE"+CLUSTER.worker.id+" GRABBING "+req.action);
	//console.log(req);							
								if ( route = ENGINE[req.action] ) 
									ENGINE.thread( function (sql) {
										req.sql = sql;  
										//delete req.socket;
										route( req, function (tau) {
											console.log( "sending " + JSON.stringify(tau));
											sql.release();
											socket.end( JSON.stringify(tau) );
										});
									});

								else
									socket.end( ENGINE.errors.badRequest+"" );  
							}
							
							else {
							}
								
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
			RAND: require("randpr"),
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
			badProgram: new Error("engine failed to program"),
			badRequest: new Error("worker does not understand request")
		},
			
		context: {},  // engine contexts
		vmcontext: {},  // js-engine wrapper contexts
			
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

		program: function (sql, ctx, cb) {  //< callback cb(ctx) with programed engine context or null if error
			if ( initEngine = ctx.init )
				ENGINE.prime(sql, ctx.state, function (state) {  // prime its state via sql
					//console.log({primeeng: state});
					
					if (state) 
						initEngine(ctx.thread, ctx.code || "", state, function (err, state) {
							//console.log({initeng: err});
							cb( err ? null : ctx );
						});
					
					else
						cb( null );
				});
							   
			else
				cb( null );
		},
			
		run: function (req, cb) {  // callback cb(ctx, step) with engine context and a stepper, or with nulls if error. 
		// req = { group, table, client, query, body, action, state }
		// if a req.state is not provided, then the engine is programmed.
			
		/**
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
			
			var
				sql = req.sql,
				thread = `${req.client}.${req.table}.${req.body.thread || 0}`;

			Log("def eng thread", req.client, req.table, req.body.thread, "-->", thread);
			
			function CONTEXT (thread) {  // create new engine context for provided thread name
				this.worker = CLUSTER.isMaster
					? CLUSTER.workers[ 1 + Math.floor(Math.random() * ENGINE.cores) ]
					: CLUSTER.worker;
				
				this.thread = thread;
				this.state = null;
				/*
				var sock = this.socket = NET.connect("/tmp/totem."+thread+".sock");
				sock.on("data", function (d) {
					console.log("thread",this.thread,"rx",d);
				}); 
				sock.write("hello there");*/
				
			}
						
			function exec(ctx, cb) {  //< callback cb(ctx,stepcb) with revised engine ctx and stepper
				Copy( Copy( req.query, { // add query context and default taus to the engine's state context
					tau: req.body.tau || []
					//port: req.body.port || ""
				} ), ctx.state );	

				cb( ctx.state, function () {  // callback with engine its state context and this stepper

					if ( stepEngine = ctx.step )
						try {  	// step the engine -  return an error if it failed or null if it worked
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

				});
			}

			function handoff(ctx, cb) {  //< handoff ctx to worker or  cb(null) if handoff fails
				var 
					horeq = {  // light-weight handoff request (no sql, socket, state etc that ipc cannot and shall not handle)
						group: req.group,
						table: req.table,
						client: req.client,
						query: req.query,
						body: req.body,
						action: req.action
					};
				
				if ( CLUSTER.isWorker )   // handoff thread to master
					process.send(horeq, req.resSocket() );

				else
				if ( worker = ctx.worker )  //handoff thread to worker 
					worker.send(horeq, req.resSocket() );
				
				else // cant handoff 
					cb( null );
			}
			
			function init(ctx, cb) {  //< initialize engine then callback cb(ctx,stepper) or cb(null) if failed
				
				ENGINE.getContext( req, function (ctx) {
					if (ctx) 
						ENGINE.program( sql, ctx, function (ctx) {
							if (ctx) // all went well so take it
								exec( ctx, cb );

							else  // failed to compile
								cb( null );
						});

					else
						cb( null );
				});
			}				

			//console.log(thread, CLUSTER.isMaster, ENGINE.context[thread] ? "ctx":"noctx");
			
			if ( CLUSTER.isMaster )  // on master so assign / handoff to worker
				if ( ctx = ENGINE.context[thread] ) // handoff to assigned worker
					if (ENGINE.cores)
						handoff( ctx, cb );
			
					else
					if ( ctx.state )  // was sucessfullly linitialized so can execute it
						exec( ctx, cb );

					else  // had failed initialization so must reject
						cb( null );

				else { // assign a worker then handoff
					var ctx = ENGINE.context[thread] = new CONTEXT(thread);
					if (ENGINE.cores) 
						handoff( ctx, cb );
					
					else
						init( ctx, cb );
				}

			else // on worker 
			if ( ctx = ENGINE.context[thread] ) {  // run it if worker has an initialized context
				Trace( `RUN core-${ctx.worker.id} FOR ${ctx.thread}`, sql );
				if ( ctx.state )  // was sucessfullyl initialized so can execute it
					exec( ctx, cb );

				else  // had failed initialization so must reject
					cb( null );
			}

			else { // worker must initialize its context, then run it
				var ctx = ENGINE.context[thread] = new CONTEXT(thread);
				Trace( `INIT core-${ctx.worker.id} FOR ${ctx.thread}` );
				init( ctx, cb );
			}

		},

		save: function (sql,taus,port,engine,saves) {
		/**
		 * @method save
		 * @member ENGINE
		 * 
		 * Save tau job files.
		*/
			
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
		
		returns: function (context) {  //< legacy
		/**
		 * @method returns
		 * Return tau parameters in matrix format
		 * */
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
			ENGINE.run(req, function (ctx,step) {
//console.log(">step ",ctx);
				if ( ctx ) 
					res( step() || JSON.stringify( ctx.tau || "[]" ) ); 
				
				else
					res( ENGINE.errors.badThread );
			});
		},
			
		delete: function (req,res) {	// free a stateful engine
			ENGINE.run(req, function (ctx,step) {
//console.log(">kill ",ctx);

				res( ctx ? "" : ENGINE.errors.badThread );				
			});
		},
			
		select: function (req,res) {	// run a stateless engine 
			ENGINE.run( req, function (ctx, step) {
//console.log(">run", ctx);
				
				if (ctx) 
					res( step() || ctx.tau );
				
				else
					res( ENGINE.errors.noStepper );
			});
		},
			
		update: function (req,res) {	// compile a stateful engine
			ENGINE.run( req, function (ctx,step) {
//console.log(">init",ctx);

				res( ctx ? "" : ENGINE.errors.badThread );
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

		getEngine: function (sql, group, name, cb) {  //< callback cb(eng) with unique engine or null if failed
			
			sql.query(
				"SELECT * FROM ??.engines WHERE least(?) LIMIT 0,1", [ group, {
					Name: name,
					Enabled: true
			}], function (err, engs) {
				
				if (err) 
					cb( null );
				
				else
				if ( isEmpty = engs.each() )
					cb( null );
				
				else
					cb( engs[0] );
			});
		},
			
		getContext: function (req, cb) { //< prime engine context then callback cb(ctx) with context or null if failed
			
			ENGINE.getEngine(req.sql, req.group, req.table, function (eng) {
				if (eng) {
					
					Log(eng);
					
					var ctx = {
						state: {
							group: req.group,
							table: req.table,
							client: req.client,
							query: req.query,
							body: req.body,
							action: req.action
						},
						type: eng.Type, 
						code: eng.Code,
						init: ENGINE.init[ eng.Type ],
						step: ENGINE.step[ eng.Type ]
					};
					
					try {  // prime its state
						Copy( JSON.parse(eng.State), ctx.state );
					}

					catch (err) {
					}

					cb(ctx);
				}
				
				else
					cb( null );

			});

		},
			
		init: {  // program engines on given thread 
			py: function pyInit(thread,code,ctx,cb)  {
				if ( !ctx.ports ) ctx.ports = {};
				
				cb( ENGINE.python(thread,code,ctx), ctx );
			},
			
			cv: function cvInit(thread,code,ctx,cb)  {
				if ( ctx.frame && ctx.detector )
					if ( err = ENGINE.opencv(thread,code,ctx) )
						cb( null, ctx );
				
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
			
			mw: function mwInit(thread,code,ctx,cb) {
				
				Log(thread,code,ctx);
				
				var 
					fn = thread.replace(/\./g,"_"),
					fp = "./public/matlab/",
					fq = fp + "queue.m",
					fm = fp + fn + ".m",
					fs = fp + fn + ".mat",
					fc = [];
				
				FS.writeFile(fm, code, "utf8");
				
				Each(ctx, function (key,val) {
					fc.push(`'${key}'`);
					fc.push(val); 
				});
				
				ENGINE.watchFile(fs, function (action) {
					Log("matlab init done",action,"ctx = read then cb");
					FS.writeFile(fq, "", "utf8");
					cb(null,ctx);
				});
				
				FS.writeFile(fq, `${fn}(struct(${fc.join(',')}, @(d) save('${fs}', 'd', '-ascii') );`, "utf8");

			},
			
			ma: function maInit(thread,code,ctx,cb) {

				Copy(ENGINE.plugins, ctx);
				
				if (ctx.require) 
					ENGINE.plugins.MATH.import( ctx.require );

				ENGINE.plugins.MATH.eval(code,ctx);

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
			
			sh: function shInit(thread,code,ctx,cb) {  // Linux shell engines
				if (code) context.code = code;

				CP.exec(context.code, function (err,stdout,stderr) {
					Log(err || stdout);
				});

				return null;
			}			
		},
			
		step: {  // step engines on given thread 
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
			
			mw: function mwStep(thread,code,ctx) {
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
			
			sh: function shStep(thread,code,ctx) {  // Linux shell engines
				if (code) context.code = code;

				CP.exec(context.code, function (err,stdout,stderr) {
					Trace(err || stdout);
				});

				return null;
			}			
		}
			
	});

function Trace(msg,sql) {
	ENUM.trace("E>",msg,sql);
}
	
// UNCLASSIFIED
