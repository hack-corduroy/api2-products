echo "----------------------"
echo "Initializing DB Schema"
echo "----------------------"
PGPASSWORD=temp psql -U sieke -d products -h localhost -f ./SCHEMA.sql
echo "----------------------"
echo "Running Juice Cleanse"
echo "----------------------"
node ./cleanse.js
echo "----------------------"
echo "Copying Tables to PSQL"
echo "----------------------"

echo "copying product table..."
PGPASSWORD=temp psql -U sieke -d products -h localhost -c "\copy products from './csv/cleansed.product.csv'"

echo "copying related table..."
PGPASSWORD=temp psql -U sieke -d products -h localhost -c "\copy related from './csv/cleansed.related.csv'"

echo "copying features table..."
PGPASSWORD=temp psql -U sieke -d products -h localhost -c "\copy features from './csv/cleansed.features.csv'"

echo "copying photos table..."
PGPASSWORD=temp psql -U sieke -d products -h localhost -c "\copy photos from './csv/cleansed.photos.csv'"

echo "copying styles table..."
PGPASSWORD=temp psql -U sieke -d products -h localhost -c "\copy styles from './csv/cleansed.styles.csv'"

echo "copying skus table..."
PGPASSWORD=temp psql -U sieke -d products -h localhost -c "\copy skus from './csv/cleansed.skus.csv'"

echo "----------------------"
echo "DE-DUPING / ADDING XKY"
echo "----------------------"
PGPASSWORD=temp psql -U sieke -d products -h localhost -f ./TRANSFORM.sql


echo "----------------------"
echo "Cleaning Up"
echo "----------------------"
rm -rf ./csv/cleansed*.csv

echo "----------------------"
echo "🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀"
echo "----------------------"