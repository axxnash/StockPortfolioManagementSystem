const pool = require("../config/db");

exports.create = async (req, res) => {
  const { name } = req.body;
  const [r] = await pool.query(
    "INSERT INTO portfolios (user_id,name) VALUES (?,?)",
    [req.user.user_id, name]
  );
  res.json({ portfolio_id: r.insertId });
};

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM portfolios WHERE user_id=?",
    [req.user.user_id]
  );
  res.json(rows);
};

exports.remove = async (req, res) => {
  await pool.query(
    "DELETE FROM portfolios WHERE portfolio_id=? AND user_id=?",
    [req.params.id, req.user.user_id]
  );
  res.json({ message: "Deleted" });
};
