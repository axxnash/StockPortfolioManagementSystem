const pool = require("../config/db");
const { calculate } = require("../services/pnl.service");
const { toCsv } = require("../services/csv.service");

exports.exportCsv = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT up.portfolio_id, up.user_id, up.broker_id, up.stock_id,
            up.quantity, up.invested, up.date_created, up.date_edited,
            s.stock_name, s.stock_symbol, s.price AS current_price,
            b.broker_name, b.broker_logo
     FROM user_portfolio up
     JOIN stock s ON s.stock_id = up.stock_id
     JOIN broker b ON b.broker_id = up.broker_id
     WHERE up.user_id=?`,
    [req.user.user_id]
  );

  const csv = toCsv(rows.map(calculate));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=portfolio.csv");
  res.send(csv);
};
