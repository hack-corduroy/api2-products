module.exports.splitCSVLine = (line) => {
  let out = line.split(/(?!\B"[^"]*),(?![^"]*"\B)/);
  out.forEach((x, i) => {
    out[i] = isQuote(x[0]) && isQuote(x[x.length - 1]) ? x.slice(1, x.length - 1) : x;
    if (out[i] === 'null') {
      out[i] = null;
    }
  });
  return out;
};

const isQuote = (c) => {
  return c === '"' || c === "'" || c === '`';
};

//will attempt to coerce a value into number
module.exports.extractNumber = (val) => {
  return parseFloat(val.replace(/[^0-9.]/g, ''));
};
