# api-products

Products API endpoint

## Data Warehouse Steps

```bash
##
mkdir csv
mv xxCSVFILESxx csv/
#from root directory
#this script will initialize the db
bash database/initializedb.bash

rm -rf csv/
```

## AWS Setup

```bash
##Connect
ssh -i xxx.pem ubuntu@ec2-3-90-239-173.compute-1.amazonaws.com

##Install Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
node -e "console.log('Running Node.js ' + process.version)"


##Set up Postgres
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
create database products;
create user sieke with encrypted password 'temp';
grant all privileges on database products to sieke;
psql -U sieke -d products -h localhost;

##Transfer files to AWS
cd ~/Desktop
scp -i xxx.pem Archive.zip  ubuntu@ec2-3-90-239-173.compute-1.amazonaws.com:~/
mkdir ~/api2-products/database/migrate/csv
mv Archive.zip ~/api2-products/database/migrate/csv
cd ~/api2-products/database/migrate/csv
sudo apt install unzip
unzip Archive.zip
rm -rf Archive.zip __MACOSX/
cd ~/api2-products/database/migrate/
bash initializedb.bash
```
