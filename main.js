'use strict';

const {app, BrowserWindow, ipcMain, remote} = require('electron');

var mainWindow = null;

app.on('ready', function() {

    mainWindow = new BrowserWindow({
        height: 600,
        width: 400,
        minHeight: 600,
        minWidth: 400
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');
    //mainWindow.webContents.openDevTools();

});

process.on('uncaughtException', function (error) {
    // Handle the error
    console.log("YO YO YO main.js");
});


ipcMain.on('resizeMainForScripts', function (e, width, height) {
    mainWindow.setSize(width, height);
    mainWindow.webContents.send('showScripts');
});

ipcMain.on('close-app', function () {
    app.quit();
});
