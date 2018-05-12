const Icns = require('apple-icns')
const resourceFork = require('resourceforkjs').resourceFork;
const fs = require('fs');


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

        icon.readEntryData(icon.entries[2], ( error, _buffer ) => {
          if (error) {
            return reject(error);
          }

          resolve(_buffer);
        });
      })
    } catch (exception) {
      reject(exception);
    }

  })
  .catch((error) => reject(error));
});

iconFinder('/Users/moimart/kikkei-labs') // Specify a folder
.then((icon) => {
  console.log(icon);

  //write the icon to a file
  fs.writeFile('/Users/moimart/iconito.png',icon,(err) => {
    if (err) {
      console.log|(err);
    }
  })
})
.catch((error) => console.log(error));
