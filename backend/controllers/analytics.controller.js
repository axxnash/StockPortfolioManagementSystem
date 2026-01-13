const pool = require("../config/db");
const { calculate } = require("../services/pnl.service");

exports.dashboard = async (req, res, next) => {
  try {
    const { portfolio_id } = req.query;

    const [rows] = await pool.query(
      `SELECT h.* FROM holdings h
       JOIN portfolios p ON p.portfolio_id = h.portfolio_id
       WHERE p.user_id = ? AND h.portfolio_id = ?`,
      [req.user.user_id, portfolio_id]
    );

    const enriched = rows.map(calculate);

    const totalValue = enriched.reduce((a, x) => a + x.value, 0);
    const totalPnL = enriched.reduce((a, x) => a + x.pnl, 0);

    // PIE CHART: distribution by broker
    const brokerMap = {};
    enriched.forEach(h => {
      const key = h.broker_platform || "Unknown";
      brokerMap[key] = (brokerMap[key] || 0) + h.value;
    });

    const distribution = Object.entries(brokerMap).map(
      ([label, value]) => ({ label, value })
    );

    // BAR CHART: pnl by symbol
    const pnlBySymbol = enriched.map(h => ({
      symbol: h.symbol,
      pnl: h.pnl
    }));

    res.json({
      summary: {
        totalValue,
        totalPnL,
        holdingsCount: enriched.length
      },
      holdings: enriched,
      distribution,
      pnlBySymbol
    });
  } catch (err) {
    next(err);
  }
};
