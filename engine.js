// UNCLASSIFIED

/**
 * @module geoEngine
 * @public
 * @requires geonode
 * @requires engineIF
 * @requires child_process
 * @requires fs
 * @requires mathjs
 * @requires digitalsignals
 * @requires graceful-lwip
 * @requires crypto
 * 
 * The geoEngine client extends the barebones geonode client to 
 * provide a hyperthreaded workflow to both stateless and
 * stateful ENGINE.X engines 
 * 
 * 		X = py,js,sh,opencv,mat,matlab,csh,r,octave, ...
 * 
 * having methods (restful http):
 * 
 *  	insert (POST,insert) to advance a stateful engine
 * 		init (PUT,update) to compile a stateful engine
 * 		kill (DELETE,delete) to deallocate a stateful engine
 * 		read (GET,select) to execute a stateless engines
 * 
 * During workflow execution (step/PORT, init/PUT, kill/DELETE 
 * CRUD methods), stateful engines are passed TAU event tokens:
 * 
 * 	TAU.i = [{tau}, ...] = events arriving to engine's input port
 * 	TAU.o = [{tau}, ...] = events departing from engine's output port
 * 	TAU.p = {port1: {...}, ... port2: {...}, ... sql: {...} }
 * 	TAU.port = engine's in/out port to step
 * 	TAU.thread = engine's 0-base thread counter
 * 
 * where input/output port parameters and engine code are taken from
 * the Vars and Code engine parameter at workflow init, and where sql 
 * is a database connector.  
 * 
 * Each event token contains the following default fields (they can 
 * be freely extended by the engine):
 * 
 * 	job = "" 	= Current job thread N.N...
 * 	work = 0 	= Anticipated/delivered data volume (dims bits etc)
 * 	disem = "" 	= Disemination channel for this event
 * 	classif = ""	= Classification of this event
 * 	cost = ""	= Billing center
 * 	policy = ""	= Data retention policy
 * 	status = 0	= Status code
 * 	value = 0	= Flow calculation
 * 
 * When accessed at an end-point (read/GET CRUD method) stateless 
 * engines are passed the following parameters:
 * 
 * 	TAU.i = {tau} = input event sinked to an engine
 * 	TAU.o = {tau} = output event sourced from an engine
 * 	TAU.p = {sql: {...}, query: {...} }
 * 	
 * where the query hash will contain the url parameters.
 * 
 * In addition to geoClient config paramaters, geoEngine accepts 
 * the config parameters:
 * 
 * 		jobspath path to prefix to a tau.job
 * 		app{...} crud interface to virtual tables
 * 
 * Usage examples:
 * 
 * 		See client.js for usage examples.
 * */

var															// globals
	ENV = process.env,
	DOT = ".",
	LIST = ",";
	
var 														// NodeJS modules
	CP = require("child_process"),
	FS = require("fs"),	
	CLUSTER = require("cluster");
	
var 														// geoNode modules
	ENGINE = require('./engines/build/Release/engineIF'),  	//< engineIF built by node-gyp
	ENUM = require("../geonode");
	
var															// shortcuts
	Thread = ENUM.thread,
	Copy = ENUM.copy,
	Each = ENUM.each,
	Trace = ENUM.trace 
		? function (msg) {
			console.log(msg);
		}
		: function () {};
	
ENGINE.init = function (geoENG) {
	
	Thread( function (sql) {
	
		Trace(`INITIALIZING ENGINES ${geoENG.name||undefined}`);
		//ENGINE.paths.jobs = args.jobspath;
		//ENGINE.nextcore = args.cores ? 1 : 0;
		//ENGINE.app = args.vtl;
		//sql = args.sql;
		return;
		
		sql.query("DELETE FROM simcores");
		
		if (CLUSTER.isWorker) 
			CLUSTER.worker.process.on("message", function (eng,socket) {
				if (eng.core) { 		// process only tau messages (ignores sockets, etc)
	Trace(eng);
					var args = eng.args;
					var core = eng.core;
					
					ENGINE.compute(function (sql) {					
						args.sql = sql;
						ENGINE.compute(core, args, function (context) {
							try {
								var rtn = ENGINE[core.type](core.name,args.port,context.tau,context,core.code);

								if (rtn) 								// engine failed
									socket.end( 
										context.query 			// query defined if this is a read; otherwise this is a step
										? JSON.stringify({
											success: false,
											msg: ENGINE.error[rtn]||"error",
											count: 0,
											data: []
										})
										: ENGINE.error[rtn]||"error"
									);

								else  								// engine worked
									socket.end( 					// query defined if this is a read; otherwise this is a step
										context.query
										? JSON.stringify({  
												success: true,
												msg: "ok",
												count: 0,
												data: ENGINE.maptau(context)
											})
										: JSON.stringify(context.tau) 
									);

							}
							catch (err) {
								
								socket.end( 
									context.query 
									? JSON.stringify({
											success: false,
											msg: err+"",  
											count: 0,
											data: []
										})
									: err+""
								);
								
							}
						});
					});
				}
			});
	});
	
};

