const fs = require('fs');
const { resultJsonFilePath } = require('../constants');

const getResult = () => {
  let result = {};

  if (fs.existsSync(resultJsonFilePath)) {
    const prevResultJSON = fs.readFileSync(resultJsonFilePath);
    result = prevResultJSON ? JSON.parse(prevResultJSON) : {};
  }

  return result;
};

const writeResult = (result) => {
  const resultJson = JSON.stringify(result);
  const resultJsonLength = resultJson.length;
  const chunkLength = 10000;

  fs.writeFileSync(resultJsonFilePath, '', 'utf8');

  for(let i = 0; (i - 1) * chunkLength - resultJsonLength < 0; i++ ) {
    const chunck = resultJson.substr(i * chunkLength, chunkLength);
    fs.appendFileSync(resultJsonFilePath, chunck, { encoding: 'utf8' });
  }
};

module.exports = {
  getResult,
  writeResult,
};
