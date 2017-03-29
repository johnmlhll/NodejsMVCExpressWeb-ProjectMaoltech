//Bring all configuration settings into one central file
//configure port sockets for different comms modes
var config = {
    local: {
      mode: 'local',
      port: process.env.PORT || 3000,
      mongo: {
        host: '127.0.0.1',
        port: 27017
      }
    },
    staging: {
      mode: 'staging',
      port: process.env.PORT || 4000,
      mongo: {
        host: '127.0.0.1',
        port: 27017
      }
    },
    production: {
      mode: 'production',
      port: process.env.PORT || 5000,
      mongo: {
        host: '127.0.0.1',
        port: 27017
      }
    }
}
module.exports = function(mode) {
  //export module configuration making it available to all files in folder
  return config[mode || process.argv[2] || 'local'] || config.local;
}
