// UNCLASSIFIED

/**
Provides cloud computing on python, js, cv, matlab, R, ... engines via web endpoints.  This module 
documented in accordance with [jsdoc]{@link https://jsdoc.app/}.

@module ATOMIC
@author [ACMESDS](https://totemstan.github.io)

### Env Dependencies

	HASGPU = 1|0
	HASCAFFE = 1|0

@requires [enums](https://github.com/totemstan/enums)

@requires [child_process](https://nodejs.org/docs/latest/api/)
@requires [fs](https://nodejs.org/docs/latest/api/)
@requires [vm](https://nodejs.org/docs/latest/api/)
@requires [pythonIF](https://github.com/totemstan/atomic) 
@requires [opencvIF](https://github.com/totemstan/atomic) 
@requires [RIF](https://github.com/totemstan/atomic) 

@example
### Totem and Atomic Engine interfaces:

	var ATOMIC = require("../atomic");
	var TOTEM = require("../totem");

	Trace( "A Totem+Engine client has been created", {
		a_tau_template: ATOMIC.tau("somejob.pdf"),
		engine_errors: ATOMIC.error,
		get_endpts: TOTEM.reader,
		my_paths: TOTEM.paths
	});

@example
### Totem being powered up and down:

	var TOTEM = require("../totem");

	TOTEM.config({}, function (err) {
		Trace( err || "Started but I will now power down" );
		TOTEM.stop();
	});

	var ATOMIC = require("../engine").config({
		thread: TOTEM.thread
	});

@example
### Totem service with a chipper engine endpoint and a database:

	var TOTEM = require("../totem").config({
		"byType.": {
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

	var ATOMIC = require("../engine").config({
		thread: TOTEM.thread
	});

@example
### Totem with a complete engine test endpoint:

	var TOTEM = require("../totem").config({
		"byType.": {
			test: function Chipper(req,res) {

				var itau = [ATOMIC.tau()];
				var otau = [ATOMIC.tau()];

				switch (req.query.config) {
					case "cv": // program and step haar opencv machine 
						parm =	{
							tau: [], 
							ports: {
								frame:	 {},
								helipads: {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
								faces:	 {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
						}};

						itau[0].job = "test.jpg";
						console.log(parm);

						for (var n=0,N=1;n<N;n++)  // program N>1 to test reprogram
							console.log(`INIT[${n}] = `, ATOMIC.opencv("opencv.Me.Thread1","setup",parm));

						for (var n=0,N=5;n<N;n++) // step N>1 to test multistep
							console.log(`STEP[${n}] = `, ATOMIC.opencv("opencv.Me.Thread1","frame",itau));

						// returns badStep if the cascades were undefined at the program step
						console.log("STEP = ", ATOMIC.opencv("opencv.Me.Thread1","helipads",otau));
						console.log(otau);
						break;

					// python machines fail with "cant find forkpty" if "import cv2" attempted

					case "py1": // program python machine
						parm =	{ 
							tau:	[{job:"redefine on run"}],
							ports: {	
						}};
						pgm = `
							print 'Look mom - Im running python!'
							print tau
							tau = [{'x':[11,12],'y':[21,22]}]
							`;

						// By default python attempts to connect to mysql.  
						// So, if mysql service not running or mysql.connector module not found, this will not run.
						console.log({py:pgm, ctx: parm});
						console.log("INIT = ", ATOMIC.python("py1.thread",pgm,parm));
						console.log(parm.tau);
						break;

					case "py2": // program and step python machine 
						parm =	{ 
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
						console.log({py:pgm, ctx: parm});
						console.log("INIT = ", ATOMIC.python("py2.Me.Thread1",pgm,parm));
						// reprogramming ignored
						//console.log("INIT = ", ATOMIC.python("py2.Me.Thread1",pgm,parm));

						for (var n=0,N=1; n<N; n++)
							console.log(`STEP[${n}] = `, ATOMIC.python("py2.Me.Thread1","frame",itau));

						console.log("STEP = ", ATOMIC.python("py2.Me.Thread1","helipads",otau));
						break;

					case "py3": // program and step python machine string with reinit along the way
						parm =	{ 
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

						console.log({py:pgm, ctx: parm});
						console.log("INIT = ", ATOMIC.python("py3",pgm,parm));
						console.log("STEP = ", ATOMIC.python("py3","frame",itau));
						// reprogramming ignored
						//console.log("REINIT = ", ATOMIC.python("py3",pgm,parm));
						//console.log("STEP = ", ATOMIC.python("py3","frame",itau));
						console.log(otau);
						break;

					case "js": // program and step a js machine string
						parm =	{ 
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

						console.log({py:pgm, ctx: parm});
						console.log("INIT = ", ATOMIC.js("mytest",pgm,parm));
						// frame should return a 0 = null noerror
						console.log("STEP = ", ATOMIC.js("mytest","frame",itau));
						console.log(itau);
						// helipads should return a 101 = badload error
						console.log("STEP = ", ATOMIC.js("mytest","helipads",otau));
						console.log(otau);
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

	}, function (err) {
		Trace( "Unit test my engines with /test?config=cv | py1 | py2 | py3 | js" );
	});

	var ATOMIC = require("../atomic").config({
		thread: TOTEM.thread
	});
	
*/

