const GS_API_VERSION = 917;

class RoundRobin {
  constructor(data) {
      this.data = data;
      this.idx = 0;
  }
  next() {
      if (this.idx >= this.data.length) {
          this.idx = 0;
      }
      const e = this.data[this.idx];
      this.idx++
      return e;
  }
  random() {
      const i = Math.floor(Math.random() * this.length);
      return this[i];
  }
}

// https://3.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?apiKey=t_kKKAHgEZ-SCa-v08N8xCchEK_wxxp7dFAmEOpi9hs
const params = {
  resources: [
    // {
    //   name: "HERE",
    //   //to reduce bombarding - round-robin on cdn servers
    //   downloadUrlPatter: (() => {
    //     const cdn = new RoundRobin([1, 2, 3, 4])
    //     return ({ z, y, x }) => `https://${cdn.next()}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/satellite.day/${z}/${x}/${y}/256/jpg?apiKey=t_kKKAHgEZ-SCa-v08N8xCchEK_wxxp7dFAmEOpi9hs`
    //   })(),
    //   fileExt: "png",
    // },
    {
     name: "GS",
     downloadUrlPatter: ({ z, y, x }) =>
       `https://khms0.googleapis.com/kh?v=${GS_API_VERSION}&z=${z}&x=${x}&y=${y}`,
     fileExt: "jpeg",
    },
    // {
    //   name: "COSM",
    //   downloadUrlPatter: (() => {
    //     const cdn = new RoundRobin(['a', 'b', 'c'])
    //     return ({ z, y, x }) => `https://${cdn.next()}.tile-cyclosm.openstreetmap.fr/cyclosm/${z}/${x}/${y}.png`
    //   })(),
    //   fileExt: "png",
    // },
    // {
    //   name: "OSM",
    //   downloadUrlPatter: (() => {
    //     // const cdn = new RoundRobin(['a', 'b', 'c'])
    //     return ({ z, y, x }) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`//https://${cdn.next()}.tile.cyclestreets.net/mapnik/${z}/${x}/${y}.png`
    //   })(),
    //   fileExt: "png",
    // },
  ],
  minZoomLevel: 5,
  startZoomLevel: 18,
  // please put you coords config here:
  startCoords: undefined,
  // for instance:
  // startCoords: {
  //   topLeft: { x: 50.465670, y: 30.362977 },
  //   bottomRight: { x: 50.463353, y: 30.367993 },
  // },
};

module.exports = {
  params,
};
