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

var all_responses = undefined;
function spawnHubot() {

//const hubot = spawn(hubot_command, {cwd: '/Users/path/to/hubot', env: process.env});
  const spawn = require('child_process').spawn;

  //  hubot_spawn = spawn(hubot_command);
  hubot_spawn = spawn(hubot_path, {cwd: hubot_cwd_path, env: process.env});

  hubot_spawn.stdout.on('data', (data) => {
    var hubot_response = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    all_responses = all_responses + " " + hubot_response;
    $('#hubot-output').text(data);
    console.log("stdout: " + data);
  });

  hubot_spawn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  hubot_spawn.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
