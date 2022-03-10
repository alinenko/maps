const https = require("https");
const fs = require("fs");
const { tilesDestDirectory } = require("../constants");

const download = (resource, locationParams, cb = () => {}) => {
  const { fileExt, downloadUrlPatter, name: resourceName } = resource;
  const { x, y, z } = locationParams;
  const dir = `./${tilesDestDirectory}/${resourceName}/${z}/${x}`;
  const dest = `${dir}/${y}.${fileExt}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  //if file is there - skip
  if (fs.existsSync(dest)) {
    return new Promise((resolve) => {
      resolve({ resource, coords: { x, y, z } });
    });
  }

  const downloadUrl = downloadUrlPatter(locationParams);

  return new Promise((resolve, reject) => {
    console.log(`Downloading file by URL ${downloadUrl} to dest ${dest}`);

    https
      .get(
        downloadUrl,
        {
          timeout: 5000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
          },
        },
        function (response) {
          const { statusCode } = response;
          if (statusCode !== 200) {
            return reject({
              downloadUrl,
              dest,
              statusCode,
            });
          }
          const file = fs.createWriteStream(dest);

          response.pipe(file);
          file.on("finish", function () {
            file.close(cb);
            resolve({ resource, coords: { x, y, z } });
          });
          file.on("error", function (err) {
            reject(err);
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
};

module.exports = {
  download,
};
