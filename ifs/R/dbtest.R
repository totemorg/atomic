library(RMariaDB)

con <- dbConnect(
  drv = RMariaDB::MariaDB(), 
  username = "root",
  password = "NGA", 
  host = "localhost", 
  port = 3306
)

res <- dbSendQuery(con, "SELECT name,ID FROM app.genpr where name like 'test%' ")
while(!dbHasCompleted(res)){
  chunk <- dbFetch(res, n = 5)
  print(names(chunk))
  print(chunk)
}

# Clear the result
dbClearResult(res)

# Disconnect from the database
dbDisconnect(con)