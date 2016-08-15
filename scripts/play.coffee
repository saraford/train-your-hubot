 # use: "hubot thundercats!"
  robot.respond /thundercats$/i, (msg) ->
    msg.send "HOOOOOOOOOOOO!"

  robot.respond /tell me a joke$/i, (msg) ->
    msg.send "a 3-legged dog walks into a bar and says I'm looking for the man who shot my paw!"

  robot.respond /tell me another joke$/i, (msg) ->
    msg.send "knock knock, blah blah blah, now you laugh."

  robot.respond /how about one more$/i, (msg) ->
    msg.send "What do you think I am, some kind of comedian?"