ENGINE.plugin = {
	MATH: require('mathjs'),
	LWIP: require('../graceful-lwip'),
	DSP: require('digitalsignals'),
	CRYPTO: require('crypto'),
	CON: console,
	JSON: JSON
};

ENGINE.error = {
	"-1": "engine returned invalid code",
	101: "engine could not be loaded",
	102: "engine received bad port/query",
	103: "engine could not be compiled",
	104: "engine failed entry/exit",
	105: "engine exhausted engine pool",
	106: "engine received bad query",
	107: "engine has no worker at this port",
	108: "engine has no context",
	109: "engine could not handoff to worker"
};

ENGINE.context = {};

ENGINE.tau = function (job) {
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
}

/**
* @method core
* 
* Execute the supplied callback with the engine core assigned to the specifed Client.Engine.Instance
* thread defined by this request (in the req.body and req.log).  If a workflow Instance is 
* provided, then the engine is assumed to be in a workflow (thus the returned core will remain
* on the same compile-step thread); otherwise, the engine is assumed to be standalone (thus forcing
* the engine to re-compile every time it is stepped).
* 
* The terms "process", "engine core", "safety core", are "worker" are equivalent concepts, and 
* should not be confused with a physical "cpu core".  Because heavyweight (spawned) workers 
* run in their own V8 instance, they can tollerate all faults (even infamous core-dump exceptions).
* Lightweight (cluster) workers, however, share the same V8 instance.  Heavyweight workers thus
* provide greater safety for bound executables (like opencv and python) at the expense of greater
* cpu overhead.  
*
* The goal hyperthreading \is to balance threads across cpu cores.  The workerless (master only)
* configuration will intrinsically utilize only one of its underlying cpu cores (the OS remains, 
* however, free to bounce between cpu cores via SMP).  A worker cluster, however, tends to 
* balance threads across all cpu cores, especially when the number of allocated workers exceeds
* the number of physical cpu cores.
* 
* To support hyperthreading on stateful engines, the master and workers should be listening on
* different ports: e.g, master on port N+1 and all workers on the same port N.  In this way 
* hyperthreading is provided to stateless sql (and assumed stateless tau) engines by accessing 
* the service on port N, while stateful tau engines can be hyperthreaded by accessing the service 
* on port N+1.
*/
ENGINE.core = function (req,args,cb) {	  // called by master to thread a stateful engine
	var sql = req.sql,
		log = req.log,
		client = log.Client,
		name = client+DOT+log.Table+DOT+(req.body.thread || "0");

	// Get assocated engine core if already allocated; otherwise allocate a new core.  We keep the
	// cores in a sql table so that all cluster workers have a common place to access engine
	// cores, thus allowing the engine to stay on the same worker core.  In this way, we can
	// step the engine on the same thread (hence state) is was compiled on.  If no thread is
	// specified (e.g. when engine called outside a workflow), then the engine will be forced
	// to recompile itself.
	
	sql.query("SELECT *,count(ID) AS found FROM simcores WHERE ? LIMIT 0,1", {name:name})  
	.on("result", function (core) { 	// Engine already initialized/programmed

		if (core.found) {
			EVENT.log("CORE "+core.wid+" SWITCHED TO "+name);
				
			core.code = "";
			core.vars = "";
			
			if ( CLUSTER.isMaster ) {
				if (core.wid) { 		// engine was assigned to a worker
					var engine = CLUSTER.workers[core.wid];
					delete args.sql;
					
					if (engine) 		// pass to assigned stateful worker
						engine.send({core:core,args:args}, req.connection );
					else 
						cb(ENGINE.error[107]); 
				}
				else  					// engine was assigned to this master
					ENGINE.compute(core, args, function (context) {
						ENGINE.call(core, context, cb);
					});
			}
			else 						// pass to this stateful worker
			if (core.wid == CLUSTER.worker.id) 
				ENGINE.compute(core, args, function (context) {
					ENGINE.call(core, context, cb);
				});
			else 
				cb(ENGINE.error[107]);
		}
		else 
			sql.query("SELECT *,count(ID) AS found FROM engines WHERE least(?) LIMIT 0,1", {Name:log.Table,Enabled:true,Period:0})
			.on("result", function (eng) {

				if (eng.found) {
					var core = { 												// define engine core
						name: name,
						type: eng.Engine.toUpperCase(),
						wid: CLUSTER.isMaster ? 0 : CLUSTER.worker.id,
						client: client,
						code: eng.Code,
						vars: eng.Vars
					};

					if (CLUSTER.isMaster && ENGINE.nextcore) {   	// assign to next worker
						var engine = 
							CLUSTER.workers[core.wid = ENGINE.nextcore++] ||
							CLUSTER.workers[core.wid = ENGINE.nextcore = 1];	
					}

					EVENT.log("CORE "+core.wid+" ASSIGNED TO "+name);

					sql.query("INSERT INTO simcores SET ?", {
						name:core.name,
						type:core.type,
						wid:core.wid,
						client:core.client
					});

					if (ENGINE.nextcore) {  										// handoff to assigned worker
						delete args.sql;

						if (engine) 
							engine.send({core:core,args:args}, req.connection);

						else 
							cb(ENGINE.error[107]); 
					}
					else  														// pass to this worker
						ENGINE.compute(core, args, function (context) {
							ENGINE.call(core, context, cb);
						});
				}
				else
					cb(new Error("No such enabled engine"));
			});			

	});
}

