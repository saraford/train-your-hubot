'use strict'

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const play_scripts = "play.coffee";
require('coffee-script/register');
const fs = require('fs');
const Path = require('path');
const Hubot = require('hubot');
const TextMessage = Hubot.TextMessage;
const helper = require('./helper');
var robot = undefined;
var scriptArea = undefined;
var remote = require('electron').remote;
var app = remote.require('electron').app;
const userScriptsPath = Path.resolve(app.getPath('documents'), "myHubotScripts");

var loadUserScripts = function() {

  robot.load(userScriptsPath);

};

var loadInstalledScripts = function() {

  var rulesScriptPath = Path.resolve(__dirname, "node_modules/hubot-rules/src")
  robot.load(rulesScriptPath);

  var pugmeScriptPath = Path.resolve(__dirname, "node_modules/hubot-pugme/src")
  robot.load(pugmeScriptPath);

  var scriptsPath = Path.resolve(__dirname, "scripts");
  robot.load(scriptsPath);

};


// because hubot won't put up with code that doesn't work!
// https://github.com/github/hubot/blob/master/src/robot.coffee#L365
function isPlayScriptValid() {

  console.log("testing play scripts");
  var valid = false;

  var full = Path.resolve(userScriptsPath, "play.coffee");

  try {

    var coffeescript = require("coffee-script");
    console.log("Full file path: " + full);
    var source = fs.readFileSync(full, "utf8");

    coffeescript.compile(source);
    valid = true;
    $('#script-error').hide();

  }
  catch(error) {

    valid = false;
    $('#script-error').show();
    console.log("Caught an exception: Unable to load " + full + ": " + error.stack);
     return valid;
  }

  return valid;
}

var reloadAllScripts = function() {

  if (isPlayScriptValid()) {

    // must do this on reload otherwise, we'll get back multiple responses...
    robot.commands = [];
    robot.listeners = [];

    // when reloading, let's delete only the file we're allowing the user to
    // modify to keep the deleteScriptCache function simple
    // loading the same npm-installed scripts multiple times (e.g. hubot-rules)
    // doesn't seem to have any negative effects
    var scriptToDelete = Path.resolve(userScriptsPath, play_scripts);
    deleteScriptCache(scriptToDelete);

    loadInstalledScripts();
    loadUserScripts();

    console.log("all scripts loaded");

  } else {

    console.log("there's a syntax error with the script");
  }
}

var loadInitialScripts = function() {

  // load the npm installed scripts
  loadInstalledScripts();

  console.log("Loaded initial scripts");

  // first test if it is a valid script
  // if there are errors, kick back to user to fix
  if (isPlayScriptValid()) {
    console.log("play scripts are valid");

    loadUserScripts();

    console.log("all scripts loaded");

  } else {

    console.log("there's a syntax error with the play script");
  }

}

function deleteScriptCache(scriptToDelete) {

  // https://github.com/vinta/hubot-reload-scripts/blob/master/src/reload-scripts.coffee
  if (fs.existsSync(scriptToDelete)) {

    if (require.cache[require.resolve(scriptToDelete)]) {
      try {
        var cacheobj = require.resolve(scriptToDelete);
        delete(require.cache[cacheobj]);
      }
      catch(error) {
        console.log("Unable to invalidate #{cacheobj}: #{error.stack}");
      }
    }
  }

  updateWindowWithHubotMessage("done refreshing scripts!", true);
}


let hubotOutputWindow = undefined;

const wireUpButtons = () => {

  $('#right-section').hide();

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');
  let loadScriptsNewButton = $('#upload-button');
  let saveScriptsButton = $('#save-button');
  let scriptsButton = $('#scripts-button');
  hubotOutputWindow = $('#hubot-output');
  scriptArea = $('#script-textarea');

  scriptsButton.on('click', function() {
    showScriptsPane();
  });

  loadScriptsNewButton.on('click', function() {
    saveScripts(true);
  });

  saveScriptsButton.on('click', function() {
    console.log("clicked");
    saveScripts(false);
  });

  sendButton.on('click', function() {

    // update the window first
    var request = $('#hubot-input').val();
    updateWindowWithUserMessage(request);

    // clear input window for next command
    hubotInput.val('');

    // if we immediately request, hubot comes back instantly
    // need a bit of a delay to get that back-and-forth chat feeling
    setTimeout(function() {

      // send request to hubot
      console.log("sending ", request);
      console.log("here we go...");
      var user = robot.brain.userForId(1, 'octocat', 'Shell');
      robot.receive(new TextMessage(user, request, 'messageId'));

    }, 750);

  });

  hubotInput.keyup(function (e) {
    if (e.keyCode == 13) {
      sendButton.click();
    }
});
}

