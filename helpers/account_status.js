module.exports = (() => {
  const status_array = [
    "Offline",
    "Online",
    "Busy",
    "Away",
    "Snooze",
    "Looking for trade",
    "Looking to play",
  ];

  const getStatus = (status) => {
    if (!/\d/g.test(status)) return "Offline";
    if(parseInt(status) > status_array.length - 1) return "Custom status";
    return status_array[status];
  };

  return { getStatus };
})();
