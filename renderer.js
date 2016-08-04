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

  var hubotLoaded = false;
  var hubot_history = "";
  var current_raw_response = "";
  hubot_spawn.stdout.on('data', (data) => {

    if (data.indexOf("Data for hubot brain retrieved from Redis") !== -1) {
      hubotLoaded = true;

      $('#hubot-output').append("<div class='hubot-msg'>myhubot ready</div>");
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

        // prep found text
        var prepared_response = start_of_response.trim();
        prepared_response = "\n" + prepared_response;
        // if (prepared_response.indexOf('\n') == -1) {
        //   console.log("need to add a newline");
        //   prepared_response = "\n" + prepared_response;
        // }

        $('#hubot-output').append("<div class='hubot-msg'>" + prepared_response + "</div>");
        // hubot_history += prepared_response;
        // $('#hubot-output').text(hubot_history);
        console.log("stdout: " + prepared_response);

        // to keep the latest output visible
        $('#hubot-output').stop().animate({
          scrollTop: $('#hubot-output')[0].scrollHeight
        }, 200);

        current_raw_response = "";
        return;

      } else {
        // just return and continue on next stdout.on event
        current_raw_response = "";
        return;
      }

    }

    if (is_response_next) {
      console.log("This is next response " + current_raw_response);

      // prep found text
      var prepared_response = hubot_response.trim();
      prepared_response = "\n" + prepared_response;

      // if (prepared_response.indexOf('\n') == -1) {
      //   console.log("need to add a newline");
      //   prepared_response = "\n" + prepared_response;
      // }

      $('#hubot-output').append("<div class='hubot-msg'>" + prepared_response + "</div>");
      // hubot_history += prepared_response;
      // $('#hubot-output').text(hubot_history);

      // to keep the latest output visible
      $('#hubot-output').stop().animate({
        scrollTop: $('#hubot-output')[0].scrollHeight
      }, 200);

      current_raw_response = "";
      console.log("stdout: " + prepared_response);
    }

  });

  hubot_spawn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  hubot_spawn.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
