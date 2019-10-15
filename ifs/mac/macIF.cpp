// UNCLASSIFIED

#include <node.h>

using namespace v8;

#include <macIF.h>

// String functions

int mac_strmatch(str find, str List[]) {
	for (int n=0; List[n]; n++)
		if ( strcmp(find,List[n]) == 0 ) return n;
		
	return -1;
}

str mac_strclone(str src) {
	str rtn = (str) malloc(strlen(src)+1);
	strcpy(rtn,src);
	return rtn;
}

str mac_strclone(int N,str init) {
	str rtn = (str) malloc(N+1);
	strcpy(rtn,init);
	return rtn;
}	

str mac_strcat(str src[]) {
	static char rtn[512];
	
	strcpy(rtn,"");
	for (int n=0;src[n];n++) strcat(rtn,src[n]);	
	return rtn;
}

str mac_strcat(str src[], int n, str insert) {
	src[n] = insert;
	return mac_strcat(src);
}

str mac_strjson(str buffs[], int N) {
	int n,len=0;
	str rtn;
	
	for (n=0;n<N;n++) len += strlen(buffs[n]);
	
	rtn = mac_strclone(len+2+N,"[");
	
	for (n=0;n<N-1;n++) {
		strcat(rtn,buffs[n]);
		strcat(rtn,",");
	}
	
	if (N) strcat(rtn,buffs[n]);
	
	strcat(rtn,"]");
	
	return rtn;
}

str mac_strclone(V8STRING src) {
	str rtn = (str) malloc( src->Length()+1 );
	
	rtn[ src->WriteUtf8( rtn, src->Length() ) ] = '\0';
	return rtn;
}

str mac_strclone(V8STRING src, str rtn) {
	rtn[ src->WriteUtf8( rtn, src->Length() ) ] = '\0';
	return rtn;
}

// UNCLASSIFIED
