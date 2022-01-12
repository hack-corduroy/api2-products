echo "----------------------"
echo "Initializing DB Schema"
echo "----------------------"
psql -d products -f ./SCHEMA.sql
echo "----------------------"
echo "Running Juice Cleanse"
echo "----------------------"
node ./cleanse.js
echo "----------------------"
echo "Copying Tables to PSQL"
echo "----------------------"

echo "copying product table..."
psql  -d products -c "\copy products from './csv/cleansed.product.csv'"

echo "copying related table..."
psql  -d products -c "\copy related from './csv/cleansed.related.csv'"

echo "copying features table..."
psql  -d products -c "\copy features from './csv/cleansed.features.csv'"

echo "copying photos table..."
psql  -d products -c "\copy photos from './csv/cleansed.photos.csv'"

echo "copying styles table..."
psql  -d products -c "\copy styles from './csv/cleansed.styles.csv'"

echo "copying skus table..."
psql  -d products -c "\copy skus from './csv/cleansed.skus.csv'"

echo "----------------------"
echo "DE-DUPING / ADDING XKY"
echo "----------------------"
psql -d products -f ./TRANSFORM.sql


echo "----------------------"
echo "Cleaning Up"
echo "----------------------"
rm -rf ./csv/cleansed*.csv

echo "----------------------"
echo "🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀"
echo "----------------------"