/**
 * @method save
 * 
 * Save fully addressed tau job files.
*/
ENGINE.save = function (sql,taus,port,engine,saves) {	// called by cluster worker to log engine output ports
	var t = new Date();
	
	Each(taus, function (n,tau) {
		if (tau.job) {
			var hasjpg = FS.existsSync(tau.job+".jpg");
			var log = hasjpg ? {jpg: "jpg".tag("a",{href:tau.job+".jpg"})} : {};

			FS.readFile(tau.job+".json", {encoding: "utf8"}, function (err,data) {
				if (!err) {
					try {
						var rtn = JSON.parse(data) || {};
					}
					catch (err) {
						var rtn = {};
					}
				
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
						output: engine + DOT + port,
						name: logn,
						value: logv,
						special: logv
					});
				});						
			});			
		}	
	});
}

/**
 * @method call
 * Compile and/or step an engine in its context.
 * */
ENGINE.call = function (core,context,cb) {
	Each(context.tau, function (n,tau) { 			// prefix jobs with mount point
		tau.job = ENGINE.paths.jobs + tau.job;
	});

	try {  												// call the module
		var rtn = ENGINE[core.type](core.name,context.port,context.tau,context,core.code);
		cb(null,context);
	}
	catch (err) {
		cb(err+"",context);
	}
	
	//ENGINE.save(sql,context.otau,context.port,core.name,core.save);

	Each(context.tau, function (n,tau) { 			// remove mount point from jobs
		if (tau.job) 
			tau.job = tau.job.substr(ENGINE.paths.jobs.length);
	});

}

// CRUD interface

/**
 * @method step
 * @method kill
 * @method read
 * @method init
 * 
 * The step, kill, read, and init methods provide a means to advance, deallocate, 
 * read and compile an engine (implmementeed via restfull insert/POST, update/PUT,
 * select/GET, and delete/DELETE).  
*/

ENGINE.insert = ENGINE.step = function (req,res) {	// called by worker to step a stateful engine
	try {
		var args = {
			tau: JSON.parse(req.body.tau || '[]'),
			port: JSON.parse(req.body.port || '""'),
			sql: req.sql,
			query: false,
			action: "insert"
		};
	}
	catch (err) {
		res(err+"");
	}

	ENGINE.core(req,args,function (err,context) {
		res(err || JSON.stringify(context.tau));
	});
}

ENGINE.delete = ENGINE.kill = function (req,res) {	// called by worker to free a stateful engine
	var sql = req.sql, log = req.log;

	sql.query("DELETE FROM simcores WHERE ?", {client:log.Client});
	res("freed engines for "+log.Client);
}

ENGINE.select = ENGINE.read = function (req,res) {	// called by worker to read a stateless engine 
	function guard(q) {
		if (q != true) {
			for (var n in q) 
				try { q[n] = JSON.parse(q[n]); } catch (err) { }
			
			for (var n in q) return q;
		}
			
		return true;
	}

	try {
		var args = {
			tau: [ENGINE.tau()],
			port: req.query.port || "",
			sql: req.sql,
			query: guard(req.query),
			action: "select"
		};
	}
	catch (err) {
		res(err+"");
	}
	
	ENGINE.core(req,args,function (err,context) {
		res( err || ENGINE.maptau(context) );
	});
}

