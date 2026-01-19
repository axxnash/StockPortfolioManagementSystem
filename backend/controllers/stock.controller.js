const pool = require("../config/db");

const useMockDb = process.env.USE_MOCK_DB === 'true';

exports.list = async (req, res) => {
  if (useMockDb) {
    // Return mock stock data
    return res.json([
      { stock_id: '1', stock_name: 'Apple Inc.', stock_symbol: 'AAPL', price: 175.23 },
      { stock_id: '2', stock_name: 'Microsoft Corp', stock_symbol: 'MSFT', price: 412.85 },
      { stock_id: '3', stock_name: 'Google LLC', stock_symbol: 'GOOGL', price: 153.40 },
      { stock_id: '4', stock_name: 'Amazon Inc.', stock_symbol: 'AMZN', price: 168.92 },
      { stock_id: '5', stock_name: 'Tesla Inc.', stock_symbol: 'TSLA', price: 238.15 },
      { stock_id: '6', stock_name: 'NVIDIA Corp', stock_symbol: 'NVDA', price: 612.50 }
    ]);
  }

  const [rows] = await pool.query(
    "SELECT stock_id, stock_name, stock_symbol, price FROM stock ORDER BY stock_symbol ASC"
  );
  res.json(rows);
};
