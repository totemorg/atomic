/* 
 * testIF is used to exercise the tau machines prepared by tauIF.cpp for the
 * tau index.js simulator.  
 * 
 * NOTE: MUST refactor ENGINE.python,js,opencv calls to conform to new engine
 * call function (name,port,tau,context,code).  But if "node testIF" loads 
 * w/o error we know the node-gyp bindings (includes and libs) are okey dokey.
 */
 
var ENGINE = module.exports = require("../engine");
	// './build/Release/engineIF');
	// 'geonode/tauif/build/Release/tauIF'

var itau = [ENGINE.tau()];
var otau = [ENGINE.tau()];
//var state = ENGINE.state();	
var JOBS = "/home/Admin/swag/jobs/";

switch (3) {
	case 1: // program and step haar opencv machine 
		parm =	{ tau: [], ports: {
			frame:	 {sink:1,scale:0},
			helipads:{sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
			faces:	 {sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		itau[0].job = "tile5";
		console.log(parm);
		console.log("INIT = ", ENGINE.opencv("opencv.Me.Thread1",parm,""));
		console.log("STEP = ", ENGINE.opencv("opencv.Me.Thread1","frame",itau));
		console.log("STEP = ", ENGINE.opencv("opencv.Me.Thread1","helipads",otau));
		console.log(otau);
		break;
		
	// python machines fail with "cant find forkpty" if "import cv2" attempted

	case 2.1: // program python machine
		parm =	{ 
			tau:	["redefine on run"],
			ports: {	
				frame:	 {sink:1,scale:0},
				helipads:{sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
				faces:	 {sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		pgm = "print 'py running'\n" 
		+ "print tau\n"
		+ "tau = [{'x':[11,12],'y':[21,22]}]\n"
		console.log("INIT = ", ENGINE.python("test.thread",parm,pgm));
		console.log(parm);
		break;

	case 2.2: // program and step python machine 
		parm =	{ ports: { 	
			frame:	 {sink:1,scale:0},
			helipads:{sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
			faces:	 {sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		itau[0].job = "tile5";
		pgm = "print 'py running'\n" 
		+ "def frame(tau,parms):\n\tprint parms\n\ttau[0] = {'x':[11,12],'y':[21,22]}\n\treturn -101\n"
		+ "def helipads(tau,parms):\n\tprint parms\n\treturn -102\n"
		+ "def faces(tau,parms):\n\tprint parms\n\treturn -103\n";
		
		console.log("INIT = ", ENGINE.python("PY.Me.Thread1",parm,pgm));
		console.log("STEP = ", ENGINE.python("PY.Me.Thread1","frame",itau));
		console.log(itau);
		console.log("STEP = ", ENGINE.python("PY.Me.Thread1","frame",itau));
		console.log(itau);
		//console.log("STEP = ", ENGINE.python("PY.Me.Thread1","helipads",otau));
		break;
		
	case 2.3: // program and step python machine string with reinit along the way
		parm =	{ ports: {	
			frame:	 {sink:1,scale:0},
			helipads:{sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
			faces:	 {sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		itau[0].job = "tile5";
		pgm = "print 'py running'\n" 
		+ "def frame(tau,parms):\n\tprint parms\n\treturn -101\n"
		+ "def helipads(tau,parms):\n\tprint parms\n\treturn -102\n"
		+ "def faces(tau,parms):\n\tprint parms\n\treturn -103\n";
		
		console.log("INIT = ", ENGINE.python("mytest",parm,pgm));
		console.log("STEP = ", ENGINE.python("mytest","frame",itau));
		console.log("REINIT = ", ENGINE.python("mytest",parm,pgm));
		console.log("STEP = ", ENGINE.python("mytest","frame",itau));
		console.log(otau);
		break;

	case 3: // program and step a js machine string
		parm =	{ ports: {	
			frame:	 {sink:1,scale:0},
			helipads:{sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
			faces:	 {sink:0,scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		itau[0].job = "tile5";
		jspgm = "console.log('js compiled');\n" 
		+ "TAU.frame = function(tau,parms) { tau[0].xyz=456; return -101; }\n"
		+ "TAU.helipads = function(tau,parms) { return -102; }\n"
		+ "TAU.faces = function(tau,parms) { return -103; }\n";
		
		console.log("INIT = ", ENGINE.js("mytest",parm,jspgm));
		console.log("STEP = ", ENGINE.js("mytest","frame",itau));
		console.log(otau);
		//console.log("STEP = ", ENGINE.python("test","helipads",otau,parm.helipads));
		break;	
	
/*
	 case 0: // program and step python machine 0:15
		console.log("PGM = ", ENGINE.sim(itau,otau,0,"test","print 123\n",state));
		console.log('STEP =', ENGINE.sim(itau,otau,0,"test",null,state));
		break;
		 
	case 3.1: // step opencv machines 16:31
	
		state.reset = 0; state.name = ""; state.index = -1; itau[0].job = "";
		console.log('PGM =', ENGINE.sim(itau,otau,16,"test","",state));
	
		state.reset = 1; state.name = "frame"; state.index = 0; itau[0].job = "$face1".replace("$",JOBS);
		console.log('STEP =', ENGINE.sim(itau,otau,16,"test",null,state));
		
		state.reset = 0; state.name = "faces"; state.index = 0; otau[0].job = itau[0].job+".test.haar";
		console.log('STEP =', ENGINE.sim(itau,otau,16,"test",null,state));
		break;

	case 3.2: // step opencv machines 16:31

		state.reset = 0; state.name = ""; state.index = -1; itau[0].job = "";
		console.log('PGM =', ENGINE.sim(itau,otau,16,"test","",state));

		state.reset = 1; state.name = "frame"; state.index = 0; itau[0].job = "$tile5".replace("$",JOBS);
		console.log('STEP =', ENGINE.sim(itau,otau,16,"test",null,state));

		state.reset = 0; state.name = "helipads"; state.index = 0; otau[0].job = itau[0].job+".test.haar";
		console.log('STEP =', ENGINE.sim(itau,otau,16,"test",null,state));
		break;

	case 4: // program and step python machine 0:15 
		console.log("PGM = ",  ENGINE.sim(itau,otau,0,"hack",null,state));
		console.log("STEP = ", ENGINE.sim(itau,otau,0,"hack",null,state));
		console.log("state = "+JSON.stringify(state));
		break;
		** */
}
