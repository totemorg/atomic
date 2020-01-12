var pythonIF = require('bindings')('pythonIF')

//console.log(pythonIF("hello", "print 'you da man'\nprint locals()\n", [{ev:1}, {ev:2}] ) )
console.log(pythonIF("hello", "print 'you da man'\nprint locals()\n", {a: 1, b:2, c: ["hello","there"]} ) );
console.log(pythonIF("hello", "print 'you da man'\nprint locals()\n", {a: 10, b:20, c: ["hello","there"]} ) )
