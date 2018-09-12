require("./configureContainer")().then(container => {
  require("./presentation")({ container });
});
