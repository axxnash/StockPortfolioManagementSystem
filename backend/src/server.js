require("dotenv").config();
const app = require("./app");
const pool = require("../config/db");

const PORT = process.env.PORT || 5000;

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✓ Database connected successfully");
    return true;
  } catch (err) {
    console.warn(`⚠ Database connection failed: ${err.message}`);
    if (process.env.USE_MOCK_DB === 'true') {
      console.log("✓ Running in mock database mode");
    } else {
      console.error("✗ Database connection required but failed. Set USE_MOCK_DB=true to use mock data.");
    }
    return false;
  }
}

const server = app.listen(PORT, async () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
  await testDatabaseConnection();
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
