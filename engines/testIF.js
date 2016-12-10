// Exercise the tau machines provided by engineIF.cpp 
 
var ENGINE = module.exports = require("../engine");

var itau = [ENGINE.tau()];
var otau = [ENGINE.tau()];

switch (2.2) {
	case 1: // program and step haar opencv machine 
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
			console.log(`INIT[${n}] = `, ENGINE.opencv("opencv.Me.Thread1","setup",parm));
		
		for (var n=0,N=5;n<N;n++) // step N>1 to test multistep
			console.log(`STEP[${n}] = `, ENGINE.opencv("opencv.Me.Thread1","frame",itau));

		// returns badStep if the cascades were undefined at the program step
		console.log("STEP = ", ENGINE.opencv("opencv.Me.Thread1","helipads",otau));
		console.log(otau);
		break;
		
	// python machines fail with "cant find forkpty" if "import cv2" attempted

	case 2.1: // program python machine
		parm =	{ 
			tau:	["redefine on run"],
			ports: {	
				frame:	 {},
				helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
				faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		pgm = "print 'Im running python!'\n" 
		+ "print tau\n"
		+ "tau = [{'x':[11,12],'y':[21,22]}]\n"
		
		// By default python attempts to connect to mysql.  
		// So, if mysql service not running or mysql.connector module not found, this will not run.
		console.log("INIT = ", ENGINE.python("test.thread",pgm,parm));
		console.log(parm);
		break;

	case 2.2: // program and step python machine 
		parm =	{ 
			ports: { 	
				frame:	 {},
				helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
				faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		
		itau[0].job = "test.jpg";
		pgm = "print 'Im running python!'\n" 
		+ "def frame(tau,parms):\n\tprint parms\n\ttau[0] = {'x':[11,12],'y':[21,22]}\n\treturn -101\n"
		+ "def helipads(tau,parms):\n\tprint parms\n\treturn -102\n"
		+ "def faces(tau,parms):\n\tprint parms\n\treturn -103\n";
		
		console.log("INIT = ", ENGINE.python("PY.Me.Thread1",pgm,parm));
		
		for (var n=0,N=1; n<N; n++)
			console.log(`STEP[${n}] = `, ENGINE.python("PY.Me.Thread1","frame",itau));

		console.log("STEP = ", ENGINE.python("PY.Me.Thread1","helipads",otau));
		break;
		
	case 2.3: // program and step python machine string with reinit along the way
		parm =	{ 
			ports: {	
				frame:	 {},
				helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
				faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		
		itau[0].job = "test.jpg";
		pgm = "print 'Im running python!'\n" 
		+ "def frame(tau,parms):\n\tprint parms\n\treturn -101\n"
		+ "def helipads(tau,parms):\n\tprint parms\n\treturn -102\n"
		+ "def faces(tau,parms):\n\tprint parms\n\treturn -103\n";
		
		console.log("INIT = ", ENGINE.python("mytest",pgm,parm));
		console.log("STEP = ", ENGINE.python("mytest","frame",itau));
		console.log("REINIT = ", ENGINE.python("mytest",pgm,parm));
		console.log("STEP = ", ENGINE.python("mytest","frame",itau));
		console.log(otau);
		break;

	case 3: // program and step a js machine string
		parm =	{ 
			ports: {	
				frame:	 {},
				helipads:{scale:1.01,dim:100,delta:0.1,hits:10,cascade:["c1/cascade"]},
				faces:	 {scale:1.01,dim:100,delta:0.1,hits:10,cascade:["haarcascade_frontalface_alt","haarcascade_eye_tree_eyeglasses"]}
		}};
		
		itau[0].job = "test.jpg";
		jspgm = "console.log('js compiled');\n" 
		+ "TAU.frame = function(tau,parms) { tau[0].xyz=456; return -101; }\n"
		+ "TAU.helipads = function(tau,parms) { return -102; }\n"
		+ "TAU.faces = function(tau,parms) { return -103; }\n";
		
		console.log("INIT = ", ENGINE.js("mytest",jspgm,parm));
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
