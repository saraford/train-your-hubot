'use strict'

const hubot_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot/bin/hubot";
const hubot_cwd_path = "/Users/saraford/repos/electron/hubot/node_modules/hubot/myhubot";

const $ = require('jquery');
const ipcRenderer = require('electron').ipcRenderer;
var hubot_spawn = undefined;
var is_hubot_response_we_want = false;
let hubotOutputWindow = undefined;

const wireUpButtons = () => {

  let sendButton = $('#send-button');
  let hubotInput = $('#hubot-input');

  sendButton.on('click', function() {
    is_hubot_response_we_want = false;

    var request = hubotInput.val() + '\n';

    console.log("sending ", request);
    hubot_spawn.stdin.write(request);

    updateWindowWithUserMessage(request);

    // clear input window for next command
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

  hubotOutputWindow = $('#hubot-output');
  hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'>hubot loading...</div></div>");

  const spawn = require('child_process').spawn;
  hubot_spawn = spawn(hubot_path, {cwd: hubot_cwd_path, env: process.env});

  var hubotLoaded = false;
  var current_response = "";

  hubot_spawn.stdout.on('data', (data) => {

    // the async response contains a lot of noise
    var hubot_response = data.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    console.log("stdout: " + hubot_response);

    /*  there are two reasons why we have to parse this text
        1. hubot echos the commands back for some reasons
            e.g. if you send "hubot ping" he comes back w "hubot ping hubot> PONG"
            I don't know why
        2. these messages are async, so a simple "myhubot ping myhubot> PONG" could be
            all in one event call or across 7+ different event calls, e.g. letter by letter
            aka good times
        so we check...
          1. is hubot loaded? if not, keep parsing text
          2. add up all the current_response (if across multiple events) until
              the "myhubot>" prhase is found
          3. we want everything "myhubot>". this could be all in one event/line
              or across multiple events. We keep parsing...
          4. the only way we know we're done getting response from hubot from #3
              is when the user sends the next message to hubot.
              when is_hubot_response_we_want true, we know we're still parsing #3
              if false (set in the "send hubot message" event), we go back to #2
    */

    if (hubot_response.indexOf("Data for hubot brain retrieved from Redis") !== -1) {
      hubotLoaded = true;
      hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'>hubot ready</div></div>");
      scrollDown();
      return;
    }

    if (!hubotLoaded) {
      return;
    }

    // because hubot is echo'ing commands back, we have to wait until we get "myhubot2>"
    // to avoid displaying that text
    current_response += hubot_response;

    // the response we want comes after the current "myhubot>" response
    if (current_response.includes("myhubot>")) {
      is_hubot_response_we_want = true;

      // the real hubot response might have come with this current_response
      // e.g. "myhubot> PONG" instead of "PONG" on a newline
      // so display everything that comes after "myhubot>"
      var index = current_response.indexOf("myhubot>");
      var length = current_response.length;
      var start_of_response = current_response.substring(index + 8, length - 1);

      console.log("index: " + index + " lenght: " + length + " start_of_response: " + start_of_response);

      if (start_of_response.length != 0) {
        console.log("Yep response was on same line: " + start_of_response);

        // trim whitespace and add
        hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'>" + start_of_response.trim() + "</div></div>");
        scrollDown()

        // clear current response for next time
        current_response = "";
        return;

      } else {

        // hubot just echo'ing back our previous text
        // just ignore this stdout.on event and continue to next event
        current_response = "";
        return;
      }

    }

    if (is_hubot_response_we_want) {
      console.log("This is next response " + current_response);

      current_response = current_response.trim();

      // only supporting single .jpg responses right now
      if (current_response.endsWith(".jpg")) {
        hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'><img src='" + current_response + "'/></div></div>");
      } else {
        hubotOutputWindow.append("<div class='output-row'><div class='hubot-avatar'><img src='hubot.png'/></div><div class='hubot-message'>" + current_response + "</div></div>");
      }

      scrollDown();

      current_response = "";
      console.log("stdout: " + current_response);
    }

  });

  hubot_spawn.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  hubot_spawn.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

function scrollDown() {
  // to keep the latest output visible
  hubotOutputWindow.stop().animate({
    scrollTop: hubotOutputWindow[0].scrollHeight
  }, 200);
}

function updateWindowWithUserMessage(request) {
  hubotOutputWindow.append("<div class='output-row'><div class='user-avatar'><img src='user.png'/></div><div class='user-message'>" + request + "</div></div>");
  scrollDown();
}
