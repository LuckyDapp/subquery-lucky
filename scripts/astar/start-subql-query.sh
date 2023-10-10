export DB_USER=subql_lucky_shibuya
export DB_PASS=toto
export DB_DATABASE=subql_lucky_shibuya
export DB_HOST=localhost
export DB_PORT=5432
subql-query \
  --name=lucky \
  --indexer=http://localhost:3120 \
  --port=3121 \
  --playground=true \
  --log-path=subql-lucky-shibuya.log \
  --log-rotate=true \
  --log-level=info
