"use strict";

// Get Menu and Tray from electron
const {app, Menu, Tray} = require('electron');

const trayMenu = require('./window.js');

function toggleHighlight (show) {
    if (tray){
        tray.setHighlightMode(
            'show' === show? 'always' : 'never'
        );
    }
}
const toggleTrayMenu = trayMenu(toggleHighlight);

function toggleMenu() {
    if (tray) {
        return toggleTrayMenu( 
            'function' === typeof tray.getBounds? tray.getBounds() : undefined
        );
    }
}

// Keep a reference to our tray menu.
let tray = null;

function createTray () {
    if( tray ){
        return;
    }
    console.log('\tCreating Tray Icon');
    tray = new Tray('icon/anv@2x.png');

    if( 'function' === typeof app.isUnityRunning && app.isUnityRunning() ) {
        // Unity doesn't support `click` events on Tray icons
        tray.setContextMenu(
            Menu.buildFromTemplate([
                {
                    label: 'Switch Node Version',
                    click: toggleMenu
                },
                {
                    role: 'quit'
                }
            ])
        );
    } else {
        tray
          .on('click', toggleMenu)
          .on('right-click', toggleMenu)
          .on('double-click', toggleMenu);
    }
}

module.exports = createTray;
