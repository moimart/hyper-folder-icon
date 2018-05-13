const Icns = require('apple-icns')
const resourceFork = require('resourceforkjs').resourceFork;

var iconFinder = (folder) => new Promise((resolve,reject) => {
  let file = new resourceFork(folder + '/Icon\r');

  file.read()
  .then(() => {
    let buffer = Buffer.from(file.resources['icns'][49081].data.buffer,260);
    let icon = new Icns(buffer);

    try {
      icon.open((error) => {
        if (error) {
          return reject(error);
        }

        //icon.entries.forEach((entry) => console.log(entry.type));

        var found = icon.entries.find((entry) => {
          return (entry.type === 'ic07' || entry.type === 'ic08');
        })

        if (found) {
          icon.readEntryData(found, ( error, _buffer ) => {
            if (error) {
              return reject(error);
            }

            resolve(_buffer);
          });
        } else {
          resolve('Icon not found');
        }

      })
    } catch (exception) {
      reject('Cannot open icns');
    }

  })
  .catch((error) => reject(error));
});

exports.default = iconFinder;
