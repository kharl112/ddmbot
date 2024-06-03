module.exports = {
  name: "ready",
  //identifies if execute function will execute once
  once: true,
  execute(client) {
    console.log(`${client.user.tag} has arise from death`);
  },
};
