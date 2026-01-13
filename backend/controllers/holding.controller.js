const pool = require("../config/db");

exports.add = async (req, res) => {
  const { portfolio_id, symbol, stock_name, broker_platform, quantity, buy_price, buy_date } = req.body;

  const [r] = await pool.query(
    `INSERT INTO holdings
     (portfolio_id,symbol,stock_name,broker_platform,quantity,buy_price,buy_date)
     VALUES (?,?,?,?,?,?,?)`,
    [portfolio_id, symbol, stock_name, broker_platform, quantity, buy_price, buy_date]
  );
  res.json({ holding_id: r.insertId });
};

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT h.* FROM holdings h
     JOIN portfolios p ON p.portfolio_id=h.portfolio_id
     WHERE p.user_id=? AND h.portfolio_id=?`,
    [req.user.user_id, req.query.portfolio_id]
  );
  res.json(rows);
};

exports.update = async (req, res) => {
  await pool.query(
    "UPDATE holdings SET quantity=?, buy_price=? WHERE holding_id=?",
    [req.body.quantity, req.body.buy_price, req.params.id]
  );
  res.json({ message: "Updated" });
};

exports.remove = async (req, res) => {
  await pool.query(
    "DELETE FROM holdings WHERE holding_id=?",
    [req.params.id]
  );
  res.json({ message: "Deleted" });
};
