const times = require("lodash.times");

const calculateChunks = () => {
  const square = {
    topLeft: { x: 150328, y: 85680 },
    bottomRight: { x: 155712, y: 89786 },
  };

  const numChunks = 30;

  const diffX = square.bottomRight.x - square.topLeft.x;
  const diffY = square.bottomRight.y - square.topLeft.y;

  const stepX = Math.round(diffX / numChunks);
  const stepY = Math.round(diffY / numChunks);

  const chunks = {};

  const calculateChunkTopLeft = (chunkOrder) => ({
    x: square.topLeft.x + stepX * (chunkOrder - 1),
    y: square.topLeft.y,
  });

  const calculateChunkbottomRight = (chunkOrder) => ({
    x: square.topLeft.x + stepX * chunkOrder,
    y: square.bottomRight.y,
  });

  console.log({ stepX, stepY });

  times(numChunks, (i) => {
    const chunkOrder = i + 1;

    // first chunk
    if (chunkOrder === 1) {
      chunks[chunkOrder] = {
        topLeft: square.topLeft,
        bottomRight: calculateChunkbottomRight(chunkOrder),
      };

      return;
    }

    // last chunk
    if (chunkOrder === numChunks) {
      chunks[chunkOrder] = {
        topLeft: calculateChunkTopLeft(chunkOrder),
        bottomRight: square.bottomRight,
      };

      return;
    }

    chunks[chunkOrder] = {
      topLeft: calculateChunkTopLeft(chunkOrder),
      bottomRight: calculateChunkbottomRight(chunkOrder),
    };
  });

  console.log(JSON.stringify(Object.values(chunks)));
  return chunks;
};

calculateChunks();
