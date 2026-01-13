const pool = require("../config/db");
const { calculate } = require("../services/pnl.service");
const { toCsv } = require("../services/csv.service");

exports.exportCsv = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT h.* FROM holdings h
     JOIN portfolios p ON p.portfolio_id=h.portfolio_id
     WHERE p.user_id=? AND h.portfolio_id=?`,
    [req.user.user_id, req.query.portfolio_id]
  );

  const csv = toCsv(rows.map(calculate));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=portfolio.csv");
  res.send(csv);
};
