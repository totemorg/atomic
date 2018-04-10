// UNCLASSIFIED

/**
 * @class ATOMIC
 * @requires child_process
 * @requires fs
 * @requires engineIF
 * @requires enum
 * @requires vm
 */

/* 
To Do:
+ add comments to config and methods
+ review and correct README.md
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
	ATOM = module.exports = Copy( //< extend the engineIF built by node-gyp
		require("./ifs/build/Release/engineIF"), {
		 
		/**
		@cfg {Object}
		@private
		@member ATOMIC
		Paths to various things.
		*/
		paths: {
			jobs: "./jobs/"
		},
		
		/**
		@cfg {Function}
		@private
		@member ATOMIC
		@method thread
		Start a sql thread
		*/
		thread: () => { Trace("sql thread not configured"); },  //< sql threader
		
		/**
		@cfg {Number}
		@member ATOMIC
		Number of worker cores (aka threads) to provide in the cluster.  0 cores provides only the master.
		*/
		cores: 0,  //< number if cores: 0 master on port 8080; >0 master on 8081, workers on 8080
			
		/**
		@cfg {Number}
		@private
		Next available core
		*/
		nextcore: 0,
		
		matlab: {  //< support for matlab engines
			path: {  //< file and service paths
				save: "./public/matlab/",
				agent: "http://totem.west.ile.nga.ic.gov:8080/matlab"
			},
				
			flush: function (sql,qname) {  //<  flush jobs in qname=init|step|... queue
				var
					agent = ATOM.matlab.path.agent,
					func = qname,
					path = ATOM.matlab.path.save + func + ".m",
					script = `disp(webread('${agent}?flush=${qname}'));` ;
								
				Trace("FLUSH MATLAB");
				
				sql.query("INSERT INTO openv.matlab SET ?", {
					queue: qname,
					script: script
				}, function (err) {

					sql.query("SELECT * FROM openv.matlab WHERE ? ORDER BY ID", {
						queue: qname
					}, function (err,recs) {

						FS.writeFile( path, recs.joinify("\n", function (rec) {
							return rec.script;
						}), "utf8" );

						sql.query("DELETE FROM openv.matlab WHERE ?", {
							queue: qname
						});
					});
				});
				
			},
			
			queue: function (qname, script) { //< append script job to qname=init|step|... queue
				
				ATOM.thread( function (sql) {
					sql.query("INSERT INTO openv.matlab SET ?", {
						queue: qname,
						script: script
					}, function (err) {
						Log("matlab queue", err);
					}).onEnd();
					//sql.release();
				});
			}		
		},
			
		/**
		@cfg {Object}
		@method config
		@member ATOMIC
		Configure are start the engine interface, estblish worker core connections
		*/
		config: function (opts) {  //< configure with options
	
			Trace(`CONFIG ATOMIC`);

			if (opts) Copy(opts,ATOM);

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
				var sock = ATOM.ipcsocket = NET.createConnection("/tmp/totem.sock", function () {
					console.log("connected?");
				});
				sock.on("error", function (err) {
					console.log("sockerr",err);
				});
				sock.on("data", function (d) {
					console.log("got",d);
				}); */
			}
			
			if (thread = ATOM.thread)
				thread( function (sql) { // compile engines defined in engines DB

					ATOM.matlab.flush(sql, "init_queue");
					ATOM.matlab.flush(sql, "step_queue");

					// Using https generates a TypeError("Listener must be a function") at runtime.

					process.on("message", function (req,socket) {  // cant use CLUSTER.worker.process.on

						if (req.action) { 		// process only our messages (ignores sockets, etc)
							if (CLUSTER.isWorker) {
								Trace("CORE"+CLUSTER.worker.id+" GRABBING "+req.action);
	//console.log(req);							
								if ( route = ATOM[req.action] ) 
									ATOM.thread( function (sql) {
										req.sql = sql;  
										//delete req.socket;
										route( req, function (tau) {
											Trace( "ipc sending " + JSON.stringify(tau));
											sql.release();
											socket.end( JSON.stringify(tau) );
										});
									});

								else
									socket.end( ATOM.errors.badRequest+"" );  
							}
							
							else {
							}
								
						}									
					});
				});

			return ATOM;
		},

		flex: null,
		
		/**
		@cfg {Object}
		@member ATOMIC
		Modules to share accross all js-engines
		*/
		plugins: {  // js-engine plugins 
		},
			
		/**
		@cfg {Object}
		@private
		@member ATOMIC
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
			
		tau: function (job) { // default source/sink event tokens when engine in stateful workflows
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

		program: function (sql, ctx, cb) {  //< program engine with callback cb(ctx) or cb(null) if error
			var runctx = ctx.req.query;
			
			if ( initEngine = ctx.init )
				ATOM.prime(sql, runctx, function (runctx) {  // mixin sql vars into engine query
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
			
		run: function (req, cb) {  //< run engine on its worker with callback cb(context, stepper) or cb(null) if error			
		/**
		@method run
		@member ATOMIC
		
		A run engine request contains:
		
				req = { group, table, client, query, body, action, state }

		If the engine's req.state is not provided, then the engine is programmed; otherwise it is stepped.
		
		Allocate the supplied callback cb(core) with the engine core that is/was allocated to a Client.Engine.Type.Instance
		thread as defined by this request (in the req.body and req.log).  If a workflow Instance is
		provided, then the engine is assumed to be in a workflow (thus the returned core will remain
		on the same compile-step thread); otherwise, the engine is assumed to be standalone (thus forcing
		the engine to re-compile each time it is stepped).
		 
		As used here (and elsewhere) the terms "process", "engine core", "safety core", and "worker" are 
		equivalent, and should not be confused with a physical "cpu core".  Because heavyweight 
		(spawned) workers run in their own V8 instance, these workers can tollerate all faults (even 
		core-dump exceptions). The lightweight (cluster) workers used here, however, share the same V8 
		instance.  Heavyweight workers thus provide greater safety for bound executables (like opencv and 
		python) at the expense of greater cpu overhead.  
		
		The goal of hyperthreading is to balance threads across cpu cores.  The workerless (master only)
		configuration will intrinsically utilize only one of its underlying cpu cores (the OS remains, 
		however, free to bounce between cpu cores via SMP).  A worker cluster, however, tends to 
		balance threads across all cpu cores, especially when the number of allocated workers exceeds
		the number of physical cpu cores.
		 
		Only the cluster master can see its workers; thus workers can not send work to other workers, only
		the master can send work to workers.  Thus hyperthreading to *stateful* engines can be supported
		only when master and workers are listening on different ports (workers are all listening on 
		same ports to provide *stateless* engines).  So typically place master on port N+1 (to server
		stateful engines) and its workers on port N (to serve stateless engines).  
		
		This method will callback cb(core) with the requested engine core; null if the core could not
		 be located or allocated.
		*/
			var
				sql = req.sql,
				query = req.query,
				client = req.client.replace(".ic.gov","").replace(/\./g,"").replace("@",""),
				thread = `${client}.${req.table}.${query.ID || 0}`;

			//Log("def eng thread", thread, req.query);
			
			function CONTEXT (thread) {  // engine context constructor for specified thread 
				this.worker = CLUSTER.isMaster
					? ATOM.cores  
							? CLUSTER.workers[ Math.floor(Math.random() * ATOM.cores) ]   // assign a worker
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
					sql = req.sql,
					query = ctx.req.query,
					body = ctx.req.body,
					port = body.port || "",
					runctx = body.tau || Copy( req.query, query);
				
				//Log("exe ctx",runctx);
				
				cb( runctx, function (res) {  // callback engine using this stepper

					if ( stepEngine = ctx.step )
						ATOM.prime(sql, runctx, function (runctx) {  // mixin sql vars into engine query
							//Log("prime ctx", runctx);
							
							try {  	// step the engine then return an error if it failed or null if it worked
								return ATOM.errors[ stepEngine(ctx.thread, port, runctx, res) ] || ATOM.badError;
							}

							catch (err) {
								return err;
							}

						});
					
					else 
						return ATOM.errors.badEngine;

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
				var
					sql = req.sql;
				
				//Log("eng init",req.query);
				
				ATOM.getEngine(req, ctx, function (ctx) {
					//Log("get eng", ctx);
					
					if (ctx) 
						ATOM.program(sql, ctx, function (ctx) {	// program/initialize the engine
							
							//Log("pgm eng", ctx);
							if (ctx) // all went well so execute it
								execute( ctx, cb );

							else  // failed to compile
								cb( null );
						});

					else
						cb( null );
				});
			}				

			Log("eng thread", thread, CLUSTER.isMaster ? "on master" : "on worker", ATOM.context[thread] ? "has ctx":"needs ctx");
			
			if ( CLUSTER.isMaster )  { // on master so handoff to worker or execute 
				if ( ctx = ATOM.context[thread] ) // get context
					if (ATOM.cores) // handoff to worker
						handoff( ctx, cb );
			
					else
					if ( ctx.req )  // was sucessfullly initialized so execute it
						execute( ctx, cb );

					else  // never initialized so reject it
						cb( null );

				else { // assign a worker to new context then handoff or initialize
					var ctx = ATOM.context[thread] = new CONTEXT(thread);
					if (ATOM.cores) 
						handoff( ctx, cb );
					
					else
						initialize( ctx, cb );
				}
			}
			
			else { // on worker 
				if ( ctx = ATOM.context[thread] ) {  // run it if worker has an initialized context
					Trace( `RUN core-${ctx.worker.id} FOR ${ctx.thread}`, sql );
					if ( ctx.req )  // was sucessfullyl initialized so can execute it
						execute( ctx, cb );

					else  // had failed initialization so must reject
						cb( null );
				}

				else { // worker must initialize its context, then run it
					var ctx = ATOM.context[thread] = new CONTEXT(thread);
					Trace( `INIT core-${ctx.worker.id} FOR ${ctx.thread}` );
					initialize( ctx, cb );
				}
			}

		},

		save: function (sql,taus,port,engine,saves) {
		/**
		@method save
		@member ATOMIC
		Save tau job files.
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

		insert: function (req,res) {	//< step a stateful engine
		/**
		 @method insert(step)
		 @member ATOMIC
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		*/
			ATOM.run(req, function (ctx,step) {
//Log(">step ",ctx);
				if ( ctx ) 
					step( res );
				
				else
					res( ATOM.errors.badThread );
			});
		},
			
		delete: function (req,res) {	//< free a stateful engine
		/**
		 @method delete(kill)
		 @member ATOMIC
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		*/
			ATOM.run(req, function (ctx,step) {
//Log(">kill ",ctx);

				res( ctx ? "" : ATOM.errors.badThread );				
			});
		},
			
		select: function (req,res) {	//< run a stateless engine callback res(context) or res(error)
		/**
		 @method select(read)
		 @member ATOMIC
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		*/
			ATOM.run( req, function (ctx, step) {  // get engine stepper and its context
//Log(">run", ctx);
				
				if (ctx)   // step engine
					step( res );
				
				else
					res( ATOM.errors.badEngine );
			});
		},
			
		update: function (req,res) {	//< compile a stateful engine
		/**
		 @method update(init)
		 @member ATOMIC		  
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		*/
			ATOM.run( req, function (ctx,step) {
//console.log(">init",ctx);

				res( ctx ? "" : ATOM.errors.badThread );
			});
		},
			
		prime: function (sql, ctx, cb) {  //< callback cb(ctx) with ctx primed by sql ctx.entry and ctx.exit queries
		/**
		@method prime
		@member ATOMIC

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

						ATOM.prime(sql,ctx,cb);
					});
				}
				
				else 					// no more keys to load
				if (cb) {				// run engine in its ctx
					cb(ctx);

					if (ctx.exit) {	// save selected engine ctx keys
						var sqls = ctx.sqls = ctx.exit;
						var keys = ctx.keys = []; for (var n in sqls) keys.push(n);

						ATOM.prime(sql,ctx);
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

				ATOM.prime(sql, ctx, cb);
			}
			
			else
				cb(ctx);
		},

		getEngine: function (req, ctx, cb) {  //< callback cb(ctx) with engine context or null if failed
			
			var
				sql = req.sql,
				group = req.group,
				name = req.table;
			
			//Log("eng get",name);
			sql.forFirst(
				"ENG",
				"SELECT * FROM ??.engines WHERE least(?) LIMIT 1", [ group, {
					Name: name,
					Enabled: true
			}], function (eng) {
				
				if (eng)
					try {  // define and return engine context
						cb( Copy({
							req: {  // http request to get and prime engine context
								group: req.group,
								table: req.table,
								client: req.client,
								query: Copy( // passed querey keys override engine state context
									req.query, 
									JSON.parse(eng.State || "null") || {} ),
								body: req.body,
								action: req.action
							},
							type: eng.Type,   // engine type: js, py, etc
							code: eng.Code, // engine code
							init: ATOM.init[ eng.Type ],  // method to initialize/program the engine
							step: ATOM.step[ eng.Type ]  // method to advance the engine
						}, ctx) );
					}

					catch (err) {  // failed
						cb( null );
					}
				
				else
					cb( null );
			});
		},
			
		gen: {  //< controls code generation when engine initialized/programed
			debug: false,
			trace: false,
			dbcon: {
				user: ENV.DB_USER,
				name: ENV.DB_NAME,
				pass: ENV.DB_PASS
			},				
			db: true,
			libs: true,
			code: true
		},
				
		init: {  //< initalize/program engine on given thread=case.plugin.client with callback cb(ctx) or ctx(null)
			py: function pyInit(thread,code,ctx,cb)  {
				function portsDict(portsHash) {
					var ports = Object.keys( portsHash );

					ports.each( function (n,port) {
						ports[n] = port + ":" + port;
					});

					return "{" + ports.join(",") + "}";
				}
					
				var 
					Thread = thread.split("."),
					Thread = {
						case: Thread.pop(),
						plugin: Thread.pop(),
						client: Thread.pop()
					},
					script = "", 
					gen = ATOM.gen,
					ports = portsDict( ctx.ports || {} ),
					logic = {  // flush-load-save-code logic
						flush: `
def FLUSH_bulk(ctx,rec,recs):
	return False

def FLUSH_discard(ctx,rec,recs):
	return True

def FLUSH_byStep(ctx,rec,recs):
	if len(recs):
		return (rec[ 't' ] -recs[0][ 't' ] ) > 1
	else:
		return False

def FLUSH_byDepth(ctx,rec,recs):
	return len(recs) < 1
`,

						save: `
def save(ctx):  #save results
	print "saving", ctx['Save']
`, 

						load: `
def GET_load(flush, ctx, cb):  #load dataset
	if 'Load' in ctx:
		Query = ctx['Load']
		if Query.startswith("/"):
			recs = []
			for (rec) in FETCH(query):
				if flush_byStep(ctx,rec,recs):
					print "FLUSH", len(recs)
					cb( recs )
					recs = []
				recs.append(rec)
			if len(recs):
				cb( recs )
			else:
				cb( 0 )
		elif Query:
			recs = []
			SQL0.execute(Query)
			for (rec) in SQL0:
				if flush_byStep(ctx,rec,recs):
					print "FLUSH", len(recs)
					cb( recs )
					recs = []
				recs.append(rec)
			print "FLUSH", len(recs)
			if len(recs):
				cb( recs )
			else:
				cb( 0 )
		else:
			cb( 0 )
	else:
		cb( 0 )

def GET_bulk(ctx, cb):
	GET_load( FLUSH_bulk, ctx, cb )

def GET_discard(ctx, cb):
	GET_load( FLUSH_discard, ctx, cb )

def GET_byStep(ctx, cb):
	GET_load( FLUSH_byStep, ctx, cb )

def GET_byDepth(ctx, cb):
	GET_load( FLUSH_byDepth, ctx, cb )
`  ,
				
				step: `
	os = locals()
	#print "os", os  # why is this dump required to make sql connector visibile to plugin ?
	plugin = os['${Thread.plugin}']
	ctx = os['CTX']
	port = os['PORT']
	ports = os['PORTS']
	if port:
		if port in ports:
			ports[port]( ctx['tau'], ctx['ports'][port] )
			ERR = 0
		else:
			ERR = 103
	else:
		plugin(ctx, save)
		ERR = 0 `					
					},
					Job = ctx.Job || {},
					script = "";
				
				Job.buffer |= 0;
				
				script += `
if INIT:
	INIT = 0  `;

				if (gen.libs) { script += `
	#import modules
	#import caffe as CAFFE		#caffe interface
	import mysql.connector as SQLC		#db connector interface
	from PIL import Image as LWIP		#jpeg image interface
	import json as JSON			#json interface
	import sys as SYS			#system info` }
				
				if (gen.db) { script += `
	#connect to db
	SQL = SQLC.connect(user='${gen.dbcon.user}', password='${gen.dbcon.pass}', database='${gen.dbcon.name}')
	SQL0 = SQL.cursor(buffered=True)
	SQL1 = SQL.cursor(buffered=True) ` }
				
				if (gen.debug) { script += `
	#trace engine context
	print 'py>locals', locals()
	print 'py>sys', SYS.path, SYS.version
	#print 'py>caffe',CAFFE
	#print 'py>sql', SQL
	#print 'py>ctx',CTX
	#print 'py>port',PORT` }

				if (gen.code) { script += `
# record buffering logic ${logic.flush}

# data saving logic ${logic.save}

# data loading logic ${logic.load}

# engine and port logic
${code}

PORTS = ${ports}

if not INIT:	${logic.step} 
` }
				
				if (false) { script += `
#exit code
SQL.commit()
SQL0.close()
SQL1.close()
` }

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
 			
				if (gen.trace) Log(script);

				cb( ATOM.python(thread,script,ctx), ctx );
			},
			
			cv: function cvInit(thread,code,ctx,cb)  {
				var 
					Thread = thread.split("."),
					Thread = {
						case: Thread.pop(),
						plugin: Thread.pop(),
						client: Thread.pop()
					},				
					gen = ATOM.gen,
					script = "",
					logic = {
						flush: "",						
						save: "",
						load: "",
						code: code,
						startup: ""
					};

				if ( ctx.frame && ctx.detector )
					if ( err = ATOM.opencv(thread,code,ctx) )
						cb( null, ctx );
				
					else
						cb( null, ctx );
				
				else
					cb( ATOM.errors.badContext, ctx );
			},
			
			js: function jsInit(thread,code,ctx,cb)  {
				var 
					Thread = thread.split("."),
					Thread = {
						case: Thread.pop(),
						plugin: Thread.pop(),
						client: Thread.pop()
					},				
					gen = ATOM.gen,
					script = "",
					vm = ATOM.vm[thread] = {
						ctx: VM.createContext( gen.libs ? Copy( ATOM.plugins, {} ) : {} ),
						code: ""
					};

				if (gen.debug) { script += `
// trace engine context
LOG("js>ctx", CTX);
` }

				if (gen.code) { script += `
// engine logic
${code}

if ( CTX )
	if ( port = PORTS[PORT] )   // stateful port processing
		ERR = port(CTX.tau, CTX.ports[PORT]);

	else  // stateless processing
		ERR = ${Thread.plugin}(CTX, RES);
` }

				if (gen.trace) Log(script);
				vm.code = script;
				
				cb( null, ctx );
			},
			
			m: function mInit(thread,code,ctx,cb) {
				
				var 
					Thread = thread.split("."),
					Thread = {
						case: Thread.pop(),
						plugin: Thread.pop(),
						client: Thread.pop()
					},
					func = thread.replace(/\./g,"_"),
					agent = ATOM.matlab.path.agent,
					path = ATOM.matlab.path.save + func + ".m",
					logic = {
						save: `
	function send(res)
		fid = fopen('${func}.out', 'wt');
		fprintf(fid, '%s', jsonencode(res) );
		fclose(fid);
		webread( '${agent}?save=${func}' );
	end

	function save(ctx)
		fid = fopen('${func}.out', 'wt');
		fprintf(fid, '%s', jsonencode(ctx.Save) );
		fclose(fid);
		webread( '${agent}?save=${func}' );
	end `,

						load: `
	function load(ctx, res)
		query = ctx._Load;
		ctx.Data = 0;

		try
			if length(query)>1
				ctx.Data = select(ws.db, query);
			end
		
		catch 
		end

		send(res);
	end `, 
						
						step: `
	function step(ctx)
		load(ctx, ${Thread.plugin}(ctx));

		% engine logic and ports
		${code}	
	end `
					},						
					script = "",
					gen = ATOM.gen;

				if (gen.code) { script += `
function ws = ${func}( )
	ws.set = @set;
	ws.get = @get;
	ws.step = @step;
	ws.save = @save;
	ws.load = @load;
	ws.send = @send;

	if false % ${gen.db}
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

	${logic.load}
	${logic.save}
	${logic.step}

end`;  };

				if (gen.trace) Log(script);
				FS.writeFile( path, script, "utf8" );

				ATOM.matlab.queue( "init_queue", `
ws_${func} = ${func}; 
ws_${func}.send( "Queued" );` );
				
				cb(null,ctx);
			},

			/*
			em: function emInit(thread,code,ctx,cb) {

				Copy(ATOM.plugins, ctx);
				
				if (ctx.require) 
					ATOM.plugins.MATH.import( ctx.require );

				ATOM.plugins.MATH.eval(code,ctx);

				cb( null, ctx );
			},
			*/
			
			sq:  function sqInit(thread,code,ctx,cb) {
				ATOM.thread( function (sql) {
					ctx.SQL[ctx.action](sql, [], function (recs) {
						//ctx.Save = [1,2,3];  // cant work as no cb exists
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
			
		step: {  //< step engines on given thread with callback cb(ctx) or cb(null) if error
			py: function pyStep(thread,port,ctx,cb) {
				
				if ( err = ATOM.python(thread,port,ctx) ) {
					cb( null );
					return ATOM.errors[err] || ATOM.errors.badError;
				}
				else {
					cb( ctx );
					return null;
				}
			},
			
			cv: function cvStep(thread,port,ctx,cb) {
				if ( ctx.frame && ctx.detector )
					if ( err = ATOM.opencv(thread,code,ctx) ) {
						cb(null);
						return ATOM.errors[err] || ATOM.errors.badError;
					}
					
					else  {
						cb( ctx );
						return null;
					}
				
				else
					return ATOM.errors.badContext;
			},
			
			js: function jsStep(thread,port,ctx,cb) {
				//Log("step thread",thread, ATOM.vm[thread] ? "has thread" : " no thread");

				if ( vm = ATOM.vm[thread] ) 
					ATOM.thread( function (sql) {
						Copy( {RES: cb, SQL: sql, CTX: ctx, PORT: port, PORTS: vm.ctx}, vm.ctx );
						
						VM.runInContext(vm.code,vm.ctx);
						
						return null;
					});
				
				else 
					return ATOM.errors.lostContext;
			},
			
			m: function mStep(thread,port,ctx,cb) {
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
					func = thread.replace(/\./g,"_");
				
				ctx._Load = ctx._Load || "";
				
				if ( !ctx._Load ) cb(0);   // detach thread and set default responce
				
				ATOM.matlab.queue( "step_queue", `ws_${func}.step( ${arglist(ctx)} );` );
				
				return null;
			},
			
			/*
			em: function meStep(thread,code,ctx) {
				if ( vm = ATOM.vm[thread] )
					ATOM.thread( function (sql) {
						Copy( {SQL: sql, CTX: ctx, DATA: [], RES: [], PORT: port, PORTS: vm.ctx}, vm.ctx );
						
						ATOM.plugins.MATH.eval(vm.code,vm.ctx);
						return null;
					});
				
				else
					return ATOM.errors.lostContext;					
			},
			*/
			
			sq: function sqStep(thread,port,ctx,cb) {

				ctx.SQL = {};
				ctx.ports = ctx.ports || {};

				VM.runInContext(code,ctx);

				ATOM.app.select[thread] = function (req,cb) { ctx.SQL.select(req.sql,[],function (recs) {cb(recs);}); }
				ATOM.app.insert[thread] = function (req,cb) { ctx.SQL.insert(req.sql,[],function (recs) {cb(recs);}); }
				ATOM.app.delete[thread] = function (req,cb) { ctx.SQL.delete(req.sql,[],function (recs) {cb(recs);}); }
				ATOM.app.update[thread] = function (req,cb) { ctx.SQL.update(req.sql,[],function (recs) {cb(recs);}); }

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
	ENUM.trace("A>",msg,sql);
}
	
// UNCLASSIFIED

