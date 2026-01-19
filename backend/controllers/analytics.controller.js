const pool = require("../config/db");
const mockDb = require("../services/mockDb.service");
const { calculate } = require("../services/pnl.service");

const useMockDb = process.env.USE_MOCK_DB === 'true';

exports.dashboard = async (req, res, next) => {
  try {
    let rows = [];
    
    if (useMockDb) {
      rows = await mockDb.getHoldings(req.user.user_id);
      // Add mock stock and broker data
      rows = rows.map(h => ({
        ...h,
        stock_name: 'Mock Stock',
        stock_symbol: 'MOCK',
        current_price: 100,
        broker_name: 'Mock Broker',
        broker_logo: ''
      }));
    } else {
      [rows] = await pool.query(
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
    }

    const enriched = rows.map(calculate);

    const totalValue = enriched.reduce((a, x) => a + (x.value || 0), 0);
    const totalCost = enriched.reduce((a, x) => a + (x.cost || 0), 0);
    const totalPnL = enriched.reduce((a, x) => a + (x.pnl || 0), 0);

    // distribution by broker (pie)
    const brokerMap = {};
    enriched.forEach(h => {
      const key = h.broker_name || "Unknown";
      brokerMap[key] = (brokerMap[key] || 0) + (h.value || 0);
    });
    const distribution = Object.entries(brokerMap).map(([label, value]) => ({ label, value }));

    // pnl by stock symbol (bar)
    const pnlBySymbol = enriched.map(h => ({
      symbol: h.stock_symbol,
      broker: h.broker_name,
      pnl: h.pnl
    }));

    res.json({
      summary: {
        totalValue,
        totalCost,
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
