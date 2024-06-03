const fs = require("node:fs");
const path = require("node:path");

module.exports = (client) => {
  //get the events directory path
  const eventsPath = path.join(__dirname, "../events");

  //get .js files from the events path
  const eventsFile = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventsFile) {
    //concat the path and the name of the file
    const filePath = path.join(eventsPath, file);
    //require from the path
    const event = require(filePath);

    //fire once if hasProp of once
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
      //mostly for interactions
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};
