'use strict'

const hubot_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot/bin/hubot";
const hubot_cwd_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot";

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
var hubot_spawn = undefined;
var is_response_next = false;

const wireUpButtons = () => {

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');

  sendButton.on('click', function() {
    is_response_next = false;

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

  let hubotOutput = $('#hubot-output');

  var hubotLoaded = false;
  var current_raw_response = "";
  hubot_spawn.stdout.on('data', (data) => {

    if (data.indexOf("Data for hubot brain retrieved from Redis") !== -1) {
      hubotLoaded = true;

      hubotOutput.append("<div class='hubot-msg'>myhubot ready</div>");
      return;
    }

    if (!hubotLoaded) {
      return;
    }

    // the async response contains a lot of noise
    var hubot_response = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    console.log("stdout: " + hubot_response);

    // because hubot is echo'ing commands back, we have to wait until we get "myhubot2>"
    // to avoid displaying that text
    current_raw_response += hubot_response;

    // the response we want comes after the current "myhubot>" response
    if (current_raw_response.includes("myhubot>")) {
      is_response_next = true;

      // the response might have come with this current_raw_response
      // e.g. "myhubot> PONG" instead of PONG on a newline
      // so display everything that comes after "myhubot>"
      var index = current_raw_response.indexOf("myhubot>");
      var length = current_raw_response.length;
      var start_of_response = current_raw_response.substring(index + 8, length - 1);

      console.log("index: " + index + " lenght: " + length + " start_of_response: " + start_of_response);

      if (start_of_response.length != 0) {
        console.log("Yep response was on same line: " + start_of_response);

        // trim whitespace and add
        hubotOutput.append("<div class='hubot-msg'>" + start_of_response.trim() + "</div>");

        // to keep the latest output visible
        hubotOutput.stop().animate({
          scrollTop: hubotOutput[0].scrollHeight
        }, 200);

        // clear current response for next time
        current_raw_response = "";
        return;

      } else {

        // hubot just echo'ing back our previous text
        // just ignore this stdout.on event and continue to next event
        current_raw_response = "";
        return;
      }

    }

    if (is_response_next) {
      console.log("This is next response " + current_raw_response);

      // prep found text and add
      hubotOutput.append("<div class='hubot-msg'>" + hubot_response.trim() + "</div>");

      // to keep the latest output visible
      hubotOutput.stop().animate({
        scrollTop: hubotOutput[0].scrollHeight
      }, 200);

      current_raw_response = "";
      console.log("stdout: " + hubot_response.trim());
    }

  });

  hubot_spawn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  hubot_spawn.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
