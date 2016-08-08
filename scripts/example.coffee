# if hubot-launch is run from command line

module.exports = (robot) ->
  robot.respond /PING$/i, (msg) ->
    console.log("yo from hubot-launch scripts")
    msg.send "pong"

  robot.respond /HEY$/i, (msg) ->
    msg.send "hey back"
