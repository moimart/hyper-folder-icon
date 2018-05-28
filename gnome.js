const fs = require('fs');
const path = require('path');
const gvfs = require('gvfs-meta-node');
const mime = require('mime-types');

let fetchIcon = (_path) => new Promise((resolve,reject) => {

    let metaFile = path.join(process.env.HOME, "/.local/share/gvfs-metadata/home");

    gvfs(metaFile)
    .then((result) => {
      if (Object.keys(result.entries) == 0) {
        return reject('No icons found');
      }

      let newEntries = {};

      for (let key of Object.keys(result.entries)) {
        let newKey = path.join(process.env.HOME, key);
        newEntries = Object.assign({},newEntries,{ [newKey]: result.entries[key] });
      }

      if (newEntries.hasOwnProperty(_path)) {
        if (newEntries[_path].hasOwnProperty('custom-icon')) {

          let cleanPath = newEntries[_path]['custom-icon'].substr(7);

          let _readFile = (__path) => {
            fs.readFile(cleanPath, (err,data) => {
              if (err) {
                return reject('No icon file found because ' + err);
              }

              if (/\.svg$/.test(data.toString())) {
                let newPath = path.dirname(cleanPath) + '/' + data.toString();

                fs.readFile(newPath, (err,newData) => {
                  if (err) {
                    return reject('No icon file found because ' + err);
                  }

                  let format = mime.lookup(newPath);

                  resolve({
                    buffer:newData.toString((format != "image/svg+xml") ? 'base64' : undefined),
                    format:format
                  });
                });

              } else {
                let format = mime.lookup(cleanPath);

                resolve({
                  buffer:data.toString((format != "image/svg+xml") ? 'base64' : undefined),
                  format:mime.lookup(cleanPath)
                });
              }
            });
          };

          _readFile(cleanPath);

        } else {
          reject('No custom icon');
        }
      } else {
        reject('No entries');
      }
    })
    .catch((err) => reject(err));
});

module.exports = fetchIcon;
