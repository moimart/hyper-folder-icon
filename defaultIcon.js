const fs = require('fs');
const path = require('path');

var icon = '';

try {

  var imgPath = path.join(__dirname, './folder.png');

  icon = fs.readFileSync(imgPath);
  icon = Buffer.from(icon).toString('base64');
} catch(err) {
  console.log(err);
  icon = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
}

exports.icon = icon;
