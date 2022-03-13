const { tilesDestDirectory } = require("./constants");
const fs = require("fs");

function walk(path, cb, done) {
    fs.readdir(path, (err, list) => {
        if (err) {
            throw err
        }
        let i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done();
            file = `${path}/${file}`;
            fs.stat(file, function(err, stat) {
                if (err) {
                    throw err
                }
                if (stat && stat.isDirectory()) {
                    walk(file, cb, next);
                } else {
                    cb(file);
                    next();
                }
            });
        })();
    })
}

function forEachFile(path, cb) {
    return new Promise((resolve, reject) => {
        try {
            walk(path, cb, resolve)
        } catch(err) {
            reject(err);
        }
    })
}

const result = {};
forEachFile(tilesDestDirectory, file => {
    console.log(file);
    const parts = file.split('/');
    const fname = parts[parts.length - 1];
    if (fname.indexOf('.') === 0) {
        return;
    }
    const res = parts[parts.length - 4];
    const tileID = [parts[parts.length - 3], parts[parts.length - 2], fname.split('.')[0]].join('-');
    if (!result[tileID]) {
        result[tileID] = {
            id: tileID,
            providers: [res]
        };
    } else {
        result[tileID].providers.push(res)
    }
});
