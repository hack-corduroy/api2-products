const fs = require('fs');
const readline = require('readline');
const { splitCSVLine, extractNumber } = require('../lib/csv.js');

//reads the filename line by line
const parseFile = async (filename, start, callback) => {
  const file = readline.createInterface({
    input: fs.createReadStream(__dirname + '/../csv/' + filename),
    output: process.stdout,
    terminal: false,
  });

  const logger = fs.createWriteStream(__dirname + '/../csv/cleansed.' + filename);

  index = 0;
  let ids = {};
  for await (const line of file) {
    if (++index > start) {
      let arr = await callback(line);
      if (!ids[arr[0]]) {
        logger.write(arr.join('\t') + '\n');
        ids[arr[0]] = true;
      }
    }
    if (index % 10000 === 0) {
      console.log(filename, index);
    }
  }
  logger.end();
};

const main = async () => {
  // Parse Products
  await parseFile('product.csv', 1, async (line) => {
    let arr = splitCSVLine(line);
    arr[0] = parseInt(arr[0]);
    arr[5] = extractNumber(arr[5]).toString();
    return arr;
  });

  //Parse Related
  await parseFile('related.csv', 1, async (line) => {
    let arr = splitCSVLine(line);
    arr = arr.map((x) => parseInt(x));
    return arr;
  });

  //Parse Features
  await parseFile('features.csv', 0, async (line) => {
    let arr = splitCSVLine(line);
    return arr;
  });

  //Parse Features
  await parseFile('photos.csv', 1, async (line) => {
    let ids = {};
    let arr = splitCSVLine(line);
    arr[0] = parseInt(arr[0]);
    arr[1] = parseInt(arr[1]);
    return arr;
  });

  //Parse Styles
  await parseFile('styles.csv', 1, async (line) => {
    let ids = {};
    let arr = splitCSVLine(line);
    arr[0] = parseInt(arr[0]);
    arr[1] = parseInt(arr[1]);
    return arr;
  });

  //Parse SKUs
  await parseFile('skus.csv', 1, async (line) => {
    let ids = {};
    let arr = splitCSVLine(line);
    arr[0] = parseInt(arr[0]);
    arr[1] = parseInt(arr[1]);
    arr[3] = parseInt(arr[3]);
    if (arr.length !== 4) {
      console.log(arr);
    }
    return arr;
  });
};

main();
