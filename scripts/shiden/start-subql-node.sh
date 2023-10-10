export DB_USER=subql_lucky_shiden
export DB_PASS=toto
export DB_DATABASE=subql_lucky_shiden
export DB_HOST=localhost
export DB_PORT=5432
subql-node \
  --subquery=/home/guigou/programming/lucky-subquery \
  --config=/home/guigou/programming/lucky-subquery/project-shiden.yaml \
  --db-schema=lucky \
  --port=3110 \
  --batch-size=30 \
  > subql_lucky_shiden.log 2>&1 &