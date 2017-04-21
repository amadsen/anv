"use strict";

/*
We're going to build the GUI version first. We can worry about making it work as
a CLI later.
*/

process.on('uncaughtException', (err) => {
    console.error(err);
    console.error(err.stack);
    process.exit(err.code || 1);
});

process.on('unhandledRejection', (err) => {
    console.error(err);
    console.error(err.stack);
    process.exit(err.code || 1);
});

// dependencies
const path = require('path');
const url = require('url');
const sh = require('shelljs');
const chokidar = require('chokidar');
// Get app from electron
const {app} = require('electron');

const createTray = require('./lib/tray/init.js');
const updateTray = require('./lib/tray/data.js').update;

// We're not looking for a dock icon, thank you
if (app.dock) app.dock.hide();

// Read in our config
const config = require('configr8')('anv')({
    local: '~/.anv/versions',
    remote: {
        node: url.parse('https://nodejs.org/dist/'),
        io: url.parse('https://iojs.org/dist/')
    }
});
console.log(config);

if (!config.local) {
    console.error('Unable to determine local path for storing managed versions');
    process.exit(1);
}

// resolve ~ at the beginning of config.local
if ( '~' === config.local[0] ) {
    config.local = path.join( require('os-homedir')(), config.local.slice(1) );
}
// make the local directory if necessary
sh.mkdir('-p', config.local);
console.log(config.local);

// Watch our local directory to figure out which versions
// we already have installed and keep the TaskBar menu up to date
const versionWatcher = chokidar.watch(config.local, {
    depth: 2,
    persistent: true
});
versionWatcher.on('all', updateTray(config) );

// const shouldQuit = app.makeSingleInstance((argv, cwd) => {
//     // Someone tried to run a second instance, we should focus our window.
// });
//
// if (shouldQuit) {
//   app.quit();
// }

app.isReady()? onReady() : app.on('ready', onReady);

function onReady () {

    // createTray will ensure the tray is actually created only once
    createTray();


}
