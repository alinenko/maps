const { params } = require("./config");
const { tilesDestDirectory } = require("./constants");
const fs = require("fs");
const {
  buildConfigsByZoomLevel,
  fillCoordsArr,
} = require("./utils/buildDownloadTilesConfig");
const { download } = require("./utils/download");
const { writeResult, getResult } = require("./utils/handleResultFile");
const { coordToTile } = require("./utils/geo");
const { log, error } = require("./utils/common");

Array.prototype.unique = function() {
  return this.filter((value, index, self) => self.indexOf(value) === index)
}

const result = getResult();

function files(path) {
  return fs.readdirSync(path).filter(e => e.indexOf('.') != 0);
}

for (const res of params.resources) {
  const dir = `./${tilesDestDirectory}/${res.name}`
  try {
    const zs = files(dir);
    for (const z of zs) {
      const xs = files(`${dir}/${z}`);
      for (const x of xs) {
        const ys = files(`${dir}/${z}/${x}`).map(e => e.split('.')[0]);
        for (const y of ys) {
          const id = [z, x, y].join('-')
          if (!result[id]) {
            result[id] = {}
          }
          result[id].id = id;
          if (!result[id].providers) {
            result[id].providers = [];
          }
          result[id].providers.push(res.name);
        }
      }
    }
  } catch(e){
  }
}
writeResult(result);

function isFloatPoint({x, y}) {
  return ((x - Math.floor(x)) > 0) || ((y - Math.floor(y)) > 0)
}

const argv = require('minimist')(process.argv.slice(2));
if (argv['bbox']) {
  const coords = argv['bbox'].split(',');
  for(let i = 0; i < coords.length; i++) {
    coords[i] = coords[i].indexOf('.') > 0 ? parseFloat(coords[i]) : parseInt(coords[i]);
  }
  params.startCoords = {
    topLeft: { x: coords[0], y: coords[1] },
    bottomRight: { x: coords[2], y: coords[3] },
  }
}
if (argv['zoom']) {
  params.startZoomLevel = parseInt(argv['zoom']);
}

if (argv['minzoom']) {
  params.minZoomLevel = parseInt(argv['minzoom']);
}

const downloadAll = async () => {
  const { minZoomLevel, startZoomLevel, startCoords, resources } = params;


  if (!startCoords) {
    error("!!!ERROR!!!");
    error("!!!ERROR!!!");
    error("Please set topLeft and bottomRight coords to config");
    error("!!!ERROR!!!");
    error("!!!ERROR!!!");
    process.exit();
  }
  //if floating point coords provided convert it to tile coords
  if (isFloatPoint(startCoords.topLeft) || isFloatPoint(startCoords.bottomRight)) {
    startCoords.topLeft = coordToTile(startCoords.topLeft.x, startCoords.topLeft.y, startZoomLevel);
    startCoords.bottomRight = coordToTile(startCoords.bottomRight.x, startCoords.bottomRight.y, startZoomLevel);
  }

  log(`Downloading all tiles in bbox ((${startCoords.topLeft.x},${startCoords.topLeft.y}),(${startCoords.bottomRight.x},${startCoords.bottomRight.y})); zoom: ${startZoomLevel}`)

  const configsByZoomLevel = buildConfigsByZoomLevel(
    minZoomLevel,
    startZoomLevel,
    startCoords
  );

  for await (const { zoomLevel: z, coords } of configsByZoomLevel) {
    const topLeftCoords = coords.topLeft;
    const bottomRightCoords = coords.bottomRight;

    const XCoords = fillCoordsArr(topLeftCoords.x, bottomRightCoords.x);
    const YCoords = fillCoordsArr(topLeftCoords.y, bottomRightCoords.y);
    const totaltiles = XCoords.length * YCoords.length;
    let count = 0;
    for (const x of XCoords) {
      for (const y of YCoords) {
        const locationParams = { z, x, y };
        const tileId = [z, x, y].join("-");

        let providers = (result[tileId] && result[tileId].providers) || [];

        try {
          const ex = await Promise.all(
            resources.map((resource) => download(resource, locationParams))
          );
          for (const e of ex) {
            providers.push(e.resource.name);
          }
          count++;
          log(`Done: ${totaltiles}/${count} (${((count/totaltiles)*100).toFixed(2)}%)`)
        } catch (err) {
          error(err);
        }

        result[tileId] = {
          id: tileId,
          providers: providers.unique(),
        };
      }
    }
  }

  writeResult(result);
};

downloadAll();

const terminationHandler = () => {
  writeResult(result);
  process.exit();
};

process.on("SIGINT", terminationHandler);
