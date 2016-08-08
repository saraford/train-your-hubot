var EventEmitter = require("events").EventEmitter;

  exports.ElectronApp = function(wrapper) {
      function handleEvent(args) {
          console.log("I'm from ElectronApp and I caught "+JSON.stringify(args));
      }

      wrapper.robotEvents.on("myEvent", function(args) {
          handleEvent(args);
      });
  }