document.addEventListener('DOMContentLoaded', function() {
  createLocalHubotScripts();
});

function startHubot() {
  // adapterPath, adapterName, enableHttpd, botName, botAlias
  // adapterPath - the first parameter it is never used, hence undefined
  //debugger
  robot = Hubot.loadBot(undefined, "sample", true, "Hubot", false);
  robot.adapter.once('connected', loadInitialScripts);
  robot.adapter.wireUpResponses(updateWindowWithHubotMessage);
  robot.run();

  updateWindowWithHubotMessage("I'm ready!");
}

const updateWindowWithHubotMessage = (response, isEmote) => {

  if (typeof isEmote === 'undefined') { isEmote = false; }

  response = response.trim();

  // only supporting single media responses right now
  if (response.endsWith(".jpg") || response.endsWith(".gif") || response.endsWith(".png")) {
    hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'><img src='" + response + "'/></div></div>");
  } else if (response.includes('Shell:')) {
    response = response.replace("Shell:", "@octocat:");
    hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'>" + response + "</div></div>");
  }
  else {
    if (isEmote) {
          hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'><i>" + response + "</i></div></div>");
    } else {
      hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'>" + response + "</div></div>");
    }
  }

  scrollDown();
}

function updateWindowWithUserMessage(request) {
  hubotOutputWindow.append("<div class='output-row'><div class='user-avatar'><img src='octocat.png'/></div><div class='user-message'>" + request + "</div></div>");
  scrollDown();
}

function scrollDown() {
  // to keep the latest output visible
  hubotOutputWindow.stop().animate({
    scrollTop: hubotOutputWindow[0].scrollHeight
  }, 200);
}

function showUserScriptInTextArea() {

  var file = Path.resolve(userScriptsPath, play_scripts);

  console.log("The file to play scripts is at: " + play_scripts);

  fs.readFile(file, 'utf8', function (error, script_contents) {
    if (error) {
      return console.log(error);
    }
    console.log(script_contents);
    scriptArea.text(script_contents);
  });
}

function saveScripts(reload) {
  var file = Path.resolve(userScriptsPath, play_scripts);
  var content = scriptArea.val();
  fs.writeFile(file, content, function () {
      if (reload) {
        reloadAllScripts();
      }
  });
}

var willShowScripts = false;
function showScriptsPane() {

  if ($('#right-section').is(":visible")) {
    // if showing, hide
    willShowScripts = false;
    $('#right-section').hide();
    $('#scripts-button').html('write scripts ->');
    ipcRenderer.send('resizeMainForScripts', 400, 600);
  } else {
    // if not visible, show
    willShowScripts = true;
    ipcRenderer.send('resizeMainForScripts', 800, 600);
  }
}

ipcRenderer.on('showScripts' , function(event , data) {

  if (willShowScripts) {
    // finish showing the scripts pane
    $('#right-section').show();
    $('#scripts-button').html('<- hide scripts');
  }
});

function createLocalHubotScripts() {

  fs.exists(userScriptsPath, (exists) => {
    if (exists) {
      wireUpButtons();
      startHubot();
      showUserScriptInTextArea();
    }
    else {
      console.log("doesn't exist, so creating");
      fs.mkdir(userScriptsPath, () => {

        var sourceFile = Path.resolve(__dirname, "initialPlayCoffee.txt");
        var sourceContents = fs.readFileSync(sourceFile, "utf8");

        var destinationFile = Path.resolve(userScriptsPath, "play.coffee");

        // create the file with this content
        fs.writeFile(destinationFile, sourceContents, 'utf8', (err) => {
          if (err) {
            console.log("unable to write play.coffee to " + userScriptsPath + " error: " + err);
          } else {
            wireUpButtons();
            startHubot();
            showUserScriptInTextArea();
          }
        });
      });
    }
  });
}
