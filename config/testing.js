const { v4: uuidv4 } = require('uuid');

module.exports = {
                  db: {
                    host: "csci334-shard-00-00.dmxc1.mongodb.net:27017,csci334-shard-00-01.dmxc1.mongodb.net:27017,csci334-shard-00-02.dmxc1.mongodb.net:27017",
                    name: "testing-" + uuidv4().substring(0, 20)
                  }
                }
