'use strict'

const hubot_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot/bin/hubot";
const hubot_cwd_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot";

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
var hubot_spawn = undefined;

const wireUpButtons = () => {

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');

  sendButton.on('click', function() {
    var request = hubotInput.val() + '\n';

    console.log("sending ", request);
    hubot_spawn.stdin.write(request);

    // clear input for next command
    $(hubotInput).val('');

  });

  hubotInput.keyup(function (e) {
    if (e.keyCode == 13) {
      sendButton.click();
    }
});
}

document.addEventListener('DOMContentLoaded', function() {
  wireUpButtons();
  spawnHubot();
});

function spawnHubot() {

  const spawn = require('child_process').spawn;
  hubot_spawn = spawn(hubot_path, {cwd: hubot_cwd_path, env: process.env});

  var hubotLoaded = false;
  var raw_output = "";
  hubot_spawn.stdout.on('data', (data) => {

    if (data.indexOf("Data for hubot brain retrieved from Redis") !== -1) {
      hubotLoaded = true;
      var placeholder = $('#hubot-output').text();
      var initial_output = placeholder + "\nmyhubot ready";
      $('#hubot-output').text(initial_output);
      raw_output = initial_output + "\n";
      return;
    }

    if (!hubotLoaded) {
      return;
    }

    var hubot_response = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    raw_output += hubot_response;
    $('#hubot-output').text(raw_output);

    // to keep the latest output visible
    $('#hubot-output').stop().animate({
      scrollTop: $('#hubot-output')[0].scrollHeight
    }, 200);

    console.log("stdout: " + hubot_response);
  });

  hubot_spawn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  hubot_spawn.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
