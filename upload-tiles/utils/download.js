const https = require("https");
const fs = require("fs");
const { tilesDestDirectory } = require("../constants");
const { log } = require("./common");
const { setFlagsFromString } = require("v8");
const path = require("path");

const notFound = 'Error 404 (Not Found)';

const download = (resource, locationParams, cb = () => {}) => {
  const {
    fileExt,
    downloadUrlPatter,
    name: resourceName,
  } = resource;
  const { x, y, z } = locationParams;
  const dir = `./${tilesDestDirectory}/${resourceName}/${z}/${x}`;
  const dest = `${dir}/${y}.${fileExt}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  //if file is there - skip
  const checks = [
    dest,
    `${dir}/${y}.jpeg`,
    `${dir}/${y}.jpg`
  ];
  for (let check of checks) {
    if (fs.existsSync(check)) {
      const content = fs.readFileSync(check);
      if (content.toString() == notFound || content.length > 0) {
        return new Promise((resolve) => {
          resolve({resource, coords: { x, y, z }});
        })
      }
    }
  }

  const downloadUrl = downloadUrlPatter(locationParams);

  return new Promise((resolve, reject) => {
    log(`Downloading file by URL ${downloadUrl} to dest ${dest}`);
    const file = fs.createWriteStream(dest);
    https.get(
      downloadUrl,
      {
        timeout: 5000,
        headers: {
          "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "uk,en-US;q=0.9,en;q=0.8,ru;q=0.7",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-ch-ua": `" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"`,
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": `"macOS"`,
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": 1,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
        },
      },
      function (response) {
        if (response.statusCode > 200){
          if (response.statusCode == 404) {
            file.write(notFound);
            file.close(cb);
            return resolve({resource, coords: { x, y, z }});
          }
          file.close(cb);
          rm(dest);
          return reject(`${downloadUrl} resulted in ${response.statusCode}`);
        }
        response.pipe(file);
        file.on("finish", function () {
          file.close(cb);
          resolve({resource, coords: { x, y, z }});
        });
        file.on("error", function (err) {
          file.close(cb);
          rm(dest);
          reject(err);
        });
      }
    ).on('error', (err) => {
      file.close(cb);
      rm(dest);
      reject(err);
    });
  });
};

function rm(dest) {
  (fs.rm && fs.rm(dest, { force: true }, (e)=>{})) || (fs.unlink && fs.unlink(dest, ()=>{}))
}

module.exports = {
  download,
};
