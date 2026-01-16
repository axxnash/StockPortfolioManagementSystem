const pool = require("../config/db");

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT stock_id, stock_name, stock_symbol, price FROM stock ORDER BY stock_symbol ASC"
  );
  res.json(rows);
};
