#include <RInside.h>                    // for the embedded R via RInside
#include <macIF.h>						// Node V8 interface

int Rmac(int argc, char *argv[]) {

	RInside R(argc, argv);              // create an embedded R instance
	int junk[] = {1,2,3};
	string test = "prefix ";
	
    R["y"] = "Hello, world!\n";      // assign a char* (string) to 'txt'
	R["x"] = 123;
	R["z"] = 123.456;
	
    R.parseEvalQ("cat(x,y,z)");           // eval the init string, ignoring any returns

	Rcpp::NumericVector v = R.parseEval("diag(1:3)");
	
	test = test + "a";
	printf("test=%s\n",test.c_str());
	
	//printf("size v=%d cols=%d rows=%d\n", (int) v.size(), (int) v.ncol(), (int) v.nrow() );
	for (int i=0;i<v.size(); i++)
		std::cout << "Elem " << i << " is " << v[i] << std::endl;
	
    //exit(0);
	return 0;
}

V8NUMBER run(const V8STACK& args) {
	V8SCOPE scope = args.Env();
	printf("in run\n");
	char	*argv[] = {""};
	int		argc = 1;
	return V8NUMBER::New(scope,Rmac(argc, argv ) );
}

V8OBJECT Init(V8SCOPE scope, V8OBJECT exports) {
	return V8FUNCTION::New(scope, run, "run");
}

NODE_API_MODULE(opencvIF, Init)
