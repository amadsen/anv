
const {BrowserWindow} = require('electron');
const Positioner = require('electron-positioner');
const url = require('url');
const path = require('path');
const data = require('./data.js');

let win;
let positioner;

module.exports = function trayMenu (fn) {
    return toggleMenu.bind(null, fn);
};

function show(bounds) {
    if (positioner && bounds) {
        positioner.move('trayLeft', bounds);
    }
    win.show();
    win.webContents.openDevTools();
}

function toggleMenu (fn, bounds) {
    let visible = !!(win && win.isVisible());
    console.log('Toggle menu. visible:', visible);
    /*
     Actually create and load the window only once.
     win.hide() on 'blur'
     win.show
    */
    if (visible) {
        return win.hide();
    }
    if (win && !win.isDestroyed()) {
        show(bounds);
    } else {
        win = new BrowserWindow({
            useContentSize: true,
            resizable: false,
            movable: false,
            minimizable: false,
            fullscreenable: false,
            frame: false,
            acceptFirstMouse: true,
            backgroundColor: '#80FFFFFF',
            show: false,
            webPreferences: {
                nodeIntegration: false,
                preload: path.join( __dirname, 'preload.js' )
            }
        });
        positioner = new Positioner(win);
        win
            .once('ready-to-show', () => {
              show(bounds);
            })
            .on('blur', () => {
                win.hide();
            })
            .on('show', () => {
                fn('show');
            })
            .on('hide', () => {
                fn('hide');
            });

        win.webContents.on('did-finish-load', () => {
            data.subscribe( (versions) => {
                win.webContents.send('data', versions);
            });
            win.webContents.send('data', data.get());
        });

        win.loadURL(
            url.format({
                protocol: 'file',
                slashes: true,
                pathname: path.join(__dirname, 'index.html')
            })
        );
    }
}
