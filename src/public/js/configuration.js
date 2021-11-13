const  { ipcRenderer } = require('electron');
const form = document.getElementById('mainConfigurationForm');

form.addEventListener('submit', e => {
	e.preventDefault();
	ipcRenderer.send('configurationFinished');
});