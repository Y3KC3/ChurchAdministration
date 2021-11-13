const { welcomeWindow, authenticationWindow, mainSoftwareWindow } = require('./configuration/main.js');
const { app } = require('electron');

require('electron-reload')(__dirname);
require('./database');

let example = false;

app.allowRendererProcessReuse = false;
app.setAppUserModelId(process.execPath);

if (example) {
	app.whenReady().then(authenticationWindow);
} else {
	//app.whenReady().then(welcomeWindow);
	app.whenReady().then(mainSoftwareWindow);
};