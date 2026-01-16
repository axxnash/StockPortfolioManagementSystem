const pool = require("../config/db");

exports.list = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT broker_id, broker_name, broker_logo FROM broker ORDER BY broker_name ASC"
  );
  res.json(rows);
};
