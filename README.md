hyper-folder-icon
======

# Custom MacOS and Windows folder icons shown in Hyper terminal Tabs

# Install

From hyper terminal: `hyper i hyper-folder-icon`

# Features for macOS:

- Show icon of current folder if custom icon has been applied to the folder
- Show Volume icon of the HD if the folder does not have a custom icon
- Show Volume icon of additional Volumes if a custom icon has been applied to the Volume
- Show App icon if inside of the .app folder
- Show a default icon if no icon can be found

- Integrates with hyper-tab-touchbar showing the icons in the MacBook Pro's TouchBar

![hyper-tab-touchbar integration](https://i.imgur.com/2pnvB1w.jpg)

# Features for Windows (Untested)

- Show icon from Desktop.ini file

# Features for Linux/GNOME

- Show custom GNOME icon from gvfs metadata

## Optional Configuration keys

- tabIconSize: default 24 -> Integer (Note: This is a pixel value)
- tabIconAlpha: default 1.0 -> Float
- tabIconTopMargin: default -30 -> Integer (Note: This is a pixel value)
- tabIconLeftMargin: default 10 -> Integer (Note: This is a percentage value)

## Notes

- ICNS reading by https://github.com/jhermsmeier/node-apple-icns
- Resource fork by https://github.com/mattsoulanille/ResourceForkJS
- Default folder icon from mac


![alt text](https://i.imgur.com/4y2Oj6D.png "MacOS Screenshot")

![alt text](https://i.imgur.com/PlsxHq2.png "GNOME/Linux Screenshot")
