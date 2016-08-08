var EventEmitter = require("events").EventEmitter;

  exports.ElectronApp = function(wrapper) {

    var response = ""

      wrapper.robotEvents.on("myEvent", function(args) {
        var response = JSON.stringify(args);
        console.log("I'm from ElectronApp and I caught "+ response);
      });
  }
