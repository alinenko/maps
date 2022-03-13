const { params } = require("./config");
const {
  buildConfigsByZoomLevel,
  fillCoordsArr,
} = require("./utils/buildDownloadTilesConfig");
const { download } = require("./utils/download");
const { coordToTile } = require("./utils/geo");
const { log, error } = require("./utils/common");
const _ = require('lodash');


function isFloatPoint({x, y}) {
  return ((x - Math.floor(x)) > 0) || ((y - Math.floor(y)) > 0)
}

const downloadAll = async () => {
  const { coordsLevel, minZoomLevel, startZoomLevel, startCoords, resources } = params;


  if (!startCoords) {
    error("!!!ERROR!!!");
    error("Please set topLeft and bottomRight coords to config");
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
    startCoords,
    coordsLevel
  );

  if (!coordsLevel) {
    coordsLevel = startZoomLevel;
  }

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

        try {
          const ex = await Promise.all(
            resources
            .map((resource) => download(resource, locationParams))
          );
        } catch (err) {
          error(err);
        } finally {
          count++;
          log(`Done: (${((count/totaltiles)*100).toFixed(2)}%) ${count}/${totaltiles}`)
        }

      }
    }
  }
};

downloadAll();

const terminationHandler = () => {
  process.exit();
};

process.on("SIGINT", terminationHandler);
