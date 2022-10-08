var 
	Log  = console.log,
	RIF = require("./RIF"); //require('bindings')('RIF');

var ctx = {a:10,b:11,c:20};
				//[{ev:1}, {ev:2}] ) )

Log(RIF("test1", `
print('you da man');
print('ctx=');str(CTX);
print('tau=');str(TAU);
CTX$d = 'this is a test';
CTX$e = list(x=1,y=2,z=3);
CTX$f = 123.456;
CTX$g = list(4,5,6);
CTX$h = TRUE;
`, ctx ));

Log("new ctx", ctx); 