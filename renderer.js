'use strict'
const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
var hubot_spawn = undefined;

const wireUpButtons = () => {

  let $closeButton = $('#close-window');
  let $enterButton = $('#enter-button');
  let $hubotInput = $('#hubot-input');

  $closeButton.on('click', function() {
    ipcRenderer.send('close-app');
  });

  $enterButton.on('click', function() {
    var request = $('#hubot-input').val() + '\n';
    console.log("sending ", request);

//    hubot_spawn.stdin.write(request);
    hubot_spawn.stdin.write('help\n');

  });
}

document.addEventListener('DOMContentLoaded', function() {
  wireUpButtons();
  spawnHubot();
});

var all_responses = undefined;
function spawnHubot() {

  const hubot_command = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot/bin/hubot";
  const spawn = require('child_process').spawn;
  hubot_spawn = spawn(hubot_command);

  hubot_spawn.stdout.on('data', (data) => {
    var hubot_response = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    all_responses = all_responses + " " + hubot_response;
    $('#hubot-output').text(all_responses);
    console.log("stdout: " + hubot_response);
  });

  hubot_spawn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  hubot_spawn.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
