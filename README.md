/**
@class engine [![Forked from SourceForge](https://sourceforge.net)]
# ENGINE

The ENGINE NodeJS module provides a foundation for hyperthreaded workflows to both stateless and 
stateful engines of type

	X = py,js,sh,opencv,mat,matlab,csh,r,octave, ...

at ENGINE.X.  Engines are controlled via the following methods (restful http endpoints):

	step (POST,insert) to advance a stateful engine
	init (PUT,update) to compile a stateful engine
	kill (DELETE,delete) to deallocate a stateful engine
	read (GET,select) to execute a stateless engines

Stateful engines are supported by the step, init and kill methods, 
and are passed TAU event tokens:

	TAU.i = [{tau}, ...] = events arriving to engine's input port
	TAU.o = [{tau}, ...] = events departing from engine's output port
	TAU.p = {port1: {...}, ... port2: {...}, ... sql: {...} }
	TAU.port = engine's in/out port to step
	TAU.thread = engine's 0-base thread counter

where input/output port parameters and engine code are taken from
the Vars and Code engine context at workflow initialization, and 
where sql is a mysql database connector.  

Each event token contains the following default fields (they can 
be freely interpretted and extended by the engine):

	job = "" 	= Current job thread N.N...
	work = 0 	= Anticipated/delivered data volume (dims bits etc)
	disem = "" 	= Disemination channel for this event
	classif = ""	= Classification of this event
	cost = ""	= Billing center
	policy = ""	= Data retention policy
	status = 0	= Status code
	value = 0	= Flow calculation

Stateless engines are supported by the read method, and are passed
the following parameters:

	TAU.i = {tau} = input event sinked to an engine
	TAU.o = {tau} = output event sourced from an engine
	TAU.p = {sql: {...}, query: {...} }

where the query hash will contain the url parameters.

In addition to geoClient config paramaters, geoEngine accepts 
the config parameters:

	jobspath path to prefix to a tau.job
	app{...} crud interface to virtual tables

## Installation

Download the latest version with

	git clone https://git.geointapps.org/acmesds/flex
	
Typically, you will want to redirect the following to your project/master

	ln -s ../master/test.js test.js
	ln -s ../master/maint.sh maint.sh
	
## Examples

Below sample use-cases are from engine/test.js.

### E1
	
	E1: function () {

		var ENGINE = require("../engine");
		var TOTEM = require("../totem");

		Trace( "A default Totem client", {
			a_tau_template: ENGINE.tau("somejob.pdf"),
			engine_errors: ENGINE.error,
			get_endpts: TOTEM.reader,
			my_paths: TOTEM.paths
		});
		
	},

### E2

	E2: function () {

		var TOTEM = require("../totem");
		
		TOTEM.start({
			
			init: function () {

				Trace( "Totem being powered down" );
				
				TOTEM.stop();
			}
		});

		var ENGINE = require("../engine").config({
			thread: TOTEM.thread
		});

	},

### E3

	E3: function () {
		
		var TOTEM = require("../totem").start({

			"reader.": {
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

		var ENGINE = require("../engine").config({
			thread: TOTEM.thread
		});

		Trace( "Starting a trivial Totem with a chipper fetcher and a database" );

	}

## License

[MIT](LICENSE)

*/
