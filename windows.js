const fs = require('fs');
const ico = require('decode-ico');
const jimp = require('jimp');
const iniParser = require('ini-config-parser');
const path = require('path');

let findRightSize = (imgs) => new Promise((resolve,reject) => {

  for (let each of [64, 32, 16]) {
    let found = imgs.find((element) => {
      return (element.width == each);
    })

    if (found) {
      console.log(found);

      let image = new jimp(found.width,found.height, (err,image) => {
        image.bitmap.data = found.data;
        
        image.getBuffer(jimp.MIME_PNG, (err,buffer) => {
          if (err) {
            return reject(err);
          }

          resolve(buffer);
        })
      });

      return;
    }
  }

  reject();
});

module.exports = {
  default: (_path) => new Promise((resolve,reject) => {

    let filePath = _path + '/Desktop.ini';

    fs.exists(filePath, (exists) => {
      if (!exists) {
        return reject('File does not exist');
      }

      let iniFile = {};

      try {
        let data = fs.readFileSync(filePath);

        data = data.toString().replace(/\\/g,"/");
        iniFile = iniParser.parse(data);

        if (iniFile.hasOwnProperty(".ShellClassInfo")) {
          if (iniFile[".ShellClassInfo"].IconFile) {

            const f = fs.readFileSync(path.resolve(_path,iniFile[".ShellClassInfo"].IconFile));
            const _imgs = ico(f);

            findRightSize(_imgs)
            .then((png) => {
              resolve(png);
            })
            .catch(() => reject('no icon found'));

          } else {
            reject('no icon entry found');
          }
        } else {
          reject('no valid desktop.ini found');
        }

      } catch (exception) {
        reject (exception);
      }
    });
  })
}
