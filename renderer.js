'use strict'

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;

require('coffee-script/register');
const Path = require('path');
const Hubot = require('hubot');
const TextMessage = Hubot.TextMessage;
const helper = require('./helper');
var robot = undefined;

const callMe = (data) => {
  console.log("callMe has been called w data: " + data);
  updateWindowWithHubotMessage(data);
}

const callMe2 = (data) => {
  console.log("callMe2 has been called w data: " + data);
  updateWindowWithHubotMessage(data, true);
}

var loadScripts = function() {
  var scriptsPath = Path.resolve(".", "scripts");
  robot.load(scriptsPath);

  var rulesScriptPath = Path.resolve(".", "node_modules/hubot-rules/src")
  robot.load(rulesScriptPath);

  var pugmeScriptPath = Path.resolve(".", "node_modules/hubot-pugme/src")
  robot.load(pugmeScriptPath);
};

let hubotOutputWindow = undefined;

const wireUpButtons = () => {

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');
  hubotOutputWindow = $('#hubot-output');

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
  robot.adapter.foo(callMe);
  robot.adapter.foo2(callMe2);
  robot.run();
  console.log("made it");

  var foo = "";
  var foo2 = "";
}

function updateWindowWithHubotMessage(response, isEmote) {

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
