# api-products

Products API endpoint

## Data Warehouse Steps

```bash
#from root directory
#must have raw csv files in /csv/ directory

#performs data cleansing and outputs new cleanses.xxx.csv files in csv directory
node database/cleanse.js

#creates the database schema (will drop and re-create tables)
psql -d products -f database/SCHEMA.sql

#run the following commans from within psql terminal
psql -d products
# copies the csvs
>> \copy products from './csv/cleansed.product.csv'
>> \copy related from './csv/cleansed.related.csv'
>> \copy features from './csv/cleansed.features.csv'
>> \copy photos from './csv/cleansed.photos.csv'
>> \copy styles from './csv/cleansed.styles.csv'
>> \copy skus from './csv/cleansed.skus.csv'

```
