const fs = require('fs');
const ico = require('decode-ico');
const png = require('lodepng')
const iniParser = require('ini-config-parser');

let findRightSize = (imgs) => new Promise((resolve,reject) => {

  for (let each of [64, 32, 16]) {
    let found = imgs.find((element) => {
      return (element.width == each);
    })

    if (found) {
      png.encode(found)
      .then((res) => {
        resolve(Buffer.from(res));
      });

      return;
    }
  }

  reject();
});

module.exports = {
  default: (path) => new Promise((resolve,reject) => {

    let filePath = path + '/Desktop.ini';

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
            const f = fs.readFileSync(iniFile[".ShellClassInfo"].IconFile);
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
