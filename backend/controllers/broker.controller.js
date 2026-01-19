const pool = require("../config/db");

const useMockDb = process.env.USE_MOCK_DB === 'true';

exports.list = async (req, res) => {
  if (useMockDb) {
    // Return mock broker data
    return res.json([
      { broker_id: '1', broker_name: 'Interactive Brokers', broker_logo: '' },
      { broker_id: '2', broker_name: 'Moomoo', broker_logo: '' },
      { broker_id: '3', broker_name: 'Forex', broker_logo: '' },
      { broker_id: '4', broker_name: 'Charles Schwab', broker_logo: '' }
    ]);
  }

  const [rows] = await pool.query(
    "SELECT broker_id, broker_name, broker_logo FROM broker ORDER BY broker_name ASC"
  );
  res.json(rows);
};
