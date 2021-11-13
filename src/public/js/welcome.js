const { ipcRenderer } = require('electron');
const welcomeButton = document.getElementById('welcomeButton');

welcomeButton.addEventListener('click', () => { ipcRenderer.send('activeWelcomeButton') });