// Exercise the tau machines provided by engineIF.cpp 
 
var ATOM = module.exports = require("../atomic");

var 
	Log = console.log,
	itau = [ATOM.tau( "test.jpg" )],
	otau = [ATOM.tau()];

switch ("py1") {
	case "cv": // program and step haar opencv machine 
		var ctx =	{
			tau: [], 
			ports: {
				frame:	 {},
				helipads: {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
				faces:	 {scale:0.05,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		
		for (var n=0,N=1;n<N;n++)  // program N>1 to test reprogram
			Log(`INIT[${n}] = `, ATOM.opencv("opencv.Me.Thread1","setup",ctx));
		
		for (var n=0,N=5;n<N;n++) // step N>1 to test multistep
			Log(`STEP[${n}] = `, ATOM.opencv("opencv.Me.Thread1","frame",itau));

		// returns badStep if the cascades were undefined at the program step
		Log("STEP = ", ATOM.opencv("opencv.Me.Thread1","helipads",otau));
		Log(otau);
		break;
		
	// python machines fail with "cant find forkpty" if "import cv2" attempted

	case "py1": // program python machine
		var 
			ctx =	{ 
				tau:	["redefine on run"]
			},
			pgm = `
print 'Look mom - Im running python!'
import numpy # fails under nodejs v10
print "tau=", CTX['tau']
CTX['Save'] = [{'x':[11,12],'y':[21,22]}]
`;
		
		// By default python attempts to connect to mysql.  
		// So, if mysql service not running or mysql.connector module not found, this will not run.
		Log({
			init: ATOM.python("py1.thread",pgm,ctx),
			ctx: JSON.stringify(ctx)
		});
		break;

	case "py2": // program and step python machine 
		var 
			ctx =	{ 
				ports: { 	
					frame:	 {},
					helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
					faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
			}},
			pgm = `
print 'Look mom - Im running python!'
def frame(tau,spec):
	print spec
	return -101
def helipads(tau,spec):
	print spec
	return -102
def faces(tau,spec):
	print spec
	return -103
`;		
		
		Log("INIT = ", ATOM.python("py2.Me.Thread1",pgm,ctx));
		
		for (var n=0,N=1; n<N; n++)
			Log(`STEP[${n}] = `, ATOM.python("py2.Me.Thread1","frame",itau));

		Log("STEP = ", ATOM.python("py2.Me.Thread1","helipads",otau));
		break;
		
	case "py3": // program and step python machine string with reinit along the way
		var 
			ctx =	{ 
				ports: {	
					frame:	 {},
					helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
					faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
			}},		
			pgm = `
print 'Look mom - Im running python!'
def frame(tau,spec):
	print spec
	return -101
def helipads(tau,spec):
	print spec
	return -102
def faces(tau,spec):
	print spec
	return -103
`;
		
		Log("INIT = ", ATOM.python("py3",pgm,ctx));
		Log("STEP = ", ATOM.python("py3","frame",itau));
		Log("REINIT = ", ATOM.python("py3",pgm,ctx));
		Log("STEP = ", ATOM.python("py3","frame",itau));
		Log(otau);
		break;

	case "js": // program and step a js machine string
		var 
			ctx =	{ 
				ports: {	
					frame:	 {},
					helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
					faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
			}},
			pgm = `
CON.log('Look mom - Im running javascript!');
function frame(tau,spec) { 
	CON.log("here I come to save the day");
	tau[0].xyz=123; 
	return 0; 
}
function helipads(tau,spec) { 
	tau[0].results=666; 
	return 101; 
}
function faces(tau,spec) { return 102; }
`;
		
		Log("INIT = ", ATOM.js("mytest",pgm,ctx));
		// frame should return a 0 = null noerror
		Log("STEP = ", ATOM.js("mytest","frame",itau));
		Log(itau);
		// helipads should return a 101 = badload error
		Log("STEP = ", ATOM.js("mytest","helipads",otau));
		Log(otau);
		break;	
	
/*
	 case 0: // program and step python machine 0:15
		Log("PGM = ", ATOM.sim(itau,otau,0,"test","print 123\n",state));
		Log('STEP =', ATOM.sim(itau,otau,0,"test",null,state));
		break;
		 
	case 3.1: // step opencv machines 16:31
	
		state.reset = 0; state.name = ""; state.index = -1; itau[0].job = "";
		Log('PGM =', ATOM.sim(itau,otau,16,"test","",state));
	
		state.reset = 1; state.name = "frame"; state.index = 0; itau[0].job = "$face1".replace("$",JOBS);
		Log('STEP =', ATOM.sim(itau,otau,16,"test",null,state));
		
		state.reset = 0; state.name = "faces"; state.index = 0; otau[0].job = itau[0].job+".test.haar";
		Log('STEP =', ATOM.sim(itau,otau,16,"test",null,state));
		break;

	case 3.2: // step opencv machines 16:31

		state.reset = 0; state.name = ""; state.index = -1; itau[0].job = "";
		Log('PGM =', ATOM.sim(itau,otau,16,"test","",state));

		state.reset = 1; state.name = "frame"; state.index = 0; itau[0].job = "$tile5".replace("$",JOBS);
		Log('STEP =', ATOM.sim(itau,otau,16,"test",null,state));

		state.reset = 0; state.name = "helipads"; state.index = 0; otau[0].job = itau[0].job+".test.haar";
		Log('STEP =', ATOM.sim(itau,otau,16,"test",null,state));
		break;

	case 4: // program and step python machine 0:15 
		Log("PGM = ",  ATOM.sim(itau,otau,0,"hack",null,state));
		Log("STEP = ", ATOM.sim(itau,otau,0,"hack",null,state));
		Log("state = "+JSON.stringify(state));
		break;
		** */
}
