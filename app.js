const electron = require('electron');
const Menu = require('electron').Menu;

electron.app.on('ready', ()=> {
    let mainWindow = new electron.BrowserWindow({
        width: 600,
        height: 600,
        resizable: false
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.setMenu(null);
    mainWindow.webContents.openDevTools();
});

electron.app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

exports.closeGame = function() {
   electron.app.quit();
}