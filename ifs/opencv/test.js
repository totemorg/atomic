var 
	Log = console.log,
	opencvIF = require("./opencvIF") //require('bindings')('opencvIF')

Log(opencvIF("init ports", "nada", {
	output: {
		scale: 0,
		dim: 100,
		delta: 1,
		hits: 10,
		cascade: ["path1", "path2"]
	},
	input: {
	}
} ));

//Log(opencvIF("test2", "print 'you da man'\nprint locals()\n", {a: 1, b:2, c: ["hello","there"]} ) );
//Log(opencvIF("test3", "print 'you da man'\nprint locals()\n", {a: 10, b:20, c: ["hello","there"]} ) )
