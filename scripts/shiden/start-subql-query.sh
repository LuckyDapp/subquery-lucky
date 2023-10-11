export DB_USER=subql_lucky_shiden
export DB_PASS=toto
export DB_DATABASE=subql_lucky_shiden
export DB_HOST=localhost
export DB_PORT=5432
subql-query \
  --name=lucky \
  --indexer=http://localhost:3110 \
  --port=3111 \
  --playground=true \
  --log-path=subql-lucky-shiden.log \
  --log-rotate=true \
  --log-level=info
