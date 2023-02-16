const chance = require("chance").Chance();

const getValidHandlerRandom = () => {
  return chance.string({
    length: 10,
    casing: "lower",
    alpha: true,
    numeric: true,
    symbols: false,
  });
};

module.exports = {
  getValidHandlerRandom,
};