ENGINE.update = ENGINE.init = function (req,res) {	// called by worker to initialize a stateful engine
	try {
		var args = {
			tau: [ENGINE.tau()],
			port: "",
			sql: req.sql,
			query: false,
			action: "update"
		};
	}
	catch (err) {
		res(err+"");
	}
	
	ENGINE.core(req,args,function (err,context) {
		res(err);
	});
}

// Methods to execute engine 

/**
 * @method return
 * */
ENGINE.maptau = function (context) {
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
}

/**
 * @method run
 * 
 * Run the callback cb in the context as imported by the context.entry sql 
 * hash, and exported by the context.exit sql hash.
 * */
ENGINE.run = function (context,cb) {
	var vars = context.vars, sql = context.sql;

	if (vars) {
		if ( vars.length ) {
			var n = vars[vars.length-1]; vars.length--;
			var query = context.sqls[n];
			
			if (typeof query != "string") {
				query = query[0];
				args = query.slice(1);
			}
			
			if (context.sqls == context.entry) {
				var data = context[n] = [];
				var args = context.query;
			}
			else {
				var data = context[n] || [];
				var args = [n, {result:data}, context.query];
			}
				
			sql.query(query, args)
			.on("error", function (err) {
				
				context.err = err;
				context[n] = null;
				
			})
			.on("result", function (rec) {
				
				if (rec.hash)
					data.push(rec);
				else {
					var vec=[];
					for (var n in rec) 
						if (rec.hasOwnProperty(n)) vec.push(rec[n]);
					
					data.push(vec);
				}
				
			})
			.on("end", function () {
//Trace(n+"="+q.sql+"="+data);
				ENGINE.run(context,cb);
			});
		}
		else
		if (cb) {
			cb(context);
			
			if (context.exit) {
				var sqls = context.sqls = context.exit;
				var vars = context.vars = []; for (var n in sqls) vars.push(n);

				ENGINE.run(context);
			}
		}
	}
	else
	if (context.entry) {
		var sqls = context.sqls = context.entry;
		var vars = context.vars = []; for (var n in sqls) vars.push(n);
		
		ENGINE.run(context, cb);
	}
	else
		cb(context);
}

/**
 * @method thread
 * */
ENGINE.compute = function (core,args,cb) {	
	if (core.code) {
		try {
			eval("var vars = "+ (core.vars || "{}"));
		}
		catch (err) {
			var vars = {};
		}
		
		var context = ENGINE.context[core.name] = VM.createContext(Copy(ENGINE.plugin,Copy(args,vars)));
		ENGINE.run(context,cb);
	}
	else {
		var context = Copy( args, ENGINE.context[core.name] || VM.createContext({}) );
		cb(context);
	}
}

// Engines

ENGINE.sql = function (name,port,tau,context,code) {

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
}

ENGINE.mat = function (name,port,tau,context,code) {
	
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
}

ENGINE.js = function (name,port,tau,context,code) {
	
	if (port) 
		//return context[port](context.tau,context.context[port]);
		return context[port](tau,context.ports[port]);
		
	if (code) context.code = code;

	VM.runInContext(context.code,context);
	return 0;
}

ENGINE.py = function (name,port,tau,context,code) {
	
	if (code) {
		context.ports = context.ports || {};  	// engine requires valid ports hash
		context.tau = tau || []; 				// engine requires valid event list

		delete context.sql;				// remove stuff that would confuse engine

		for (var n in ENGINE.plugin) 	
			delete context[n];
			
		var err = ENGINE.python(name,context,code);
		
		for (var n=0,N=context.tau.length; n<N; n++) 
			tau[n] = context.tau[n];
		
		return err;
	}
	else
		return ENGINE.python(name,port,tau);
}

ENGINE.sh = function (name,port,tau,context,code) {
	if (code) context.code = code;

	CP.exec(context.code, function (err,stdout,stderr) {
		Trace(err || stdout);
	});
	
	return 0;
}

function Initialize() {
	Trace("##geoEngine initialized");

	/*
	if (IO) 
		sqlThread( function (sql) {
			sql.query("SELECT * from simcores WHERE ?",{pid: process.pid})
			.on("result", function (core) {
				Trace(`ENGINE ALERT ${core.client}: ${err}`);
				IO.sockets.emit("alert", {msg: err, to: core.client, from: ENUM.TITLE});
			});
		});
	*/

}

// UNCLASSIFIED
