export DB_USER=subql_lucky_shibuya
export DB_PASS=toto
export DB_DATABASE=subql_lucky_shibuya
export DB_HOST=localhost
export DB_PORT=5432
subql-node \
  --subquery=/home/guigou/programming/lucky-subquery \
  --config=/home/guigou/programming/lucky-subquery/project-shibuya.yaml \
  --db-schema=lucky \
  --port=3100 \
  --batch-size=30 \
  > subql_lucky_shibuya.log 2>&1 &