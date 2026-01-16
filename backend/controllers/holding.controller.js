const pool = require("../config/db");
const crypto = require("crypto");

exports.add = async (req, res) => {
  const { broker_id, stock_id, quantity, invested } = req.body;

  if (!broker_id || !stock_id)
    return res.status(400).json({ error: "broker_id and stock_id required" });

  const q = Number(quantity);
  const inv = Number(invested);

  if (!Number.isFinite(q) || q <= 0)
    return res.status(400).json({ error: "quantity must be > 0" });

  if (!Number.isFinite(inv) || inv < 0)
    return res.status(400).json({ error: "invested must be >= 0" });

  const portfolio_id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO user_portfolio
     (portfolio_id, user_id, broker_id, stock_id, quantity, invested, date_created, date_edited)
     VALUES (?,?,?,?,?,?, CURDATE(), CURDATE())`,
    [portfolio_id, req.user.user_id, broker_id, stock_id, q, inv]
  );

  res.json({ portfolio_id });
};

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT up.portfolio_id, up.user_id, up.broker_id, up.stock_id,
            up.quantity, up.invested, up.date_created, up.date_edited,
            s.stock_name, s.stock_symbol, s.price AS current_price,
            b.broker_name, b.broker_logo
     FROM user_portfolio up
     JOIN stock s ON s.stock_id = up.stock_id
     JOIN broker b ON b.broker_id = up.broker_id
     WHERE up.user_id=?
     ORDER BY up.date_created DESC`,
    [req.user.user_id]
  );

  res.json(rows);
};

exports.update = async (req, res) => {
  const { broker_id, stock_id, quantity, invested } = req.body;

  if (!broker_id || !stock_id)
    return res.status(400).json({ error: "broker_id and stock_id required" });

  const q = Number(quantity);
  const inv = Number(invested);

  if (!Number.isFinite(q) || q <= 0)
    return res.status(400).json({ error: "quantity must be > 0" });

  if (!Number.isFinite(inv) || inv < 0)
    return res.status(400).json({ error: "invested must be >= 0" });

  await pool.query(
    `UPDATE user_portfolio
     SET broker_id=?, stock_id=?, quantity=?, invested=?, date_edited=CURDATE()
     WHERE portfolio_id=? AND user_id=?`,
    [broker_id, stock_id, q, inv, req.params.id, req.user.user_id]
  );

  res.json({ message: "Updated" });
};

exports.remove = async (req, res) => {
  await pool.query(
    "DELETE FROM user_portfolio WHERE portfolio_id=? AND user_id=?",
    [req.params.id, req.user.user_id]
  );
  res.json({ message: "Deleted" });
};