const 														
	
	ENV = process.env,
	// NodeJS modules
	{ exec } = require("child_process"),
	FS = require("fs"),	
	//NET = require("net"),
	VM = require("vm"),
	{ isWorker, isMaster, fork } = require("cluster"),
	  
	// Totem modules
	{ Copy,Each,Log,Start,isString,sqlThread } = require("@totemstan/enums");

const
	{ 	Trace,
		errors, mixContext, vmStore, $libs, wrap, run, 
	 	opencv, python, R, contexts, workers } = ATOM = module.exports = {
			
		Trace: (msg, ...args) => `atomic>>>${msg}`.trace( args ),

		//require("./ifs/build/Release/engineIF"), 	
			
		// engine interfaces
			
		python: require("./ifs/python/build/Release/pythonIF"),
		//opencv: require("./ifs/opencv/build/Release/opencvIF"),
		//R: require("./ifs/R/build/Release/RIF"),
		
		// interprocess communications
			
		ipcFeed: (req,res) => { throw new Error( "atomic ipcFeed not configured" ); },
		ipcSave: (sql,ctx) => { throw new Error( "atomic ipcSave not configured" ); },
			
		/**
		Paths to various things.
		@cfg {Object}
		*/
		paths: {
			jobs: "./jobs/"
		},
		
		node: "localhost",
			
		/**
		Number of worker cores (aka threads) to provide in the cluster.  0 cores provides only the master.
		*/
		macs: {
			py: 4,
			cv: 4,
			m: 1,
			r: 1,
			js: 16,
			sql: 0,
			me: 0
		},					
			
		cores: 0,  //< number of workers
			
		/**
		Next available core
		@cfg {Number}
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
				
				sqlThread( sql => {
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
		Configure the engine interface and estblish workers.
		@cfg {function}
		*/
		config: opts => {  //< configure with options
	
			Trace(`CONFIGURE`);

			if (opts) Copy(opts,ATOM,".");

			/*
			if (isMaster) {  // experimental ipc
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
			
			sqlThread( sql => { // setup atomic env

				if ( isMaster )	// create workers
					sql.query("DELETE FROM openv.workers WHERE ?",{node:opts.node}, err => {
						for ( var n=0; n<ATOM.cores; n++ ) {
							var 
								worker = fork();							
							
							Trace( `fork ${worker.id}` );
							workers[worker.id] = worker;
							
							Each( ATOM.macs, (type, cores) => {
								for ( var i=0; i<cores; i++ ) 
									sql.query("INSERT INTO openv.workers SET ?", {
										worker: worker.id,
										node: opts.node,
										type: type,
										thread: null
									}, err => Log(">>>worker define", err) );
							});
						}
					});
				
				// prime matlab queues
				ATOM.matlab.flush(sql, "init_queue");
				ATOM.matlab.flush(sql, "step_queue");

				// establish callback for workers
				process.on("message", (req,socket) => {  // cant use CLUSTER.worker.process.on
					const 
						{ action, table, query } = req,
						{ ipcFeed, ipcSave } = ATOM;
					
					if ( action ) 		// process only our messages (ignores sockets, etc)
						if ( isWorker ) {		// process only if a worker bee
							if ( route = ATOM[action] ) {
								Trace( `ipc ${action} ${table}`, req );
								
								sqlThread( sql => {
									req.sql = sql;
									//query.Feed = cb => ipcFeed(req, cb);
									//query.Trace = msg => Trace( msg, req );
									
									route( req, ctx => {
										if ( ctx ) 
											ipcSave( req, msg => socket.end(msg) );
										
										else
											socket.end( "lost context" );
 									});
								});
							}

							else
								socket.end( errors.badRequest+"" );  
						}
				});
			});
			return ATOM;
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
		Error messages
		@cfg {Object}
		*/
		errors: {  // error messages
			0: null,
			101: new Error("engine could not be loaded"),
			102: new Error("engine received bad query"),
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
			
		workers: [		// stash for engine workers
		],
			
		contexts: {		// stash for engine threads
		},
		
		vmStore: {},  // js-machines
		
		// siulation tokens
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
		Run an engine.

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
		the master can send work to workers.   

		This method will callback cb(core) with the requested engine core; null if the core could not
		be located or allocated.
		*/
		run: (req, cb) => {  //< run engine with callback cb(ctx, stepper) or cb(null) if error
			const 
				{ sql, query, client, table, body, action, resSocket, domain, type, profile, url } = req,
				{ name, Name } = query,
				thread = [client,table,name || Name].join(":");

			function allocateEngine (cb) {	//< callback cb(worker || null,engctx || null) with engine''s worker or its context

				function programEngine (engctx, cb) {  //< program engine with callback cb(engctx || null) 
					var runctx = engctx.req.query;

					//Log(">program",thread);
					if ( initEngine = engctx.init )
						mixContext(sql, runctx.Entry, runctx, runctx => {  // mixin sql vars into engine query
							//Log(">mix", runctx);

							if (runctx) 
								initEngine(engctx.thread, engctx.code || "", runctx, err => {
									//Log(">init", thread);
									cb( err ? null : engctx );
								});

							else
								cb( null );
						});

					else
						cb( null );
				}
		
				function primeEngine (cb) {  //< callback cb(engctx || null) with primed engine context 

					//Log(">prime", thread, table);
					/*
					sql.getContext( "openv.engines", query, ctx => {
						cb( contexts[thread] = {	// define engine context
							thread: thread,			// thread name client.notebook.usecase
							req: {  				// reduced http request for ATOM CRUD i/f
								table: table,		// engine name
								client: client,		// engine owner
								profile: profile, 	// client''s profile
								url: url, 			// url
								query: Copy(ctx.State || {}, query), 
								body: body,			// engine tau parameters
								action: action		// engine CRUD request
							},			  // http request  
							type: ctx.Type,			// engine type: js, py, etc
							code: ctx.Code, 		// engine code
							wrap: ctx.Wrap, 		// js-code step wrapper
							init: ATOM.init[ ctx.Type ],  // method to initialize/program the engine
							step: ATOM.step[ ctx.Type ]  // method to advance the engine
						} );
					});  */
					sql.query(	// get the requested engine
						"SELECT * FROM openv.engines WHERE Enabled AND ? LIMIT 1", 
						[{Name:table}], (err,engs) => {

						if ( eng = engs[0] ) 
							cb( contexts[thread] = {				// define engine context
								thread: thread,	// thread name client.notebook.usecase
								req: {  							// reduced http request for ATOM CRUD i/f
									table: table,					// engine name
									client: client,					// engine owner
									profile: profile, 				// client''s profile
									url: url, 						// url
									query: eng.State.parseJSON() || {Host: table}, // initial engine ctx
									body: body,						// engine tau parameters
									action: action					// engine CRUD request
								},			// http request  
								type: eng.Type,   // engine type: js, py, etc
								code: eng.Code, // engine code
								wrap: eng.Wrap, // js-code step wrapper
								init: ATOM.init[ eng.Type ],  // method to initialize/program the engine
								step: ATOM.step[ eng.Type ]  // method to advance the engine
							} );

						else
							cb( null );
					}); 
				}
				
				/*
				// experimental NET sockets as alternative to sockets used here
				var sock = this.socket = NET.connect("/tmp/totem."+thread+".sock");
				sock.on("data", function (d) {
					Log("thread",this.thread,"rx",d);
				}); 
				sock.write("hello there"); */
				
				if ( isMaster && ATOM.cores ) // allocate a worker
					sql.query(
						"SELECT Type FROM openv.engines WHERE Enabled AND Name=? LIMIT 1", 
						[table], (err,engs) => {
							
						//Log( ">engs", err,engs, ATOM.node);
							
						if ( eng = engs[0] ) 		// assign thread to engine''s worker
							sql.query(
								"SELECT worker,ID FROM openv.workers WHERE node=? AND type=? AND thread IS NULL LIMIT 1", 
								[ATOM.node, eng.Type], (err,workers) => {
									
									if ( wkr = workers[0] )
										if ( worker = workers[ wkr.worker ] ) {
											sql.query("UPDATE openv.workers SET thread=? WHERE ID=?", [thread,wkr.ID] );
											cb( worker );
										}
									
										else
											cb(null);
									
									else
										cb(null);
								});
							
						else
							cb( null );
					});
						
				
				else	// on this worker
				if ( engctx = contexts[thread] ) 	// already initialized
					cb( null, engctx );
				
				else // must initialize
					primeEngine( engctx => {	
						if (engctx) 		// program/compile/init the engine	
							programEngine(engctx, engctx => cb( null, engctx ));

						else 	// send "failed to prime" signal
							cb( null );						
					});
			}
				
			function executeEngine (engctx, cb) {  //< callback cb(ctx,stepper) with primed engine ctx and stepper
				const 
					{ body } = engctx.req,		// exract engine simulation tokens
					runctx = Copy( engctx.req.query, req.query); 	// save engine run content for potential handoff 
				
				// Log(">runctx", runctx);
				
				cb( runctx, function step(res) {  // provide this engine stepper to the callback

					//Log( ">step eng", engctx.step );
					if ( stepEngine = engctx.step ) {
						//Log(">exec", engctx.thread);
						const err = wrap( engctx.wrap, runctx, runctx => {  // allow a js-wrapper to modify run context
							
							//Log(">wrap", runctx);
							if ( runctx )
								return mixContext(sql, runctx.Entry, runctx, runctx => {  // mixin sql primed keys into engine ctx
									//Log(">mix", runctx);

									try {  	// step the engine then return an error if it failed or null if it worked
										const err = stepEngine(engctx.thread, runctx, res);
										
										//Log(">err", err);
										
										if ( err ) 
											return errors[ err ] || errors.badError;
										
										else
											return 
												//mixContext( sql, runctx.Exit, runctx );	// mixout sql keys from engine ctx
												null;
									}

									catch (err) {
										return err;
									}
								});
							
							else
								return errors.badEngine;
						});
						//Log(">end", engctx.thread);
						return err;
					}
					
					else 
						return errors.badEngine;

				});
			}

			//Log(">alloc", thread);			
			allocateEngine( (worker,engctx) => {	// get the engine''s worker or its context on this worker

				if ( worker )  // handoff to worker and provide socket for its response
					worker.send({  // an ipc request must not contain sql, socket, state, functions etc
						table: table,		// engine name
						client: client,		// owner
						query: query,		// run ctx keys
						body: body,			// simulation tokens
						action: action,		// init, step, kill 
						profile: profile	// owner''s profile
					}, resSocket() );

				else
				if ( engctx ) // has context so execute the engine
					executeEngine( engctx, cb );

				else		// signal error
					cb(null);

			});
			
		},

		/**
		Save context tau tokens into job files.
		*/			
		save: (sql,taus,engine,saves) => {
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
								output: engine,
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
		Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.
		@param {Object} req Totem request
		@param {Function} res Totem response
		*/
		insert: (req,res) => {	//< step a stateful engine with callback res(ctx || Error) 
			run(req, (ctx,step) => {
				if ( ctx ) {
					for (var n=0, N=ctx.Runs||0; n<N; n++) step( ctx => {} );
					res( ctx );
				}
				
				else
					res( null );
			});
		},

		/**
		Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.
		@param {Object} req Totem request
		@param {Function} res Totem response
		*/
		delete: (req,res) => {	//< free a stateful engine with callback res(ctx || Error) 
			run(req, (ctx,step) => {
				res( ctx );
			});
		},

		/**
		Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.
		@param {Object} req Totem request
		@param {Function} res Totem response
		*/
		select: (req,res) => {	//< run a stateless engine with callback res(ctx || null) 
			//Log("atom run");
			run( req, (ctx, step) => {  // get engine stepper and its context
				//Log("atom run ctx", ctx, step);
				
				if ( ctx ) 
					step( ctx => {
						// Log("step ctx", ctx);
						res( ctx );
					});

				else
					res( null );
			});
		},

		/**
		Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.
		@param {Object} req Totem request
		@param {Function} res Totem response
		*/
		update: (req,res) => {	//< compile a stateful engine with callback res(ctx || Error)  
			run( req, (ctx,step) => {
				res( ctx );
			});
		},

		wrap: (code, ctx, cb) => { 
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

						return mixContext(sql,sqls,ctx,cb);	// continue key serialization
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
				return mixContext(sql, sqls, ctx, cb);	
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
				/*
				function portsDict(portsHash) {
				/ *
					mysql connection notes:
					install the python2.7 connector (rpm -Uvh mysql-conector-python-2.x.rpm)
					into /usr/local/lib/python2.7/site-packages/mysql, then copy
					this mysql folder to the anaconda/lib/python2.7/site-packages.

					import will fail with mysql-connector-python-X installed (rum or rpm installed as root using either
					python 2.2 or python 2.7).  Will however import under python 2.6.  To fix, we must:

							cp -r /usr/lib/python2.6/site-packages/mysql $CONDA/lib/python2.7/site-packages

					after "rpm -i mysql-connector-python-2.X".
					
					For some versions of Anaconda, we can get the "pip install python-connector" to work.
				* /
					var ports = Object.keys( portsHash );

					ports.forEach( (port,n) => {
						ports[n] = port + ":" + port;
					});

					return "{" + ports.join(",") + "}";
				}
					*/
				
				const 
					{ gen, db } = ATOM,
					// [client,host,usecase] = thread.split(":"),	
					pyEngine = "\t\t"+code.replace(/\n/mg, "\n\t\t"),
					script = `
# debug trace
# print "py>>locals",locals()
if _INIT:	#import global modules and connect to sqldb
	try:
		global _IMP, _JSON, _SYS, _FLOW, _SQL0, _SQL1, _NP
		import sys as _SYS			#system info
		import json as _JSON			#json interface
		from PIL import Image as _IMP		#jpeg image interface
		import mysql.connector as _SQLC		#db connector interface
		import numpy as _NP
		# import caffe as _CAFFE		#caffe interface
		# import flow as _FLOW		# record buffering and loading logic
		# setup sql connectors
		_SQL = _SQLC.connect(user='${db.python.user}', password='${db.python.pass}', database='${db.python.name}')
		# default exit codes and startup
		_ERR = 0
		_INIT = 0
	except:
		_ERR = 107
else:
	try:
		# entry
		_SQL0 = _SQL.cursor(buffered=True)
		_SQL1 = _SQL.cursor(buffered=True) 
		# embed engine
		${pyEngine}
		#exit
		_SQL.commit()
		_SQL0.close()
		_SQL1.close()
		_ERR = 0
	except:
		_ERR = 108
` ;
 			
				if (gen.trace) Log(script);

				cb( python(thread,script,ctx), ctx );
			},
			
			cv: function cvInit(thread,code,ctx,cb)  {
				if ( ctx.frame && ctx.detector )
					if ( err = opencv(thread,code,ctx) )
						cb( null, ctx );
				
					else
						cb( null, ctx );
				
				else
					cb( errors.badContext, ctx );
			},
			
			/*js: function jsInit(thread,code,ctx,cb)  {
				vmStore[thread] = {
					ctx: VM.createContext( Copy( $libs, {
						//$trace: ctx.$trace,
						//$pipe:	ctx.$pipe
					} ) ),
					code: code
				};
	
				cb( null, ctx );
			},*/
			
			js: function jsInit(thread,code,ctx,cb)  {
				console.log(">init", thread);
				const
					vm = vmStore[thread] = VM.createContext( Copy( $libs, {
						$array: Array.prototype,
						$string: String.prototype
					}) );
				
				try {
					VM.runInContext(
						"for (var f in $array) Array.prototype[f] = $array[f]; " +
						"for (var f in $string) String.prototype[f] = $string[f]; " +
						code, vm );		
					cb( null, ctx );
				}
				
				catch (err) {
					Log("JS INIT ERROR", err);
					cb(err, null);
				}
			},
			
			m: function mInit(thread,code,ctx,cb) {
				
				const { matlab, gen } = ATOM;
				
				var 
					[client,host,usecase] = thread.split(":"),				
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

			R: function meInit(thread,code,ctx,cb) {
				vmStore[thread] = {
					ctx: {},
					code: code
				};
				//Log(">>R pgm", code);
				cb(null,ctx);
			},
			
			mj: function meInit(thread,code,ctx,cb) {

				vmStore[thread] = {
					ctx: {
					},
					code: code
				};
				
				cb( null, ctx ); 
			},
			
			sq: function sqInit(thread,code,ctx,cb) {
				sqlThread( sql => {
					ctx.SQL[ctx.action](sql, [], function (recs) {
						//ctx.Save = [1,2,3];  // cant work as no cb exists
					});
				});
				
				return null;	
			},
			
			sh: function shInit(thread,code,ctx,cb) {  // Linux shell engines
				if (code) context.code = code;

				exec(context.code, function (err,stdout,stderr) {
					Log(err || stdout);
				});

				return null;
			}
		},

		step: {  //< step engines on given thread with callback cb(ctx) or cb(null) if error
			py: function pyStep(thread,ctx,cb) {
				if ( err = python(thread,"",ctx) ) 
					cb( errors[err] || errors.badError  );
				
				else 
					cb( ctx );
				
				return err;
			},
			
			cv: function cvStep(thread,ctx,cb) {	
				if ( err = ATOM.opencv(thread,"",ctx) ) 
					cb( errors[err] || errors.badError );

				else  
					cb( ctx );

				return err;
			},
			
			js: function jsStep(thread,ctx,cb) {
				Log(">step", thread, ctx.Host, ctx.Pipe );
				
				if ( vm = vmStore[thread] ) {
					try {
						//Log(">>>step vm", vm.$log);
						
						VM.runInContext(`${ctx.Host}($ctx,$res,$vm)`, Copy({
							$ctx: ctx,
							$res: cb,
							$vm: vm
						}, vm) );
						return null;
					}
					
					catch (err) {
						Log("js STEP ERROR", thread, err);
						cb( err );
						return err;
					}
				}
				
				else 
					return errors.lostContext;
			},
			
			m: function mStep(thread,ctx,cb) {
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
			
			R: function rStep(thread,ctx,cb) {
				//Log(">>>step", thread, vmStore[thread], ctx);
				if ( vm = vmStore[thread] ) {
					try {
						if ( err = R(thread, vm.code, ctx) )
							cb( errors[err] || errors.badError );
						
						else
							cb( ctx );
						
						return err;
					}
					catch (err) {
						//Log(thread,err);
						cb( err );
						return err;
					}
				}
				
				else 
					return errors.lostContext;				
			},
			
			mj: function meStep(thread,ctx,cb) {
				if ( vm = vmStore[thread] ) {
					sqlThread( sql => {
						//Copy( {SQL: sql, CTX: ctx, DATA: [], RES: [], PORT: port, PORTS: vm.ctx}, vm.ctx );

						$libs.ME.exec( vm.code, Copy(ctx, vm.ctx), vmctx => {
							//Log("vmctx", vmctx);
							cb( vmctx );
						});
					});
					return null;
				}
				
				else
					return errors.lostContext;	
				
				/*
				if ( vm = vmStore[thread] )
					sqlThread( sql => {
						Copy( {SQL: sql, CTX: ctx, DATA: [], RES: [], PORT: port, PORTS: vm.ctx}, vm.ctx );
						
						$libs.MATH.eval(vm.code,vm.ctx);
						return null;
					});
				
				else
					return errors.lostContext;	
				*/
			},
			
			sq: function sqStep(thread,ctx,cb) {

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
			
			sh: function shStep(thread,ctx,cb) {  // Linux shell engines
				if (code) context.code = code;

				exec(context.code, function (err,stdout,stderr) {
					Log(err || stdout);
				});

				return null;
			}
		}
			
	};

Start("atomic", {
	ctx: ATOM,
	
	A1: () => { 
		var TOTEM = require("../totem");

		Trace("A Totem+Engine client has been created", {
			a_tau_template: ATOM.tau("somejob.pdf"),
			engine_errors: ATOM.error,
			get_endpts: TOTEM.byTable,
			my_paths: TOTEM.paths
		});
	},
	
	A2: () => { 
		var TOTEM = require("../totem");

		TOTEM.config({}, err => {
			Trace( err || "Started but I will now power down" );
			TOTEM.stop();
		});

		ATOM.config({
			thread: TOTEM.thread
		});
	},
	
	A3: () => {
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
	},
	
	A4: () => {
		var TOTEM = require("../totem");
		
		TOTEM.config({
			"byTable.": {
				test: function Chipper(req,res) {

					var itau = [ ATOM.tau("test.jpg") ];
					var otau = [ ATOM.tau() ];

					Trace("query",req.query);
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
	}
});
		
// UNCLASSIFIED

