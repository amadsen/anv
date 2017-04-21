
const ipc = require('electron').ipcRenderer;

console.log('Preload script running');

function template (item) {
return `
<div id="${item.id}">
    ${item.label}
</div>
`;
}

function versionsRecieved (versions) {
    console.log( 'Versions recieved: ' + Date.now() );

    let dom = document.getElementById('versions');
    if (dom && versions) {
        dom.innerHTML = versions.reduce( (html, item) => {
            //
            html += template(item);
            return html;
        }, '');
    }
}

process.once('loaded', () => {
    console.log('"loaded" in preload script');
    ipc.on('data', (event, message) => {
        console.log(message);
        versionsRecieved(message);
    });
});
