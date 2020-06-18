// UNCLASSIFIED

/**
[Installation and Usage](https://sc.appdev.proj.coe/acmesds/atomic)

@module ATOMIC
@requires child_processby
@requires fs
@requires vm 
@requires pythonIF
@requires opencvIF
@requires enum
*/

const 														
	// globals
	ENV = process.env,
	
	// NodeJS modules
	CP = require("child_process"),
	FS = require("fs"),	
	CLUSTER = require("cluster"),
	NET = require("net"),
	VM = require("vm");
	
function Trace(msg,req,res) {  
	"atom".trace(msg,req,res);
}

const { Copy,Each,Log,isString } = require("enum");
	
const
	{ vmStore, $libs } = ATOM = module.exports = {
		pipeEngine: (ctx,cb) => {
		},
		
		//require("./ifs/build/Release/engineIF"), 	
		python: require("pythonIF"),
		opencv: require("opencvIF"),
		
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
		@method sqlThread
		Start a sql thread
		*/
		sqlThread: () => { throw new Error("atomic unconfigured sqlThread method"); },  //< sql threader
		
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
		//nextcore: 0,

		db: { // db connections for each engine tech
			python: { //< support for python engines
				user: ENV.MYSQL_USER,
				name: ENV.MYSQL_NAME,
				pass: ENV.MYSQL_PASS
			},
			
			matlab: {  // connecting via non-host machine
				user: ENV.ODBC_USER,
				name: ENV.ODBC_NAME,
				pass: ENV.ODBC_PASS
			}
		},
			
		matlab: {  //< support for non-host matlab engines
			
			path: {  //< file and service paths
				save: "./public/m/",
				agent: ENV.SERVICE_MASTER_URL + "/matlab"
			},
				
			flush: function (sql,qname) {  //<  flush jobs in qname=init|step|... queue
				var
					matlab = ATOM.matlab,
					db = ATOM.db.matlab,
					agent = matlab.path.agent,
					func = qname,
					path = matlab.path.save + func + ".m",
					script =  `disp(webread('${agent}?flush=${qname}'));` ;
								
				Trace("FLUSH MATLAB");
				
				if (db) {
					FS.writeFile( path, `
ex = select(odbc, 'SELECT * FROM openv.agents WHERE queue="${qname}"');
close(exec(odbc, 'DELETE FROM openv.agents WHERE queue="${qname}"'));
for n=1:height(ex)
	disp(ex.script{n});
	eval(ex.script{n});
end
`, err => {} );
				}
				
				else
					sql.query("INSERT INTO openv.agents SET ?", {
						queue: qname,
						script: script
					}, err => {

						sql.query("SELECT * FROM openv.agents WHERE ? ORDER BY ID", {
							queue: qname
						}, function (err,recs) {

							FS.writeFile( path, recs.joinify("\n", function (rec) {
								return rec.script;
							}), "utf8" );

							sql.query("DELETE FROM openv.agents WHERE ?", {
								queue: qname
							});
						});
					});
				
			},
			
			queue: function (qname, script) { //< append script job to qname=init|step|... queue
				
				ATOM.sqlThread( sql => {
					sql.query("INSERT INTO openv.agents SET ?", {
						queue: qname,
						script: script
					}, err => {
						Log("matlab queue", err);
					}); 
				});
			}		
		},
			
		/**
		@cfg {Object}
		@method config
		@member ATOMIC
		Configure are start the engine interface, estblish worker core connections
		*/
		config: opts => {  //< configure with options
	
			Trace(`CONFIGURE`);

			if (opts) Copy(opts,ATOM,".");

			/*
			if (CLUSTER.isMaster) {  // experimental ipc
				var ipcsrv = NET.createServer( function (c) {
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
				ipcsrv.listen("/tmp/totem.sock");
				
				var sock = ATOM.ipcsocket = NET.createConnection("/tmp/totem.sock", function () {
					Log("connected?");
				});
				sock.on("error", err => {
					Log("sockerr",err);
				});
				sock.on("data", function (d) {
					Log("got",d);
				}); 
			} */
			
			ATOM.thread( sql => { // compile engines defined in engines DB

				ATOM.matlab.flush(sql, "init_queue");
				ATOM.matlab.flush(sql, "step_queue");

				// Using https generates a TypeError("Listener must be a function") at runtime.

				process.on("message", function (req,socket) {  // cant use CLUSTER.worker.process.on

					if (req.action) { 		// process only our messages (ignores sockets, etc)
						if (CLUSTER.isWorker) {
							Trace( `IPC grab ${CLUSTER.worker.id}/req.action`, req, Log);
//Log(req);	
							if ( route = ATOM[req.action] ) 
								ATOM.sqlThread( sql => {
									req.sql = sql;  
									//delete req.socket;
									route( req, tau => {
										Trace( `IPC ${req.table} ON ${CLUSTER.worker.id}` );
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
		},

		flex: null,
		
		/**
		@cfg {Object}
		@member ATOMIC
		Modules to share accross all I-engines
		*/
		$libs: {  // libs shared with js-engines 
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
			107: new Error("engine interface problem"),
			badType: new Error("engine type not supported"),
			badPort: new Error("engine provided invalid port"),
			badError: new Error("engine returned invalid code"),
			lostContext: new Error("engine context lost"),
			badEngine: new Error("engine does not exist, is disabled, has invalid context, or failed to compile"),
			badStep: new Error("engine step faulted"),
			badContext: new Error("engine context invalid"),
			badRequest: new Error("engine worker handoff failed")
		},
			
		workers: {},
		
		context: (sql,name,cb) => {	// provide an engine context
			
				/*
				// experimental NET sockets as alternative to sockets used here
				var sock = this.socket = NET.connect("/tmp/totem."+thread+".sock");
				sock.on("data", function (d) {
					Log("thread",this.thread,"rx",d);
				}); 
				sock.write("hello there");*/
			const {floor,random} = Math;

			if ( CLUSTER.isMaster ) {	// assign a worker
				var worker = ATOM.workers[name];
				
				if ( !worker )
					worker = ATOM.workers[name] = ATOM.cores 
							? CLUSTER.workers[1+floor(random() * ATOM.cores)] 
							: null;
						
				cb({
					worker: worker,
					thread: name,
					req: null
				});
			}

			else	// keep on this worker
				cb({
					worker: null,
					thread: name,
					req: null
				});
		},
				
		vmStore: {},  // js-machines
			
		tau: job => { // default source/sink event tokens when engine in stateful workflows
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
		@method run
		@member ATOMIC
		
		The request req = { table, client, query, body, action, state } 

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
		run: (req, cb) => {  //< run engine on a worker with callback cb(context, stepper) or cb(null) if error
			var
				sql = req.sql,
				query = req.query,
				client = req.client.replace(/[\.@]/g,"") || "noclient",
				table = req.table || "noengine",
				name = query.Name || query.ID || "nocase",
				thread = `${client}.${table}.${name}`;

			function execute(engctx, cb) {  //< callback cb(ctx,stepper) with primed engine ctx and stepper
				var 
					sql = req.sql,
					body = engctx.req.body,
					port = body.port || "",
					runctx = Copy( engctx.req.query, req.query); 	// save engine run content for potential handoff // Copy(req.query, engctx.req.query); 
				
				Trace( "EXEC "+engctx.thread, req, Log );
				//Log("run ctx", runctx);
				
				cb( runctx, function step(res) {  // provide this engine stepper to the callback

					//Log( "step eng", engctx.step );
					if ( stepEngine = engctx.step )
						return ATOM.call( engctx.wrap, runctx, runctx => {  // allow a js-wrapper to modify engine context
							
							//Log(">call", runctx);
							if ( runctx )
								return ATOM.mixContext(sql, runctx.Entry, runctx, runctx => {  // mixin sql primed keys into engine ctx
									//Log(">mix", runctx);

									try {  	// step the engine then return an error if it failed or null if it worked
										if ( err = stepEngine(engctx.thread, port, runctx, res) +104 ) 
											return ATOM.errors[ err ] || ATOM.badError;
										
										//ATOM.mixContext( sql, runctx.Exit, runctx );	// mixout sql keys from engine ctx
										return null;
									}

									catch (err) {
										return err;
									}
								});
							
							else
								return ATOM.errors.badEngine;
						});
					
					else 
						return ATOM.errors.badEngine;

				});
			}

			/*
			function handoff(engctx, cb) {  //< handoff ctx to worker or  cb(null) if handoff fails
				var 
					ipcreq = {  // an ipc request must not contain sql, socket, state etc
						table: req.table,
						client: req.client,
						query: req.query,
						body: req.body,
						action: req.action
					};
				
				Log("handoff", ipcreq);
				if ( CLUSTER.isWorker )   // handoff thread to master
					process.send(ipcreq, req.resSocket() );

				else
				if ( worker = engctx.worker )  //handoff thread to worker 
					worker.send(ipcreq, req.resSocket() );
				
				else // cant handoff 
					cb( null );
			} */

			function initialize(engctx, cb) {  //< prime, program, then execute engine with callback cb(ctx, stepper) or cb(null) if failed
				
				function prime(req, engctx, cb) {  //< callback cb(engctx || null) with engine context or null if failed

					var
						sql = req.sql,
						name = req.table;

					if ( name == "engines" )  // block attempts to run an engine from the engines repo itself
						cb( null );

					else
						sql.forFirst(	// get the requested engine
							"A>",
							"SELECT * FROM app.engines WHERE least(?) LIMIT 1", 
							{
								Name: name,
								Enabled: true
							}, eng => {

							//Log( "got end", engctx.thread, runctx.Voxel.ID);

							if (eng) 
								cb( Copy({				// define engine context
									req: {  				// reduced http request for ATOM CRUD i/f
										table: req.table,	// engine name
										client: req.client,	// engine owner
										query: Copy( 	 // engine run context
											eng.State.parseJSON({}), 
											{ thread: engctx.thread } ),
										body: req.body,		// engine tau parameters
										action: req.action	// engine CRUD request
									},			// http request  
									type: eng.Type,   // engine type: js, py, etc
									code: eng.Code, // engine code
									wrap: eng.Wrap, // js-code step wrapper
									init: ATOM.init[ eng.Type ],  // method to initialize/program the engine
									step: ATOM.step[ eng.Type ]  // method to advance the engine
								}, engctx) );

							else
								cb( null );
						});
				}
				
				function program(sql, engctx, cb) {  //< program engine with callback cb(engctx || null) 
					var runctx = engctx.req.query;

					if ( initEngine = engctx.init )
						ATOM.mixContext(sql, runctx.Entry, runctx, runctx => {  // mixin sql vars into engine query
							//Log(">mix", runctx);

							if (runctx) 
								initEngine(engctx.thread, engctx.code || "", runctx, err => {
									//Log(">init", err);
									cb( err ? null : engctx );
								});

							else
								cb( null );
						});

					else
						cb( null );
				}
		
				var
					query = new Object(req.query),
					sql = req.sql;
				
				Trace( "INIT "+engctx.thread, req, Log );
				
				prime(req, engctx, engctx => {	// prime engine context
					//Log(">prime", engctx);
					
					if (engctx) 
						program(sql, engctx, engctx => {	// program/compile engine
							//Log(">pgm", engctx);
							if (engctx)  // all went well so execute it
								execute( engctx, cb );

							else  // send "failed to compile" signal
								cb( null );
						});

					else 	// send "failed to prime" signal
						cb( null );
				});
			}	

			ATOM.context(sql, thread, engctx => {
				
				Trace(thread + " FOR " + (engctx.worker?engctx.worker.id:"me"));
				
				if ( worker = engctx.worker )  // handoff to worker
					worker.send({  // an ipc request must not contain sql, socket, state etc
						table: req.table,
						client: req.client,
						query: req.query,
						body: req.body,
						action: req.action
					}, req.resSocket() );
				
				else { // its all mine
					if ( engctx.req ) // was already initialized so execute it
						execute( engctx, cb );

					else   // was not yet initialized so do so
						initialize( engctx, cb );					
				}
			});
			
			/*
			// Handoff this request if needed; otherwise execute this request on this worker/master.
			
			if ( CLUSTER.isMaster )  { // on master so handoff to worker or execute 
				if ( engctx = ATOM.context[thread] ) // get engine context
					if ( ATOM.cores ) // handoff to worker
						handoff( engctx, cb );

					else
					if ( engctx.req ) // was sucessfullly initialized so execute it
						execute( engctx, cb );

					else   // was not yet initialized so do so
						initialize( engctx, cb );

				else { // assign a worker to new context then handoff or initialize
					var engctx = ATOM.context[thread] = new CONTEXT(thread);
					if ( ATOM.cores ) 	// handoff to worker to complete the initialization
						handoff( engctx, cb );
					
					else	// initialize the engine
						initialize( engctx, cb );
				}
			}
			
			else { // on worker 
				if ( engctx = ATOM.context[thread] ) {  // run it if worker has an initialized context
					if ( engctx.req )  // was sucessfullyl initialized so can execute it
						execute( engctx, cb );

					else  // had failed initialization so must reject
						cb( null );
				}

				else { // worker must initialize its context, then run it
					var engctx = ATOM.context[thread] = new CONTEXT(thread);
					initialize( engctx, cb );
				}
			}
			*/
		},

		/**
		@method save
		@member ATOMIC
		Save tau job files.
		*/			
		save: (sql,taus,port,engine,saves) => {
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
		 @method insert(step)
		 @member ATOMIC
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		*/
		insert: (req,res) => {	//< step a stateful engine with callback res(ctx || Error) 
			ATOM.run(req, (ctx,step) => {
				if ( ctx && step ) {
					Trace( `step ${ctx.thread}`, req, Log);
					for (var n=0, N=ctx.Runs||0; n<N; n++) step( ctx => {} );
					res( ctx );
				}
				
				else
					res( null );
			});
		},

		/**
		 @method delete(kill)
		 @member ATOMIC
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		*/
		delete: (req,res) => {	//< free a stateful engine with callback res(ctx || Error) 
			ATOM.run(req, (ctx,step) => {
				if (ctx) {
					Trace( `kill ${ctx.thread}`, req, Log);
					delete ATOM.context[ ctx.thread ];
					res( ctx );
				}
				
				else
					res( null );
			});
		},

		/**
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		 @method select(read)
		 @member ATOMIC
		*/
		select: (req,res) => {	//< run a stateless engine with callback res(ctx || null) 
			ATOM.run( req, (ctx, step) => {  // get engine stepper and its context
				if ( ctx && step ) {
					Trace( `run ${ctx.thread}`, req, Log);
					step( ctx => res( ctx ) );
				}

				else
					res( null );
			});
		},

		/**
		 Provides engine CRUD interface: step/insert/POST, compile/update/PUT, run/select/GET, and 
		 free/delete/DELETE.
		 @method update(init)
		 @member ATOMIC		  
		*/
		update: (req,res) => {	//< compile a stateful engine with callback res(ctx || Error)  
			ATOM.run( req, (ctx,step) => {
				if ( ctx ) {
					Trace( `init ${ctx.thread}`, req, Log);
					res( ctx );
				}
				
				else
					res( null );
			});
		},

		call: (code, ctx, cb) => { 
			if (code) 
				try {
					VM.runInContext( code, VM.createContext({ 
						ctx: ctx
					}));
					return cb(ctx);
				}
			
				catch (err) {
					return cb( null );
				}
			
			else
				return cb( ctx );
		},

		/**
		Callback engine cb(ctx) with its state ctx primed with state from its ctx.Entry, then export its 
		ctx state specified by its ctx.Exit.
		The ctx.sqls = {var:"query...", ...} || "query..." enumerates the engine's ctx.Entry (to import 
		state into its ctx before the engine is run), and enumerates the engine's ctx.Exit (to export 
		state from its ctx after the engine is run).  If an sqls entry/exit exists, this will cause the 
		ctx.req = [var, ...] list to be built to synchronously import/export the state into/from the 
		engine's context.
		@method mixContext
		@member ATOMIC
		*/
		mixContext: (sql, sqls, ctx, cb) => {  //< serialize import/export (ctx mixin/mixout) using sqls queries with callback cb(ctx) 
			var 
				importing = sqls == ctx.Entry,
				exporting = sqls == ctx.Exit;
			
			//Log(">mix keys", ctx.keys, sqls, importing);
			if ( keys = ctx.keys ) { // continue key serialization process
				if ( keys.length ) { // more keys to import/export
					var 
						key = keys.pop(), 		// var key to import/export
						query = sqls[key]; 	// sql query to import/export

					if ( !isString(query) ) {
						query = query[0];
						args = query.slice(1);
					}

					//Trace([key,query]);

					if ( importing ) {  	// importing this key into the ctx so ...
						var data = ctx[key] = [];
						var args = ctx.query;
					}
					
					else { 	// exporting this key from the ctx so ...
						var data = ctx[key] || [];
						var args = [key, {result:data}, ctx.query];
					}

					//Trace(JSON.stringify(args));

					sql.query(query, args, (err, recs) => { 	// import/export this key into/from this ctx

		//Trace([key,err,q.sql]);

						if (err) 
							ctx[key] = null;		// or should we return err?
						
						else 
							if ( importing )   // importing key so ...
								recs.forEach( rec => {
									var vec = [];
									data.push( vec );
									for ( var x in rec ) vec.push( rec[x] );
								});
							
							else { 	// exporting key so ...
							}					

						return ATOM.mixContext(sql,sqls,ctx,cb);	// continue key serialization
					});
				}
				
				else  { // serialization process exhausted so ...
					ctx.keys = null;
					if (cb) return cb(ctx); // return engine ctx to host
				}
			}
			
			else 
			if (sqls) {  // kick-start key serialization process
				ctx.keys = isString(sqls) ? [sqls] : sqls;  
				return ATOM.mixContext(sql, sqls, ctx, cb);	
			}
			
			else	// nada to do
			if (cb) return cb(ctx); 
		},

		gen: {  //< controls code generation when engine initialized/programed
			hasgpu: ENV.HASGPU,
			hascaffe: ENV.HASCAFFE,
			debug: false,
			trace: false,
			libs: true,
			code: true
		},

		init: {  //< initalize/program engine on given thread=case.plugin.client with callback cb(ctx) or ctx(null)
			py: function pyInit(thread,code,ctx,cb)  {
				function portsDict(portsHash) {
				/*
					mysql connection notes:
					install the python2.7 connector (rpm -Uvh mysql-conector-python-2.x.rpm)
					into /usr/local/lib/python2.7/site-packages/mysql, then copy
					this mysql folder to the anaconda/lib/python2.7/site-packages.

					import will fail with mysql-connector-python-X installed (rum or rpm installed as root using either
					python 2.2 or python 2.7).  Will however import under python 2.6.  To fix, we must:

							cp -r /usr/lib/python2.6/site-packages/mysql $CONDA/lib/python2.7/site-packages

					after "rpm -i mysql-connector-python-2.X".
					
					For some versions of Anaconda, we can get the "pip install python-connector" to work.
				*/
					var ports = Object.keys( portsHash );

					ports.forEach( (port,n) => {
						ports[n] = port + ":" + port;
					});

					return "{" + ports.join(",") + "}";
				}
					
				const { gen, db } = ATOM;
				
				var 
					[client,host,usecase] = thread.split("."),					
					/*
					Thread = thread.split("."),
					Thread = {
						client: Thread[0],
						plugin: Thread[1],
						case: Thread[2]
					},
					script = "", 
					gen = ATOM.gen, */
				
					ports = portsDict( ctx.ports || {} ),
					script = `
# define ports and locals
PORTS = ${ports}		# define ports
LOCALS = locals()			# engine OS context
# print "py>>locals",LOCALS
# define engine 
${code}
if 'PORT' in PORTS:
	PORT = LOCALS['PORT']		# engine port for stateful calls
	if PORT in PORTS:
		PORTS[port]( CTX['tau'], CTX['ports'][PORT] )
		ERR = 0
	else:
		ERR = 103
else:	# entry logic
	if INIT:	#import global modules and connect to sqldb
		try:
			global IMP, JSON, SYS, FLOW, SQL0, SQL1, NP
			import sys as SYS			#system info
			import json as JSON			#json interface
			from PIL import Image as IMP		#jpeg image interface
			import mysql.connector as SQLC		#db connector interface
			import numpy as NP
			# import caffe as CAFFE		#caffe interface
			# import flow as FLOW		# record buffering and loading logic
			# setup sql connectors
			SQL = SQLC.connect(user='${db.python.user}', password='${db.python.pass}', database='${db.python.name}')
			# default exit codes and startup
			ERR = 0
			INIT = 0
		except:
			ERR = 107
	else:
		try:
			# entry
			SQL0 = SQL.cursor(buffered=True)
			SQL1 = SQL.cursor(buffered=True) 
			# call engine
			${host}(CTX)
			#exit
			SQL.commit()
			SQL0.close()
			SQL1.close()
			ERR = 0
		except:
			ERR = 108
` ;
 			
				if (gen.trace) Log(script);

				cb( ATOM.python(thread,script,ctx), ctx );
			},
			
			cv: function cvInit(thread,code,ctx,cb)  {
				const { gen } = ATOM;
				
				var 
					[client,host,usecase] = thread.split("."),	
					/*
					Thread = thread.split("."),
					Thread = {
						case: Thread.pop(),
						plugin: Thread.pop(),
						client: Thread.pop()
					},				
					gen = ATOM.gen,  */
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
					[client,host,usecase] = thread.split("."),
					vm = vmStore[thread] = {
						ctx: VM.createContext( Copy( $libs, {} ) ),
						code: `
${code}
${host}($ctx, $res);
` 
					};

				cb( null, ctx );
			},
			
			m: function mInit(thread,code,ctx,cb) {
				
				const { matlab, gen } = ATOM;
				
				var 
					[client,host,usecase] = thread.split("."),				
					/*Thread = thread.split("."),
					Thread = {
						client: Thread[0],
						plugin: Thread[1],
						case: Thread[2]
					}, */
					func = thread.replace(/\./g,"_"),
					agent = matlab.path.agent,
					db = ATOM.db.matlab,
					usedb = db ? 1 : 0,
					path = matlab.path.save + func + ".m",
					/*save: `
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
	end `, */
					script = `
function ws = ${func}( )
	ws.set = @set;
	ws.get = @get;
	ws.step = @step;
	ws.save = @save;
	ws.load = @load;

	if ${usedb}
		ws.db = database('${db.name}', '${db.user}', '${db.pass}');
	else
		ws.db = 0;
	end

	function set(key,val)
		ws.(key) = val;
	end

	function val = get(key)
		val = ws.(key);
	end

	function load(ctx, cb)
		try
			if length(ctx.Events)>1
				ctx.Data = select(ws.db, ctx.Events);
			end
		
		catch 
				ctx.Data = []
		end

		res = cb(ctx);

		if ${usedb}
			disp({'${host}', 'where ID=${usecase}', res});
			%close(exec( ws.db, "UPDATE app.${host} SET Save='" +  jsonencode(res) + "' WHERE ID=${usecase}" ));
			q = "INSERT INTO openv.agents SET Script='" +  jsonencode(res) + "', queue='${thread}' " ;
			disp(q);
			h = exec( ws.db, q );
			close(h);
			webread( '${agent}?save=${thread}' );

		else
			fid = fopen('${func}.out', 'wt');
			fprintf(fid, '%s', jsonencode(res) );
			fclose(fid);
			webread( '${agent}?load=${func}' );
		end
	end 
						
	function step(ctx)
		load(ctx, @${host});

		% engine logic and ports
		${code}	
	end 
end` ;

				if (gen.trace) Log(script);
				
				FS.writeFile( path, script, "utf8" );

				matlab.queue( "init_queue", `ws_${func} = ${func}; ` );
				
				cb(null,ctx);
			},

			me: function meInit(thread,code,ctx,cb) {

				vmStore[thread] = {
					ctx: {
					},
					code: code
				};
				
				cb( null, ctx ); 
			},
			
			sq:  function sqInit(thread,code,ctx,cb) {
				ATOM.sqlThread( sql => {
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
				
				if ( err = ATOM.python(thread,port,ctx) ) 
					cb( err = ATOM.errors[err] || ATOM.errors.badError  );
				
				else 
					cb( ctx );
				
				return err;
			},
			
			cv: function cvStep(thread,port,ctx,cb) {
					
				if ( err = ATOM.opencv(thread,code,ctx) ) 
					cb( err = ATOM.errors[err] || ATOM.errors.badError );

				else  
					cb( ctx );

				return err;
			},
			
			js: function jsStep(thread,port,ctx,cb) {
				//Trace("step "+thread);

				if ( vm = vmStore[thread] ) {
					try {
						VM.runInContext(vm.code, Copy({
							$res: cb, 
							$ctx: ctx
						}, vm.ctx ) );
					}
					catch (err) {
						Log(thread,err);
					}
					return null;
				}
				
				else 
					return ATOM.errors.lostContext;
			},
			
			m: function mStep(thread,port,ctx,cb) {
				function arglist(x) {
					var rtn = [], q = "'";
					Each(x, (key,val) => {
						rtn.push(`'${key}'`);
						
						if (val)
							switch ( val.constructor ) {
								case Array:
								case Object:
									rtn.push( 
										key.startsWith("Save")
											? "jsondecode( '[]' )"
											: `jsondecode( '${JSON.stringify(val)}' )` 
									); break;
									
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
					matlab = ATOM.matlab,
					func = thread.replace(/\./g,"_");
				
				ctx.Events = ctx.Events || "";
				
				//if ( !ctx.Events ) cb(0);   // detach thread and set default response
				
				matlab.queue( "step_queue", `ws_${func}.step( ${arglist(ctx)} );` );
				
				return null;
			},
			
			me: function meStep(thread,port,ctx,cb) {
				if ( vm = vmStore[thread] ) {
					ATOM.sqlThread( sql => {
						//Copy( {SQL: sql, CTX: ctx, DATA: [], RES: [], PORT: port, PORTS: vm.ctx}, vm.ctx );

						$libs.ME.exec( vm.code, Copy(ctx, vm.ctx), vmctx => {
							//Log("vmctx", vmctx);
							cb( vmctx );
						});
					});
					return null;
				}
				
				else
					return ATOM.errors.lostContext;	
				
				/*
				if ( vm = vmStore[thread] )
					ATOM.sqlThread( sql => {
						Copy( {SQL: sql, CTX: ctx, DATA: [], RES: [], PORT: port, PORTS: vm.ctx}, vm.ctx );
						
						$libs.MATH.eval(vm.code,vm.ctx);
						return null;
					});
				
				else
					return ATOM.errors.lostContext;	
				*/
			},
			
			sq: function sqStep(thread,port,ctx,cb) {

				ctx.SQL = {};
				ctx.ports = ctx.ports || {};

				ATOM.app.select[thread] = function (req,cb) { ctx.SQL.select(req.sql,[],function (recs) {cb(recs);}); }
				ATOM.app.insert[thread] = function (req,cb) { ctx.SQL.insert(req.sql,[],function (recs) {cb(recs);}); }
				ATOM.app.delete[thread] = function (req,cb) { ctx.SQL.delete(req.sql,[],function (recs) {cb(recs);}); }
				ATOM.app.update[thread] = function (req,cb) { ctx.SQL.update(req.sql,[],function (recs) {cb(recs);}); }

				try {
					VM.runInContext(code,ctx);
					return null;	
				}
				catch (err) {
					return err;
				}
			},
			
			sh: function shStep(thread,port,ctx,cb) {  // Linux shell engines
				if (code) context.code = code;

				CP.exec(context.code, function (err,stdout,stderr) {
					Log(err || stdout);
				});

				return null;
			}			
		}
			
	};

//================== Unit testing

switch (process.argv[2]) {	//< unit testers
	case "?":
		Log("unit test with 'node atomic.js [A1 || ...]'");
		break;
		
	case "A1": 
		var TOTEM = require("../totem");

		Trace({
			msg: "A Totem+Engine client has been created", 
			a_tau_template: ATOM.tau("somejob.pdf"),
			engine_errors: ATOM.error,
			get_endpts: TOTEM.byTable,
			my_paths: TOTEM.paths
		});
		break;
		
	case "A2": 
		var TOTEM = require("../totem");

		TOTEM.config({}, err => {
			Trace( err || "Started but I will now power down" );
			TOTEM.stop();
		});

		ATOM.config({
			thread: TOTEM.thread
		});
		break;
		
	case "A3": 
		var TOTEM = require("../totem");
		
		TOTEM.config({
			"byTable.": {
				chipper: function Chipper(req,res) {				
					res( 123 );
				}
			},

			mysql: {
				host: ENV.MYSQL_HOST,
				user: ENV.MYSQL_USER,
				pass: ENV.MYSQL_PASS
			}
		});

		ATOM.config({
			thread: TOTEM.thread
		});
		
	case "A4": 
		var TOTEM = require("../totem");
		
		TOTEM.config({
			"byTable.": {
				test: function Chipper(req,res) {

					var itau = [ ATOM.tau("test.jpg") ];
					var otau = [ ATOM.tau() ];

					Log("query",req.query);
					// Python attempts to connect to mysql,  so, if mysql service not running or 
					// mysql.connector module not found, python engines will not run.
					
					// If job/port files do not exist, this can cause engines to crash.
					
					switch (req.query.config) {
						case "cv": // program and step haar opencv machine 
							var ctx =	{
								ports: {
									frame:	 {},
									helipads: {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							Log({
								init: ATOM.opencv("opencv.Me.Thread1","",ctx),
								ctx: JSON.stringify(ctx)
							});

							for (var n=0,N=1;n<N;n++) // step N>1 to test multistep
								Log({
									n: n,
									step: ATOM.opencv("opencv.Me.Thread1","frame",itau),
									itau: itau
								});

							// returns badStep if the cascades were undefined at the program step
							Log({
								step: ATOM.opencv("opencv.Me.Thread1","helipads",otau),
								otau: otau
							});
							break;

						// python machines fail with "cant find forkpty" if "import cv2" attempted

						case "py1": // program python machine
							var 
								ctx =	{ 
									tau:	[{job:"to be redefined"}]
								},
								pgm = `
print 'Look mom - Im running python!'
print 'My input context', CTX
CTX['tau'] = [{'x':[11,12],'y':[21,22]}]
`;

							Log({
								pgm: pgm,
								init: ATOM.python("py1.thread",pgm,ctx),
								ctx: JSON.stringify(ctx)
							});
							break;

						case "py2": // program and step python machine 
							var ctx =	{ 
								tau:	[ ATOM.tau("test.jpg") ],
								ports: { 	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							pgm = `
print 'Look mom - Im running python!'
def frame(tau,parms):
	print parms
	return 101
def helipads(tau,parms):
	print parms
	return 102
def faces(tau,parms):
	print parms
	return 103
`;		
							Log({
								pgm:pgm,
								init: ATOM.python("py2.Me.Thread1",pgm,ctx),
								ctx: ctx
							});

							for (var n=0,N=1; n<N; n++)
								Log(`STEP[${n}] = `, ATOM.python("py2.Me.Thread1","frame",itau));

							Log("STEP = ", ATOM.python("py2.Me.Thread1","helipads",otau));
							break;

						case "py3": // program and step python machine string with reinit along the way
							var ctx =	{ 
								tau:	[{job:"redefine on run"}],
								ports: {	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							itau[0].job = "test.jpg";
							pgm = `
print 'Look mom - Im running python!'
def frame(tau,parms):
	print parms
	return -101
def helipads(tau,parms):
	print parms
	return -102
def faces(tau,parms):
	print parms
	return -103
`;

							Log({pgm:pgm, ctx: ctx});
							Log("INIT = ", ATOM.python("py3",pgm,ctx));
							Log("STEP = ", ATOM.python("py3","frame",itau));
							// reprogramming ignored
							//Log("REINIT = ", ATOM.python("py3",pgm,ctx));
							//Log("STEP = ", ATOM.python("py3","frame",itau));
							Log(otau);
							break;

						case "js": // program and step a js machine string
							var ctx =	{ 
								ports: {	
									frame:	 {},
									helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
									faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
							}};

							itau[0].job = "test.jpg";
							pgm = `
CON.log('Look mom - Im running javascript!');
function frame(tau,parms) { 
	CON.log("here I come to save the day");
	tau[0].xyz=123; 
	return 0; 
}
function helipads(tau,parms) { 
	tau[0].results=666; 
	return 101; 
}
function faces(tau,parms) { return 102; }
`;

							Log({pgm:pgm, ctx: ctx});
							Log("INIT = ", ATOM.js("mytest",pgm,ctx));
							// frame should return a 0 = null noerror
							Log("STEP = ", ATOM.js("mytest","frame",itau));
							Log(itau);
							// helipads should return a 101 = badload error
							Log("STEP = ", ATOM.js("mytest","helipads",otau));
							Log(otau);
							break;	
					}

					res( "thanks!" );
				}
			},

			mysql: {
				host: ENV.MYSQL_HOST,
				user: ENV.MYSQL_USER,
				pass: ENV.MYSQL_PASS
			}

		}, err => {
			Trace( "Unit test my engines with /test?config=cv | py1 | py2 | py3 | js" );
		});

		ATOM.config({
			thread: TOTEM.thread
		});
		break;
}
		
// UNCLASSIFIED

