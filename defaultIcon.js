const fs = require('fs');

var icon = '';

try {
  icon = fs.readFileSync('./folder.png');
  icon = icon.toString('base64');
} catch(err) {
  icon = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
}

exports.default = icon;
