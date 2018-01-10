// UNCLASSIFIED

/**
 * @class ENGINE
 * @requires child_process
 * @requires fs
 * @requires crypto

 * @requires engineIF
 * @requires enum
 * @requires graceful-lwip
 * @requires liegroup
 
 * @requires mathjs
 * @requires digitalsignals
 * @requires nodehmm
 * @requires node-svd
 * @requires jsbayes
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
	Log = console.log,
	ENV = process.env;
	
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
		
		matlab: {
			path: {
				save: "./public/matlab/",
				agent: "http://totem.west.ile.nga.ic.gov:8080/matlab"
			},
				
			flush: function (sql,qname) {
				var
					agent = ENGINE.matlab.path.agent,
					fname = qname,
					mpath = ENGINE.matlab.path.save + fname + ".m",
					mcode = `disp(webread('${agent}?flush=${qname}'));` ;
								
				Trace("FLUSH MATLAB");
				
				sql.query("INSERT INTO openv.matlab SET ?", {
					queue: qname,
					script: mcode
				}, function (err) {

					sql.query("SELECT * FROM openv.matlab WHERE ? ORDER BY ID", {
						queue: qname
					}, function (err,recs) {

						FS.writeFile( mpath, recs.joinify("\n", function (rec) {
							return rec.script;
						}), "utf8" );

						sql.query("DELETE FROM openv.matlab WHERE ?", {
							queue: qname
						});
					});
				});
				
			},
			
			queue: function (qname, mcode) {
				
				ENGINE.thread( function (sql) {
					sql.query("INSERT INTO openv.matlab SET ?", {
						queue: qname,
						script: mcode
					});
					sql.release();
				});
			}
			
		},
			
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
			
			var em = ENGINE.plugins.MATH;
			
			em.import({
				isEqual: function (a,b) {
					return a==b;
				},
				disp: function (a) {
					console.log(a);
				}
			});
			
			if (thread = ENGINE.thread)
				thread( function (sql) { // compile engines defined in engines DB

					ENGINE.matlab.flush(sql, "init_queue");
					ENGINE.matlab.flush(sql, "step_queue");

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
		plugins: {  // js-engine plugins 
			MATH: require('mathjs'),
			IMAGE: require('graceful-lwip'),
			DSP: require('digitalsignals'),
			CRY: require('crypto'),
			RAN: require("randpr"),
			SVD: require("node-svd"),
			MLE: require("expectation-maximization"),
			MVN: require("multivariate-normal"),
			VITA: require("nodehmm"),
			LOG: console.log,
			JSON: JSON,			
			MAT: function (ctx,code) {
				var
					emctx = {},
					em = ENGINE.plugins.MATH;
				
				Each(ctx, function (key, val) {
					switch (val.constructor) {
						case Array:
							emctx[key] = em.matrix(val);
							break;

						default:
							emctx[key] = val;
					}
				});
							
				em.eval(code, emctx);
				
				Each(emctx, function (key, val) {
					if (val._data)
						ctx[key] = val._data;
					else
						ctx[key] = val;
				});
			}
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
			103: new Error("engine port invalid"),
			104: new Error("engine failed to compile"),
			105: new Error("engine exhausted thread pool"),
			106: new Error("engine received bad arguments"),
			badType: new Error("engine type not supported"),
			badPort: new Error("engine provided invalid port"),
			badError: new Error("engine returned invalid code"),
			lostContext: new Error("engine context lost"),
			badEngine: new Error("engine does not exist, is disabled, has invalid context, or failed to compile"),
			badStep: new Error("engine step faulted"),
			badContext: new Error("engine context invalid"),
			badRequest: new Error("engine worker handoff failed")
		},
			
		context: {},  // engine contexts
		vm: {},  // js-machines
			
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
			var runctx = ctx.req.query;
			
			if ( initEngine = ctx.init )
				ENGINE.prime(sql, runctx, function (runctx) {  // mixin sql vars into engine query
					//Log("eng prime", ctx.thread, runctx);
					
					if (runctx) 
						initEngine(ctx.thread, ctx.code || "", runctx, function (err) {
							//Log("eng init", err);
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
				query = req.query,
				thread = `${req.client}.${req.table}.${query.ID || 0}`;

			//Log("def eng thread", thread, req.query);
			
			function CONTEXT (thread) {  // engine context constructor for specified thread 
				this.worker = CLUSTER.isMaster
					? ENGINE.cores  
							? CLUSTER.workers[ Math.floor(Math.random() * ENGINE.cores) ]   // assign a worker
							: 0  // assign to master
					: CLUSTER.worker;  // use this worker
				
				this.thread = thread;
				this.req = null;
				/*
				var sock = this.socket = NET.connect("/tmp/totem."+thread+".sock");
				sock.on("data", function (d) {
					console.log("thread",this.thread,"rx",d);
				}); 
				sock.write("hello there");*/
				
			}
						
			function execute(ctx, cb) {  //< callback cb(ctx,stepcb) with revised engine ctx and stepper
				var 
					query = ctx.req.query,
					body = ctx.req.body,
					port = body.port || "",
					runctx = body.tau || query;
				
				cb( runctx, function (cb) {  // callback engine using this stepper

					if ( stepEngine = ctx.step )
						try {  	// step the engine then return an error if it failed or null if it worked
							var err =  stepEngine(ctx.thread, port, runctx, cb);
							
							return err ? ENGINE.errors[err] || ENGINE.badError : null;
						}

						catch (err) {
							return err;
						}

					else 
						return ENGINE.errors.badEngine;

				});
			}

			function handoff(ctx, cb) {  //< handoff ctx to worker or  cb(null) if handoff fails
				var 
					ipcreq = {  // ipc request must not contain sql, socket, state etc
						group: req.group,
						table: req.table,
						client: req.client,
						query: req.query,
						body: req.body,
						action: req.action
					};
				
				if ( CLUSTER.isWorker )   // handoff thread to master
					process.send(ipcreq, req.resSocket() );

				else
				if ( worker = ctx.worker )  //handoff thread to worker 
					worker.send(ipcreq, req.resSocket() );
				
				else // cant handoff 
					cb( null );
			}
			
			function initialize(ctx, cb) {  //< initialize engine then callback cb(ctx,stepper) or cb(null) if failed
				
				//Log("eng init",ctx.thread);
				ENGINE.setContext( req, ctx, function () {		// get engine context
					if (ctx) 
						ENGINE.program( sql, ctx, function (ctx) {	// program/initialize the engine
							if (ctx) // all went well so execute it
								execute( ctx, cb );

							else  // failed to compile
								cb( null );
						});

					else
						cb( null );
				});
			}				

			Log("eng thread", thread, CLUSTER.isMaster ? "on master" : "on worker", ENGINE.context[thread] ? "has ctx":"needs ctx");
			
			if ( CLUSTER.isMaster )  { // on master so handoff to worker or execute 
				if ( ctx = ENGINE.context[thread] ) // get context
					if (ENGINE.cores) // handoff to worker
						handoff( ctx, cb );
			
					else
					if ( ctx.req )  // was sucessfullly initialized so execute it
						execute( ctx, cb );

					else  // never initialized so reject it
						cb( null );

				else { // assign a worker to new context then handoff or initialize
					var ctx = ENGINE.context[thread] = new CONTEXT(thread);
					if (ENGINE.cores) 
						handoff( ctx, cb );
					
					else
						initialize( ctx, cb );
				}
			}
			
			else { // on worker 
				if ( ctx = ENGINE.context[thread] ) {  // run it if worker has an initialized context
					Trace( `RUN core-${ctx.worker.id} FOR ${ctx.thread}`, sql );
					if ( ctx.req )  // was sucessfullyl initialized so can execute it
						execute( ctx, cb );

					else  // had failed initialization so must reject
						cb( null );
				}

				else { // worker must initialize its context, then run it
					var ctx = ENGINE.context[thread] = new CONTEXT(thread);
					Trace( `INIT core-${ctx.worker.id} FOR ${ctx.thread}` );
					initialize( ctx, cb );
				}
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
					step( res );
				
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
					step( res );
				
				else
					res( ENGINE.errors.badEngine );
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
		ctx.req = [var, ...] list to be built to synchronously import/export the state into/from the 
		engine's context.
		 * */
			var keys = ctx.keys;
			
			if (keys) {    	  // enumerate over each sql key
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
							//ctx.err = err;
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
			
		setContext: function (req, ctx, cb) { //< prime engine context then callback cb(ctx) with context or null if failed
			
			ENGINE.getEngine(req.sql, req.group, req.table, function (eng) {
				if (eng) {
					
					try {  // add to context
						Copy({
							req: {  // http request 
								group: req.group,
								table: req.table,
								client: req.client,
								query: Copy( req.query, JSON.parse(eng.State || "null") || {} ),
								body: req.body,
								action: req.action
							},
							type: eng.Type, 
							code: eng.Code,
							init: ENGINE.init[ eng.Type ],
							step: ENGINE.step[ eng.Type ]
						}, ctx);
					}

					catch (err) {
					}

					//Log("eng get", ctx);
					
					cb(ctx);
				}
				
				else
					cb( null );

			});

		},
			
		gen: {
			debug: false,
			dbcon: {
				user: ENV.DB_USER,
				name: ENV.DB_NAME,
				pass: ENV.DB_PASS
			},				
			db: true,
			libs: true,
			code: true,
			port: true
		},
				
		init: {  // program engines on given thread 
			py: function pyInit(thread,code,ctx,cb)  {
				var 
					pycode = "", 
					gen = ENGINE.gen;
				
				if (gen.libs) { pycode += `
#import modules
#import caffe as CAFFE		#caffe interface
import mysql.connector as SQLC		#db connector interface
from PIL import Image as IMAGE		#jpeg image interface
import json as JSON			#json interface
import sys as SYS			#system info
` };

				/*
					mysql connection notes:
					install the python2.7 connector (rpm -Uvh mysql-conector-python-2.x.rpm)
					into /usr/local/lib/python2.7/site-packages/mysql, then copy
					this mysql folder to the anaconda/lib/python2.7/site-packages.

					import will fail with mysql-connector-python-X installed (rum or rpm installed as root using either
					python 2.2 or python 2.7).  Will however import under python 2.6.  To fix, we must:

							cp -R /usr/lib/python2.6/site-packages/mysql $CONDA/lib/python2.7/site-packages

					after "rpm -i mysql-connector-python-2.X".
					
					For some reaon, only two sql cursors are allowed.
				*/
				if (gen.db) { pycode += `
SQL = SQLC.connect(user='${gen.dbcon.user}', password='${gen.dbcon.pass}', database='${gen.dbcon.name}')
SQL0 = SQL.cursor(buffered=True)
SQL1 = SQL.cursor(buffered=True)
` };
				
				if (gen.debug) { pycode += `
#trace engine context
print 'py>locals', locals()
print 'py>sys', SYS.path, SYS.version
#print 'py>caffe',CAFFE
#print 'py>sql', SQL
print 'py>ctx',CTX
print 'py>port',PORT
` };

				if (gen.code) { pycode += `
#load dataset
Job = CTX['Job']
if Job:
	Query = Job['data']
	if Query:
		if Query.endswith(".jpg"):
			DATA = IMAGE.open(Query)

		elif Query.endswith(".json"):
			DATA = JSON.loads(Query)

		else:
			SQL0.execute(Query)
			DATA = []
			for (rec) in SQL0:
				DATA.append(rec)
	else:
		DATA = 0

else:
	DATA = 0
				
#engine logic
${code}

#save results
Job = CTX['Job']
if Job:
	Query = Job['res']
	Save = CTX.Save
	if Query:
		if Query.endswith(".jpg"):
			Save.save(Query, "jpg")
			CTX.Save = "saved"

		elif Query.endswith(".json"):
			fid = open(Query, "w")
			fid.write( JSON.dumps(Save) )
			fid.close()
			CTX.Save = "saved"

		else:
			SQL0.execute(Query,Save)
			CTX.Save = "saved"
` };
			
				if (gen.port) {
					var ports = Object.keys( ctx.ports || {} );

					ports.each( function (n,port) {
						ports[n] = port + ":" + port;
					});

					ports = "{" + ports.join(",") + "}";

					pycode += `
#stateful ports
PORTS=${ports}
if PORT:
	if PORT in PORTS:
		ERR = PORTS[PORT](TAU,CTX.ports[PORT])
	else:
		ERR = 103
else:
	ERR = 0
`;
				}				

				if (gen.db) { pycode += `
#exit code
SQL.commit()
SQL0.close()
SQL1.close()
` };

				Log("pycode",pycode);
				cb( ENGINE.python(thread,pycode,ctx), ctx );
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
				var 
					gen = ENGINE.gen,
					plugins = ENGINE.plugins,
					vm = ENGINE.vm[thread] = {
						ctx: VM.createContext( gen.libs ? plugins : {} ),
						code: ""
					},
					jscode = "";
					
				if (gen.debug) { jscode += `
// engine context trace
LOG("js>ctx", CTX);
` };
				
				if (gen.port) { jscode += `
// stateful port interface
if ( port = PORTS[PORT] ) ERR = port(TAU, CTX.ports[PORT]);
` };

				if (gen.code) { jscode += `
// engine logic
function onEntry(DATA) {
	${code}

	var save = CTX.Save || null;
	if (Job = CTX.Job)
		if ( Query = Job.save ) {
			RES("saved");
			if ( Query.endsWith(".json") )
				FS.writeFile( Query, JSON.stringify(save) );

			else
			if ( Query.endsWith(".jpg") )
				IMAGE.write( Query, save );

			else
				SQL.query( Query, save, function (err, info) {
				});
		}
		else
			RES(save);
	else 
		RES(save);
}

// request-response interface
if (Job = CTX.Job)
	if ( Query = Job.load )
		if ( Query.endsWith(".json") )
			FS.readFile( Query, function (err, buf) {
				try {
					onEntry( JSON.parse( buf ) );
				}
				catch (err) {
				}
			});

		else
		if ( Query.endsWith(".jpg") ) 
			IMAGE.open( Query , function (err, data) {
				if ( !err ) onEntry( data );
			});

		else
			SQL.query( Query, function (err, data) {
				if ( !err ) onEntry( data );
			});

	else 
		onEntry( null );

else
	onEntry( null );
`; }
				
				vm.code = jscode;
				Log(vm.code);
				
				cb( null, ctx );				
			},
			
			ma: function maInit(thread,code,ctx,cb) {
				
				var 
					fname = thread.replace(".ic.gov","").replace(/[@.]/g,"_"),
					agent = ENGINE.matlab.path.agent,
					spath = ENGINE.matlab.path.save,
					mpath = spath + fname + ".m",
					config = gen;
				
				FS.writeFile( mpath, `
function ws = ${fname}( )
	ws.set = @set;
	ws.get = @get;
	ws.step = @step;
	ws.send = @send;

	if ${gen.db}
		ws.db = database('${gen.dbcon.name}','${gen.dbcon.user}','${gen.dbcon.pass}');
	else
		ws.db = 0;
	end

	function set(key,val)
		ws.(key) = val;
	end

	function val = get(key)
		val = ws.(key);
	end

	function step(CTX)
		CTX.Save = []; 		% default results
		DATA = onEntry(CTX.Job.load);		% get dataset
		
		${code}			% engine logic

		onExit( CTX.Save, CTX.Job.save);
	end

	function send(val)
		onExit( val, "" );
	end

	function onExit(data, query)
		if query
			if endsWith(query, ".jpg")   % save jpeg file
				imwrite(data, query);

			elseif endsWith(query, ".json")  % use file system as json db
				fid = fopen(query, 'wt');
				fprintf(fid, '%s', jsonencode(data) );
				fclose(fid);
				webread( '${agent}?save=${fname}' );

			else		% db provided
				select(ws.db, query);

		else
			fid = fopen('${fname}.out', 'wt');
			fprintf(fid, '%s', jsonencode(data) );
			fclose(fid);
			webread( '${agent}?save=${fname}' );

		end
	end

	function data = onEntry(query)
		try
			if query
				if endsWith(query, '.jpg')
					data = imread(query);

				elseif endsWith(query, '.json')
					fid = fopen(query, 'rt');
					data = jsondecode(getl( fid ));
					fclose(fid);

				else
					if isstruct(ws.db)   % db provided
						data = select(ws.db, query);
					else
						data = [];
					end	

			else
				data = [];
		
		catch err
			data = [];
		end

	end

end`, "utf8" );

				ENGINE.matlab.queue( "init_queue", `ws_${fname} = ${fname}; \nws_${fname}.send(1);` );
				
				cb(null,ctx);
			},

			/*
			em: function emInit(thread,code,ctx,cb) {

				Copy(ENGINE.plugins, ctx);
				
				if (ctx.require) 
					ENGINE.plugins.MATH.import( ctx.require );

				ENGINE.plugins.MATH.eval(code,ctx);

				cb( null, ctx );
			},
			*/
			
			sq:  function sqInit(thread,code,ctx,cb) {
				ENGINE.thread( function (sql) {
					ctx.SQL[ctx.action](sql, [], function (recs) {
						ctx.Save = [1,2,3];  // cant work as no cb exists
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
			py: function pyStep(thread,port,ctx,cb) {
				if ( err = ENGINE.python(thread,port,ctx) ) {
					cb( null );
					return ENGINE.errors[err] || ENGINE.errors.badError;
				}
				else {
					cb( ctx.Save );
					return null;
				}
			},
			
			cv: function cvStep(thread,port,ctx,cb) {
				if ( ctx.frame && ctx.detector )
					if ( err = ENGINE.opencv(thread,code,ctx) )
						return ENGINE.errors[err] || ENGINE.errors.badError;
					
					else 
						return null;
				
				else
					return ENGINE.errors.badContext;
			},
			
			js: function jsStep(thread,port,ctx,cb) {
				if ( vm = ENGINE.vm[thread] ) 
					ENGINE.thread( function (sql) {
						Copy( {RES: cb, SQL: sql, CTX: ctx, DATA: [], PORT: port, TAU: ctx, PORTS: vm.ctx}, vm.ctx );
						
						VM.runInContext(vm.code,vm.ctx);
						return null;
					});
				
				else 
					return ENGINE.errors.lostContext;
			},
			
			ma: function maStep(thread,port,ctx,cb) {
				function arglist(x) {
					var rtn = [], q = "'";
					Each(x, function (key,val) {
						rtn.push(`'${key}'`);
						
						if (val)
							switch ( val.constructor ) {
								case Array:
								case Object:
									rtn.push( `jsondecode('${JSON.stringify(val)}')` ); break;
									
								case String: 
									rtn.push( q + val + q ); break;

								default:
									rtn.push(val || 0);
							}
						else
							rtn.push(0);
						
					});
					return `struct(${rtn.join(",")})`;
				}

				var 
					fname = thread.replace(".ic.gov","").replace(/[@.]/g,"_");
				
				ctx.Job = { load: "", save: "" };
				ENGINE.matlab.queue( "step_queue", `ws_${fname}.step(${arglist(ctx)});` );
				
				return null;
			},
			
			/*
			em: function meStep(thread,code,ctx) {
				if ( vm = ENGINE.vm[thread] )
					ENGINE.thread( function (sql) {
						Copy( {SQL: sql, CTX: ctx, DATA: [], RES: [], PORT: port, PORTS: vm.ctx}, vm.ctx );
						
						ENGINE.plugins.MATH.eval(vm.code,vm.ctx);
						return null;
					});
				
				else
					return ENGINE.errors.lostContext;					
			},
			*/
			
			sq: function sqStep(thread,port,ctx,cb) {

				ctx.SQL = {};
				ctx.ports = ctx.ports || {};

				VM.runInContext(code,ctx);

				ENGINE.app.select[thread] = function (req,cb) { ctx.SQL.select(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.insert[thread] = function (req,cb) { ctx.SQL.insert(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.delete[thread] = function (req,cb) { ctx.SQL.delete(req.sql,[],function (recs) {cb(recs);}); }
				ENGINE.app.update[thread] = function (req,cb) { ctx.SQL.update(req.sql,[],function (recs) {cb(recs);}); }

				return null;	
			},
			
			sh: function shStep(thread,port,ctx,cb) {  // Linux shell engines
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
