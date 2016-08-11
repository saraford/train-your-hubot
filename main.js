'use strict';

const {app, BrowserWindow, ipcMain} = require('electron');

var mainWindow = null;

app.on('ready', function() {

    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        minHeight: 600,
        minWidth: 400
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');
    //mainWindow.webContents.openDevTools();

});

ipcMain.on('close-app', function () {
    app.quit();
});
