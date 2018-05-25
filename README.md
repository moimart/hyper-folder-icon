hyper-folder-icon
======

# Custom MacOS and Windows folder icons shown in Hyper terminal Tabs

# Features for MacOS:

- Show icon of current folder if custom icon has been applied to the folder
- Show Volume icon of the HD if the folder does not have a custom icon
- Show Volume icon of additional Volumes if a custom icon has been applied to the Volume
- Show App icon if inside of the .app folder
- Show a default icon if no icon can be found

# Features for WINDOWS (Untested)

- Show icon from Desktop.ini file

## Optional Configuration keys

- tabIconSize: default 24 -> Integer (Note: This is a pixel value)
- tabIconAlpha: default 1.0 -> Float
- tabIconTopMargin: default -30 -> Integer (Note: This is a pixel value)
- tabIconLeftMargin: default 10 -> Integer (Note: This is a percentage value)

## Notes

- ICNS reading by https://github.com/jhermsmeier/node-apple-icns
- Resource fork by https://github.com/mattsoulanille/ResourceForkJS
- Default folder icon from mac


![alt text](https://i.imgur.com/4y2Oj6D.png "Real world example")
