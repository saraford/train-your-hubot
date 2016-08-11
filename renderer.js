'use strict'

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

require('coffee-script/register');
const fs = require('fs');
const Path = require('path');
const Hubot = require('hubot');
const TextMessage = Hubot.TextMessage;
const helper = require('./helper');
var robot = undefined;

var loadScripts = function() {
  var scriptsPath = Path.resolve(".", "scripts");
  robot.load(scriptsPath);

  // var rulesScriptPath = Path.resolve(".", "node_modules/hubot-rules/src")
  // robot.load(rulesScriptPath);
  //
  // var pugmeScriptPath = Path.resolve(".", "node_modules/hubot-pugme/src")
  // robot.load(pugmeScriptPath);
};

function loadScriptsNew() {
  robot.commands = [];
  robot.listeners = [];

  var scriptsPath = Path.resolve(".", "scripts");
  var scriptsPathFull = Path.resolve(".", "scripts/example.coffee");

  deleteScriptCache(scriptsPathFull);
  robot.load(scriptsPath);

  console.log("scripts loaded");
}

function deleteScriptCache(scriptsBaseDir) {
  console.log("scriptsBaseDir: ", scriptsBaseDir);

  // ref: https://github.com/srobroek/hubot/blob/e543dff46fba9e435a352e6debe5cf210e40f860/src/robot.coffee
  if (fs.existsSync(scriptsBaseDir)) {

    var full = scriptsBaseDir;

    if (require.cache[require.resolve(full)]) {
        console.log("here5");
      try {
        console.log("here6");
        var cacheobj = require.resolve(full);
        console.log("Invalidate require cache for #{cacheobj}");
        delete(require.cache[cacheobj]);
        console.log("here7");
      }
      catch(error) {
        console.log("Unable to invalidate #{cacheobj}: #{error.stack}");
      }
    }
  }
}


let hubotOutputWindow = undefined;

const wireUpButtons = () => {

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');
  hubotOutputWindow = $('#hubot-output');
  let loadScriptsNewButton = $('#load-new-button');

  loadScriptsNewButton.on('click', function() {
    loadScriptsNew();
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
});

function startHubot() {
  // adapterPath, adapterName, enableHttpd, botName, botAlias
  // adapterPath - the first parameter it is never used, hence undefined
  robot = Hubot.loadBot(undefined, "sample", true, "Hubot", false);
  robot.adapter.once('connected', loadScripts);
  robot.adapter.wireUpResponses(updateWindowWithHubotMessage);
  robot.run();
  console.log("made it");

  var foo = "";
  var foo2 = "";
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
