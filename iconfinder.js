const Icns = require('apple-icns');
const resourceFork = require('resourceforkjs').resourceFork;
const fs = require('fs');
const plist = require('plist');
const winIco = require('./windows').default;
const gnomeIcon = require('./gnome');
const _p = require('promisfy');

const exists = _p.promisfyNoError(fs.exists);
const readFile = _p.promisfy(fs.readFile);

const RESOURCEFORK = 'rf';
const APPFOLDER = 'apf';
const VOLUMEFOLDER = 'vf';
const MOUNTVOLUME = 'mvf';
const GNOME = 'gf';
const WINDOWS = 'wf';

class AbstractFile {

  constructor(folder) {

    this.folder = folder;
    this.type = RESOURCEFORK;
    this.mount = '/';
  }

  async init() {
    switch(process.platform) {
      case 'darwin':
        if (/\.app/.test(folder)) {
          this.type = APPFOLDER;
        } else {
          let mount = folder.split('/');

          if (mount[1] == 'Volumes' && mount.length > 2) {
            let _mount = '/' + mount[1] + '/' + mount[2] + '/.VolumeIcon.icns';

            if (await exists(_mount)) {
              this.mount = _mount;
              this.type = MOUNTVOLUME;
            } else {
              this.type = VOLUMEFOLDER;
            }
          }
        }
        break;
      case 'win32':
        this.type = WINDOWS;
        break;
      case 'linux':
        this.type = GNOME;
        break;
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

              resolve({buffer:_buffer,format:'image/png'});
            });
          } else {
            reject('Icon not found');
          }

        })
      } catch (exception) {
        reject('Cannot open icns ' + exception);
      }
    });

    switch (this.type) {
      case RESOURCEFORK:
        return new Promise((resolve,reject) => {

          let _findIcon = (folder) => new Promise(async (resolve,reject) => {

            while (!await exists(folder + '/Icon\r')) {
              folder = folder.split('/').slice(0,-1).join('/');

              if (folder == "") {
                break;
              }
            }

            if (folder == "") {
              const data = await readFile('/.VolumeIcon.icns').catch(err => reject(err));
              let icon = new Icns(data);
              const ret = iconReading(icon).catch(err => reject(err));
              resolve(ret);

            } else {
              let file = new resourceFork(folder + '/Icon\r');

              try {
                await file.read();
                let buffer = Buffer.from(file.resources['icns'][49081].data.buffer,260);
                let icon = new Icns(buffer);
                const ret = await iconReading(icon);
                resolve(ret);

              } catch (error) {
                reject(error);
              }
            }
          });

          _findIcon(this.folder.slice())
            .then(ret => resolve(ret))
            .catch(error => reject(error));
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
        return new Promise(async (resolve,reject) => {

          let findApp = (folders) => {
            for (let i = 0; i < folders.length; i++) {
              if (folders[i].substr(folders[i].length -  4) === '.app') {
                return i;
              }
            }

            return undefined;
          }

          let folderIndex = findApp(this.folder.split('/'));

          if (!folderIndex) {
            reject('No app found');
          }

          let folder = this.folder.split('/').slice(0,folderIndex + 1).join('/');

          const data =
            await readFile(folder + '/Contents/Info.plist')
                    .catch(err => reject('No icon found'));

          let info = plist.parse(data.toString('utf8'));

          if (!info.hasOwnProperty('CFBundleIconFile')) {
            reject('No icon found');
          }

          const iconData =
            await readFile(folder
                            + '/Contents/Resources/'
                            + info.CFBundleIconFile)
                    .catch(err => reject(err));

          let icon = new Icns(iconData);

          iconReading(icon)
            .then((ret) => resolve(ret))
            .catch((err) => reject(err));

        });
        break;
      case GNOME:
        return new Promise((resolve,reject) => {
          gnomeIcon(this.folder)
            .then((img) => resolve(img))
            .catch((err) => reject(err));
        });
        break;
      case WINDOWS:
        return new Promise((resolve,reject) => {
          winIco(this.folder)
            .then((png) => resolve({buffer:png,format:'image/png'}))
            .catch((err) => reject(err));
        });
        break;
      default:
        break;

    }
  }
}

var iconFinder = (folder) => new Promise((resolve,reject) => {

  let file = new AbstractFile(folder);
  file.init();
  file.read()
  .then((buffer) => resolve(buffer))
  .catch((error) => reject(error));
});

exports.iconFinder = iconFinder;
