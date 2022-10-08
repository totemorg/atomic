# [ATOMIC](https://github.com/totem-man/atomic)

**ATOMIC** provides cloud computing for python, js, cv, matlab, R, ... engines 
via the following web endpoints:

	POST advance/step/insert a stateful engine
	PUT	compile/init/update a stateful engine
	DELETE deallocate/kill/delete a stateful engine
	GET execute/read/select a stateless engines

Stateless engines are supported at the read (GET) endpoint, and are provided
the following parameters:

	TAU.i = {tau} = input event sinked to an engine
	TAU.o = {tau} = output event sourced from an engine
	TAU.p = {sql: {...}, query: {...} }

where the query hash will contain the supplied url parameters.

Stateful engines implement the step-init-kill (POST-PUT-DELETE) endpoints, and are 
supplied event tokens (tau):

	TAU.i = [{tau}, ...] = events arriving to engine's input port
	TAU.o = [{tau}, ...] = events departing from engine's output port
	TAU.p = {port1: {...}, ... port2: {...}, ... sql: {...} }
	TAU.port = engine's in/out port to step
	TAU.thread = engine's 0-base thread counter

where input/output ports and engine code are defined by the [engine context](http://totem.hopto.org/api.view) || [COE](https://totem.west.ile.nga.ic.gov/api.view) || [SBU](https://totem.nga.mil/api.view).

An event token typically contain the following default fields (they can 
be freely interpretted and extended by the engine):

	job = "" 	= Current job thread N.N...
	work = 0 	= Anticipated/delivered data volume (dims bits etc)
	disem = "" 	= Disemination channel for this event
	classif = ""	= Classification of this event
	cost = ""	= Billing center
	policy = ""	= Data retention policy
	status = 0	= Status code
	value = 0	= Flow calculation

## Manage

	npm install @totemstan/atomic	# install
	npm run start [ ? | $ | ...]	# Unit test
	npm run verminor				# Roll minor version
	npm run vermajor				# Roll major version
	npm run redoc					# Regen documentation

## Usage

Acquire and optionally configure **ATOMIC** like this:

	var ATOMIC = require("atomic").config({
		key: value, 						// set key
		"key.key": value, 					// indexed set
		"key.key.": value					// indexed append
	});

where configuration keys follow [ENUMS deep copy conventions](https://github.com/totem-man/enums)


## Program Reference
<details>
<summary>
<i>Open/Close</i>
</summary>
<a name="module_ATOMIC"></a>

## ATOMIC
Provides cloud computing on python, js, cv, matlab, R, ... engines via web endpoints.  This module 
documented in accordance with [jsdoc](https://jsdoc.app/).

**Requires**: <code>module:[enums](https://github.com/totemstan/enums)</code>, <code>module:[child\_process](https://nodejs.org/docs/latest/api/)</code>, <code>module:[fs](https://nodejs.org/docs/latest/api/)</code>, <code>module:[vm](https://nodejs.org/docs/latest/api/)</code>, <code>module:[pythonIF](https://github.com/totemstan/atomic)</code>, <code>module:[opencvIF](https://github.com/totemstan/atomic)</code>, <code>module:[RIF](https://github.com/totemstan/atomic)</code>  
**Author**: [ACMESDS](https://totemstan.github.io)

### Env Dependencies

	HASGPU = 1|0
	HASCAFFE = 1|0  
**Example**  
```js
### Totem and Atomic Engine interfaces:

	var ATOMIC = require("../atomic");
	var TOTEM = require("../totem");

	Trace( "A Totem+Engine client has been created", {
		a_tau_template: ATOMIC.tau("somejob.pdf"),
		engine_errors: ATOMIC.error,
		get_endpts: TOTEM.reader,
		my_paths: TOTEM.paths
	});
```
**Example**  
```js
### Totem being powered up and down:

	var TOTEM = require("../totem");

	TOTEM.config({}, function (err) {
		Trace( err || "Started but I will now power down" );
		TOTEM.stop();
	});

	var ATOMIC = require("../engine").config({
		thread: TOTEM.thread
	});
```
**Example**  
```js
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
```
**Example**  
```js
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
```

* [ATOMIC](#module_ATOMIC)
    * _static_
        * [.paths](#module_ATOMIC.paths)
        * [.macs](#module_ATOMIC.macs)
        * [.db](#module_ATOMIC.db)
        * [.errors](#module_ATOMIC.errors)
        * [.config()](#module_ATOMIC.config)
        * [.run()](#module_ATOMIC.run)
        * [.save()](#module_ATOMIC.save)
        * [.insert(req, res)](#module_ATOMIC.insert)
        * [.delete(req, res)](#module_ATOMIC.delete)
        * [.select(req, res)](#module_ATOMIC.select)
        * [.update(req, res)](#module_ATOMIC.update)
        * [.mixContext()](#module_ATOMIC.mixContext)
    * _inner_
        * [~ATOMIC](#module_ATOMIC..ATOMIC)

<a name="module_ATOMIC.paths"></a>

### ATOMIC.paths
Paths to various things.

**Kind**: static property of [<code>ATOMIC</code>](#module_ATOMIC)  
**Cfg**: <code>Object</code>  
<a name="module_ATOMIC.macs"></a>

### ATOMIC.macs
Number of worker cores (aka threads) to provide in the cluster.  0 cores provides only the master.

**Kind**: static property of [<code>ATOMIC</code>](#module_ATOMIC)  
<a name="module_ATOMIC.db"></a>

### ATOMIC.db
Next available core

**Kind**: static property of [<code>ATOMIC</code>](#module_ATOMIC)  
**Cfg**: <code>Number</code>  
<a name="module_ATOMIC.errors"></a>

### ATOMIC.errors
Error messages

**Kind**: static property of [<code>ATOMIC</code>](#module_ATOMIC)  
**Cfg**: <code>Object</code>  
<a name="module_ATOMIC.config"></a>

### ATOMIC.config()
Configure the engine interface and estblish workers.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  
**Cfg**: <code>function</code>  
<a name="module_ATOMIC.run"></a>

### ATOMIC.run()
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

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  
<a name="module_ATOMIC.save"></a>

### ATOMIC.save()
Save context tau tokens into job files.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  
<a name="module_ATOMIC.insert"></a>

### ATOMIC.insert(req, res)
Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Totem request |
| res | <code>function</code> | Totem response |

<a name="module_ATOMIC.delete"></a>

### ATOMIC.delete(req, res)
Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Totem request |
| res | <code>function</code> | Totem response |

<a name="module_ATOMIC.select"></a>

### ATOMIC.select(req, res)
Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Totem request |
| res | <code>function</code> | Totem response |

<a name="module_ATOMIC.update"></a>

### ATOMIC.update(req, res)
Provides engine CRUD interface: step/insert/POST, compile/update/PUT, 
		run/select/GET, and free/delete/DELETE.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Totem request |
| res | <code>function</code> | Totem response |

<a name="module_ATOMIC.mixContext"></a>

### ATOMIC.mixContext()
Callback engine cb(ctx) with its state ctx primed with state from its ctx.Entry, then export its 
		ctx state specified by its ctx.Exit.
		The ctx.sqls = {var:"query...", ...} || "query..." enumerates the engine's ctx.Entry (to import 
		state into its ctx before the engine is run), and enumerates the engine's ctx.Exit (to export 
		state from its ctx after the engine is run).  If an sqls entry/exit exists, this will cause the 
		ctx.req = [var, ...] list to be built to synchronously import/export the state into/from the 
		engine's context.

**Kind**: static method of [<code>ATOMIC</code>](#module_ATOMIC)  
<a name="module_ATOMIC..ATOMIC"></a>

### ATOMIC~ATOMIC
**Kind**: inner property of [<code>ATOMIC</code>](#module_ATOMIC)  
**Cfg**: <code>Object</code>  
</details>

## Contacting, Contributing, Following

Feel free to 
* submit and status [TOTEM issues](http://totem.hopto.org/issues.view) 
* contribute to [TOTEM notebooks](http://totem.hopto.org/shares/notebooks/) 
* revise [TOTEM requirements](http://totem.hopto.org/reqts.view) 
* browse [TOTEM holdings](http://totem.hopto.org/) 
* or follow [TOTEM milestones](http://totem.hopto.org/milestones.view) 


* * *

&copy; 2012 ACMESDS