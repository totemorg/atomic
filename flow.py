def FLUSH_forAll(ctx,rec,recs):
	return False

def FLUSH_forDrop(ctx,rec,recs):
	return True

def FLUSH_forBatch(ctx,rec,recs):
	if len(recs):
		return (rec[ 't' ] -recs[0][ 't' ] ) > 1
	else:
		return False

def FLUSH_forEach(ctx,rec,recs):
	return len(recs) < 1

def FLOW_load(flush, ctx, cb):  #load dataset
	if 'Events' in ctx:
		Query = ctx['Events']
		if isinstance( Query, list ):
			recs = []
			for (rec) in Query:
				if flush(ctx,rec,recs):
					print "FLUSH", len(recs)
					cb( recs )
					recs = []

				recs.append(rec)

			if len(recs):
				cb( recs )
			else:
				cb( 0 )
		
		elif isinstance( Query, str ):
			recs = []
			SQL0.execute(Query)
			for (rec) in SQL0:
				if flush(ctx,rec,recs):
					print "FLUSH", len(recs)
					cb( recs )
					recs = []
				
				recs.append(rec)
				
			print "FLUSH", len(recs)
			if len(recs):
				cb( recs )
			else:
				cb( 0 )
		
		else:
			cb( 0 )
	
	else:
		cb( 0 )

def getAll(ctx, cb):
	FLOW_load( FLUSH_forAll, ctx, cb )

def getDrop(ctx, cb):
	FLOW_load( FLUSH_forDrop, ctx, cb )

def getBatch(ctx, cb):
	FLOW_load( FLUSH_forBatch, ctx, cb )

def getEach(ctx, cb):
	FLOW_load( FLUSH_forEach, ctx, cb )
	