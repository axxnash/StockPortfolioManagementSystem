exports.calculate = (row) => {
  const quantity = Number(row.quantity || 0);

  // invested = BUY PRICE PER SHARE
  const buyPrice = Number(row.invested || 0);

  const current = Number(row.current_price || row.price || 0);

  const cost = quantity * buyPrice;
  const value = quantity * current;
  const pnl = value - cost;
  const pnl_percent = cost > 0 ? (pnl / cost) * 100 : 0;

  return {
    ...row,
    current,
    buy_price: buyPrice, // optional: for clarity in frontend
    cost,
    value,
    pnl,
    pnl_percent
  };
};
