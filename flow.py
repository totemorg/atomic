def get(evs, grouping, cb):  #load dataset
	
	def groupEvents(rec,recs):
		if len(recs):
			return (rec[ 't' ] -recs[0][ 't' ] ) > 1
		else:
			return False
	
	if evs:
		if isinstance( evs, list ):
			if grouping:
				recs = []
				for (rec) in evs:
					if groupEvents(rec,recs):
						#print "FLUSH", len(recs)
						cb( recs )
						recs = []

					recs.append(rec)

				if len(recs):
					cb( recs )
				
				else:
					cb( None )					
			
			else:
				cb( evs )
				cb( None )
		
		elif isinstance( evs, str ):
			if grouping:
				recs = []
				SQL0.execute(evs)
				for (rec) in SQL0:
					if groupEvents(rec,recs):
						#print "FLUSH", len(recs)
						cb( recs )
						recs = []

					recs.append(rec)

				print "FLUSH", len(recs)
				if len(recs):
					cb( recs )
				else:
					cb( None )
		
			else:
				recs = []
				SQL0.execute(evs)
				for (rec) in SQL0:
					recs.append(rec)
					
				cb( recs )
				cb( None )

		else:
			cb( None )
	
	else:
		cb( None )
