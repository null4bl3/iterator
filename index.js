var electron = require('electron');
var app = electron.app;

require('electron-debug')();

var mainWindow;
function onClosed() {
	mainWindow = null;
}

function createMainWindow() {
	var win = new electron.BrowserWindow({
		useContentSize: true
	});
	win.maximize();
	win.setMenu(null);
	win.loadURL('file://' + __dirname + '/index.html');
	win.on('closed', onClosed);
	return win;
}

app.on('window-all-closed',function() {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate',function() {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready',function() {
	mainWindow = createMainWindow();
});
