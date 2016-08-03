'use strict'
const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
var hubot_spawn = undefined;

const wireUpButtons = () => {

  let $enterButton = $('#enter-button');
  let $hubotInput = $('#hubot-input');

  $enterButton.on('click', function() {

    //    hubot_spawn.stdin.write('help\n');
    //    hubot_spawn.stdin.write('myhubot2 ping\n');

    var request = $('#hubot-input').val() + '\n';
    console.log("sending ", request);

    hubot_spawn.stdin.write(request);

  });
}

document.addEventListener('DOMContentLoaded', function() {
  wireUpButtons();
  spawnHubot();
});

var all_responses = undefined;
function spawnHubot() {

//const hubot = spawn(hubot_command, {cwd: '/Users/path/to/hubot', env: process.env});
  const hubot_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot2/bin/hubot";
  const hubot_cwd_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot2";
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
