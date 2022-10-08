var 
	Log = console.log,
	pythonIF = require("./pythonIF"); // require('bindings')('pythonIF')

//Log(pythonIF("test1", "print 'you da man'\nprint locals()\n", [{ev:1}, {ev:2}] ) )
Log(pythonIF("test2", "print 'you da man'\nprint locals()\n", {a: 1, b:2, c: ["hello","there"]} ) );
Log(pythonIF("test3", "print 'you da man'\nprint locals()\n", {a: 10, b:20, c: ["hello","there"]} ) )
