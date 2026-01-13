const { getPrice } = require("./mockPrice.service");

exports.calculate = (h) => {
  const current = getPrice(h.symbol);
  const cost = h.quantity * h.buy_price;
  const value = h.quantity * current;
  const pnl = value - cost;
  return { ...h, current, cost, value, pnl };
};
