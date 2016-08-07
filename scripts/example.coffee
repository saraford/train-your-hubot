# if launching from command line

module.exports = (robot) ->
  robot.respond /PING$/i, (msg) ->
    console.log("yo")
    msg.send "pong"

  robot.respond /HEY$/i, (msg) ->
    msg.send "hey back"
