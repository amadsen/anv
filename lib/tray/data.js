"use strict";

const path = require('path');
const globby = require('globby');
const EventEmitter = require('events');
const determineCurrentVersion = require('../determine-current-version.js');

// Keep a reference to our version data
let versions = [];

const subscriptions = new EventEmitter();

function subscribe (fn) {
    // the same function may only subscribe once
    subscriptions.removeListener('update', fn);
    subscriptions.on('update', fn);
    return function unsubscribe () {
        subscriptions.removeListener('update', fn);
    }
}

function prepareData(list, current) {
    console.log('\tList recieved');

    versions = list
        .slice()
        .sort()
        .map( (filePath) => {
            /*
             TODO: verify the win32 would use posix seperator here
             because of globby.
             */
            let parts = filePath.split(path.posix.sep);
            return {
                // the end of parts is probably an empty string
                number: parts.pop() || parts.pop(),
                type: parts.pop()
            }
        })
        .filter( (version) => {
            // make sure we can't end up with versions in the application menu
            return version.type !== 'application';
        })
        .reduce( (items, version, idx, sorted) => {
            if (idx === 0 || version.type !== (sorted[idx-1] || {}).type) {
                items.push({
                    id: `${version.type}-latest`,
                    type: version.type,
                    label: 'Latest'
                },
                {
                    id: `${version.type}-stable`,
                    type: version.type,
                    label: 'Stable'
                });
            }
            items.push({
                id: `${version.type}-${version.number}`,
                type: version.type,
                label: version.number,
                checked: (
                    current &&
                    version.type === current.type &&
                    version.number === current.number
                )
            });

            return items;
        }, []);

    subscriptions.emit('update', versions);
}

function debounce (fn, wait) {
    function makeTimer () {
        return setTimeout(fn, wait > 100? wait : 100);
    }

    let timer;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = makeTimer();
        return timer;
    }
}

function queue(fn) {
    let q = [];
    function run () {
        let cb = q[0];

        if(q.length > 0){
            fn( function (err) {
                if('function' === typeof cb){
                    cb(err);
                }
                q.shift();
                run();
            });
        }
    }

    return function (done) {
        q.push(done);
        if (1 === q.length) {
            run();
        }
    }
}

function updateData (config) {
    console.log('- Config passed to update tray menu');
    return (done) => {
        console.log('- Updating tray menu');
        Promise.all([
            // list versions available locally
            globby(`${config.local}/*/*/`),
            // Figure out which version is active - warn if it isn't managed by us!
            determineCurrentVersion(config)
        ])
            .then( ([list, current]) => {
                prepareData(
                    list,
                    current
                );
                done();
            })
            .catch( (err) => {
                console.error(err);
                done(err);
            });
    }
}

module.exports = {
    subscribe: subscribe,
    get: function () {
        console.log('data.get() called.');
        return versions;
    },
    update: function(config) {
        return debounce( queue( updateData(config) ), 250 );
    }
};
