'use strict'

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
const play_scripts = "scripts/play.coffee";
require('coffee-script/register');
const fs = require('fs');
const Path = require('path');
const Hubot = require('hubot');
const TextMessage = Hubot.TextMessage;
const helper = require('./helper');
var robot = undefined;
var scriptArea = undefined;

var loadScripts = function() {
  var scriptsPath = Path.resolve(".", "scripts");
  robot.load(scriptsPath);

  var rulesScriptPath = Path.resolve(".", "node_modules/hubot-rules/src")
  robot.load(rulesScriptPath);

  var pugmeScriptPath = Path.resolve(".", "node_modules/hubot-pugme/src")
  robot.load(pugmeScriptPath);
};

function loadScriptsNew() {

  // otherwise, we'll get back multiple responses...
  robot.commands = [];
  robot.listeners = [];

  // let's delete only the file we're allowing the user to modify
  // to keep the deleteScriptCache function simple
  // loading the same file multiple times (e.g. hubot-rules) doesn't
  // seem to have any negative effects
  var scriptToDelete = Path.resolve(".", play_scripts);
  deleteScriptCache(scriptToDelete);

  loadScripts();

  console.log("scripts loaded");
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

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');
  let loadScriptsNewButton = $('#upload-button');
  let saveScriptsButton = $('#save-button');
  hubotOutputWindow = $('#hubot-output');
  scriptArea = $('#script-textarea');

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
  wireUpButtons();
  startHubot();
  showUserScriptInTextArea();
});

function startHubot() {
  // adapterPath, adapterName, enableHttpd, botName, botAlias
  // adapterPath - the first parameter it is never used, hence undefined
  robot = Hubot.loadBot(undefined, "sample", true, "Hubot", false);
  robot.adapter.once('connected', loadScripts);
  robot.adapter.wireUpResponses(updateWindowWithHubotMessage);
  robot.run();

  updateWindowWithHubotMessage("I'm good to go!");
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

  var file = Path.resolve(".", play_scripts);
  fs.readFile(file, 'utf8', function (error, script_contents) {
    if (error) {
      return console.log(error);
    }
    console.log(script_contents);
    scriptArea.text(script_contents);
  });
}

function saveScripts(reload) {
  var file = Path.resolve(".", play_scripts);
  var content = scriptArea.val();
  fs.writeFile(file, content, function () {
      if (reload) {
        loadScriptsNew();
      }
  });
}
