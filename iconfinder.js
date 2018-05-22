const Icns = require('apple-icns');
const resourceFork = require('resourceforkjs').resourceFork;
const fs = require('fs');
const plist = require('plist');

const RESOURCEFORK = 'rf';
const APPFOLDER = 'apf';
const VOLUMEFOLDER = 'vf';
const MOUNTVOLUME = 'mvf';
const GNOME = 'gf';
const WINDOWS = 'wf';

let loadPlist = (file) => {
  return list.parse(
    fs.readFileSync(file, 'utf8')
  );
}

class AbstractFile {
  constructor(folder) {

    this.folder = folder;
    this.type = RESOURCEFORK;
    this.mount = '/';

    switch(process.platform) {
      case 'darwin': {
        if (/\.app/.test(folder)) {
          console.log('HYAYAYA ' + this.folder);
          this.type = APPFOLDER;
        } else {
          let mount = folder.split('/');

          if (mount[1] == 'Volumes' && mount.length > 2) {
            let _mount = '/' + mount[1] + '/' + mount[2] + '/.VolumeIcon.icns';
            console.log('read ' + _mount);
            if (fs.existsSync(_mount)) {
              this.mount = _mount;
              this.type = MOUNTVOLUME;
            } else {
              this.type = VOLUMEFOLDER;
            }
          } else if (!fs.existsSync(folder + '/Icon\r' )) {
              this.type = VOLUMEFOLDER;
          }
        }
      }
      break;
      case 'win32':
      case 'linux':
      default:
      break;
    }
  }

  read() {

    let iconReading = (icon) => new Promise((resolve,reject) => {
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
        reject('Cannot open icns ' + exception);
      }
    });

    switch (this.type) {
      case RESOURCEFORK:
        return new Promise((resolve,reject) => {
          let file = new resourceFork(this.folder + '/Icon\r');

          file.read()
          .then(() => {
            let buffer = Buffer.from(file.resources['icns'][49081].data.buffer,260);
            let icon = new Icns(buffer);

            iconReading(icon)
            .then((ret) => resolve(ret))
            .catch((err) => reject(err));
          })
          .catch((error) => reject(error));
        });
        break;
      case VOLUMEFOLDER:
        return new Promise((resolve,reject) => {

          fs.readFile('/.VolumeIcon.icns', (err,data) => {
              if (err) {
                return reject(err);
              }

              let icon = new Icns(data);

              iconReading(icon)
              .then((ret) => resolve(ret))
              .catch((err) => reject(err));
            });
        });

        break;
      case MOUNTVOLUME:
        return new Promise((resolve,reject) => {

          fs.readFile(this.mount, (err,data) => {
              if (err) {
                return reject(err);
              }

              let icon = new Icns(data);

              iconReading(icon)
              .then((ret) => resolve(ret))
              .catch((err) => reject(err));
            });
        });

        break;
      case APPFOLDER:
        return new Promise((resolve,reject) => {

          let findApp = (folders) => {
            for (let i = 0; i < folders.length; i++) {
              if (folders[i].substr(folders[i].length -  4) === '.app') {
                return i;
              }
            }

            return undefined;
          }

          console.log('HERE ' + this.folder);

          let folderIndex = findApp(this.folder.split('/'));

          if (!folderIndex) {
            reject('No app found');
          }

          let folder = this.folder.split('/').slice(0,folderIndex + 1).join('/');

          console.log(folderIndex + ' ' + folder);

          fs.readFile(folder + '/Contents/Info.plist', (err,data) => {
            if (err) {
              return reject(err);
            }

            let info = plist.parse(data.toString('utf8'));

            if (!info.hasOwnProperty('CFBundleIconFile')) {
              reject('No icon found');
            }

            fs.readFile(folder
              + '/Contents/Resources/'
              + info.CFBundleIconFile , (err,data) => {
                if (err) {
                  return reject(err);
                }

                let icon = new Icns(data);

                iconReading(icon)
                .then((ret) => resolve(ret))
                .catch((err) => reject(err));
              })
          });
        });
        break;
      case GNOME:
      case WINDOWS:
      default:
        break;

    }
  }
}

var iconFinder = (folder) => new Promise((resolve,reject) => {

  let file = new AbstractFile(folder);

  file.read()
  .then((buffer) => resolve(buffer))
  .catch((error) => reject(error));
});

exports.iconFinder = iconFinder;
