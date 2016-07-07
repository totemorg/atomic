// UNCLASSIFIED

/**
 * @module ENGINE
 * @public
 * @requires engineIF
 * @requires child_process
 * @requires fs
 * @requires enum
 * @requires mathjs
 * @requires digitalsignals
 * @requires graceful-lwip
 * @requires crypto
 * 
 * Provides a foundation for hyperthreaded workflows to both stateless
 * and stateful engines ENGINE.X 
 * 
 * 		X = py,js,sh,opencv,mat,matlab,csh,r,octave, ...
 * 
 * having methods (restful http endpoints):
 * 
 *  	step (POST,insert) to advance a stateful engine
 * 		init (PUT,update) to compile a stateful engine
 * 		kill (DELETE,delete) to deallocate a stateful engine
 * 		read (GET,select) to execute a stateless engines
 * 
 * Stateful engines are supported by the step, init and kill endpoints, 
 * and are passed TAU event tokens:
 * 
 * 		TAU.i = [{tau}, ...] = events arriving to engine's input port
 * 		TAU.o = [{tau}, ...] = events departing from engine's output port
 * 		TAU.p = {port1: {...}, ... port2: {...}, ... sql: {...} }
 * 		TAU.port = engine's in/out port to step
 * 		TAU.thread = engine's 0-base thread counter
 * 
 * where input/output port parameters and engine code are taken from
 * the Vars and Code engine context at workflow initialization, and 
 * where sql is a mysql database connector.  
 * 
 * Each event token contains the following default fields (they can 
 * be freely interpretted and extended by the engine):
 * 
 * 		job = "" 	= Current job thread N.N...
 * 		work = 0 	= Anticipated/delivered data volume (dims bits etc)
 * 		disem = "" 	= Disemination channel for this event
 * 		classif = ""	= Classification of this event
 * 		cost = ""	= Billing center
 * 		policy = ""	= Data retention policy
 * 		status = 0	= Status code
 * 		value = 0	= Flow calculation
 * 
 * Stateless engines are supported at the read endpoint, and are passed
 * the following parameters:
 * 
 * 		TAU.i = {tau} = input event sinked to an engine
 * 		TAU.o = {tau} = output event sourced from an engine
 * 		TAU.p = {sql: {...}, query: {...} }
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

var 														// NodeJS modules
	CP = require("child_process"),
	FS = require("fs"),	
	CLUSTER = require("cluster"),
	VM = require("vm");
	
var 														// geoNode modules
	ENUM = require("../enum");
	
var															// shortcuts
	Copy = ENUM.copy,
	Each = ENUM.each,
	Trace = function (msg) {
		console.log(msg);
	};
	
var
	ENGINE = module.exports = require("./engines/build/Release/engineIF");  	//< engineIF built by node-gyp

ENGINE.paths = {
	jobs: "./jobs/"
};

ENGINE.thread = null;

ENGINE.cores = 0;
ENGINE.nextcore = 0;

ENGINE.config = function (opts) {
	
	Trace(`Engines configured`);

	if (opts) Copy(opts,ENGINE);
	
	if (ENGINE.thread)
	ENGINE.thread( function (sql) {
	
		sql.query("DELETE FROM app1.simcores", function (err) {
			Trace(err || "RESET ENGINE CORES");
		});

		ENGINE.nextcore = ENGINE.cores ? 1 : 0;
		
		if (CLUSTER.isWorker) 	
			CLUSTER.worker.process.on("message", function (eng,socket) {

				if (eng.core) { 		// process only tau messages (ignores sockets, etc)
	
//Trace(eng);
					var args = eng.args,
						core = eng.core,
						format = eng.format;
					
					ENGINE.thread(function (sql) {
						args.sql = sql;
						
						ENGINE.compute(core, args, function (context) {

							if (engine = ENGINE[core.type] )
								try {
									var rtn = ENGINE.error[engine(core.name,args.port,context.tau,context,core.code)] || "ok";
								}
								catch (err) {
									var rtn = err+"";
								}
							else
								var rtn = ENGINE.error[110];

//Trace("rtn="+rtn);

							switch (format) {
								case "db":
									socket.end( JSON.stringify({ 
										success: true,
										msg: rtn,
										count: 0,
										data: ENGINE.maptau(context)
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
	0: "ok",
	101: "engine could not be loaded",
	102: "engine received bad port/query",
	103: "engine could not be compiled",
	104: "engine failed entry/exit",
	105: "engine exhausted engine pool",
	106: "engine received bad query",
	107: "engine cant reach assigned worker at this port",
	108: "engine has no context",
	109: "engine could not handoff to worker",
	110: "engine type not supported",
	111: "engine does not exists or is not enabled"
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
* As used here (and elsewhere) the terms "process", "engine core", "safety core", and "worker" are 
* equivalent concepts, and should not be confused with a physical "cpu core".  Because heavyweight 
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
*/
ENGINE.core = function (req,args,cb) {	  // called by master to thread a stateful engine
	var sql = req.sql,
		name = `${req.client}.${req.table}.${req.body.thread || "0"}`;


	function execute(args,core,cb) {

		var my_wid = CLUSTER.isMaster ? 0 : CLUSTER.worker.id;

//Trace(core);

		if (CLUSTER.isMaster) 		// only the master can send work to its workers (and itself)
			
			if (core.wid) { 		// engine was assigned to a worker
				var worker = CLUSTER.workers[core.wid];
				delete args.sql;
				
				if (worker) 		// let assigned stateful engine respond on this socket
					worker.send({core:core,args:args,format:req.type}, req.connection);
				else 
					cb(new Error(ENGINE.error[107]) ); 
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
			cb( new Error(ENGINE.error[107]) );
	}

	// Get assocated engine core if already allocated; otherwise allocate a new core.  We keep the
	// cores in a sql table so that all cluster workers have a common place to access engine
	// cores, thus allowing the engine to stay on the same worker core.  In this way, we can
	// step the engine on the same thread (hence state) is was compiled on.  If no thread is
	// specified (e.g. when engine called outside a workflow), then the engine will be forced
	// to recompile itself.
	
	sql.query("SELECT *,count(ID) AS found FROM simcores WHERE ? LIMIT 0,1", {name:name})  
	.on("result", function (core) { 	// Engine already initialized/programmed

		if (core.found) {
			Trace("CORE"+core.wid+" SWITCHED TO "+name);

			core.code = "";
			core.vars = "";

			execute(args,core,cb);
		}
		else 
			sql.query(
				"SELECT *,count(ID) AS found FROM engines WHERE least(?) LIMIT 0,1", 
				{Name:req.table,Enabled:true})
				
			.on("result", function (eng) {

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
					cb( new Error(ENGINE.error[111]) );

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
}

/**
 * @method call
 * Compile and/or step an engine in its context.
 * */
ENGINE.call = function (core,context,cb) {
	Each(context.tau, function (n,tau) { 			// prefix jobs with mount point
		tau.job = ENGINE.paths.jobs + tau.job;
	});

	if ( engine = ENGINE[core.type] )
		try {  												// call the module
			var rtn = engine(core.name,context.port,context.tau,context,core.code);
			cb(null,context);
		}
		catch (err) {
			cb(err+"",context);
		}
	else
		cb (new Error(`Bad engine type ${core.type}`));
	
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
			tau: req.body.tau.parse([]),
			port: req.body.port.parse(""),
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
	var sql = req.sql;

	sql.query("DELETE FROM simcores WHERE ?", {client:req.client});
	res(`FREED ${req.client} ENGINES`);
}

ENGINE.select = ENGINE.read = function (req,res) {	// called by worker to read a stateless engine 
	function guard(q) {
		if (q != true) {
			for (var n in q) 
				try { q[n] = (q[n]||"").parse(0); } catch (err) { }
			
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
 * Run the callback cb in the given context with imports defined by the
 * context.entry sql hash, and as exported by the context.exit sql hash.
 * */
ENGINE.run = function (context,cb) {
	var vars = context.vars, sql = context.sql;

	// The sqls = {var:"sql", ...} are defined by the context.entry (to import vars into the context before an 
	// is run) or by the context.exit (export vars from context after engine is run).  If an sqls entry/exit 
	// exists, this will cause the context.vars = [var, ...] list to be built to synchronously import/export
	// the vars into/from the engine's context.

	if (vars) {    	
		if ( vars.length ) { 						// more vars to import/export
			var varn = vars[vars.length-1]; vars.length--; 	// var to import/export
			var query = context.sqls[varn]; 					// sql to import/export
			
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
				
			var q = sql.query(query, args, function (err, recs) { 	// import/export this var

//Trace([varn,err,q.sql]);
				
				if (err) {
					context.err = err;
					context[varn] = null;
				}
				else 
					if (context.sqls == context.entry)  // importing
						for (var n=0,N=recs.length; n<N; n++) data[n] = Copy(recs[n], {});
					else { 								// exporting
					}					
				
				ENGINE.run(context,cb);
			});
		}
		else 					// no more vars to load
		if (cb) {				// run engine in its context
			cb(context);
			
			if (context.exit) {	// save selected engine context vars
				var sqls = context.sqls = context.exit;
				var vars = context.vars = []; for (var n in sqls) vars.push(n);

				ENGINE.run(context);
			}
		}
	}
	else
	if (context.entry) {  // build the context.vars from the context.entry sqls
		var sqls = context.sqls = context.entry;
		var vars = context.vars = []; for (var n in sqls) vars.push(n);
		
//Trace("entry vars="+vars);
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
	
//Trace([name,port,tau,code]);

	if (port) 
		if (engine = context[port])
			return engine(tau,context.ports[port]);  		//context[port](context.tau,context.context[port]);

		else
			return new Error(`No engine port ${port}`);
		
	if (code) context.code = code;

	VM.runInContext(context.code,context);
	return 0;
}

ENGINE.py = function (name,port,tau,context,code) {

console.log([name,port,code]);
	
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

// UNCLASSIFIED
