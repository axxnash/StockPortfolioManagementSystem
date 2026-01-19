const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/auth.routes");
const portfolioRoutes = require("../routes/portfolio.routes");
const holdingRoutes = require("../routes/holding.routes");
const analyticsRoutes = require("../routes/analytics.routes");
const exportRoutes = require("../routes/export.routes");
const testRoutes = require("../routes/test.routes");
const stockRoutes = require("../routes/stock.routes");
const brokerRoutes = require("../routes/broker.routes");
const userRoutes = require("../routes/user.routes");

const errorHandler = require("../middleware/errorHandler");

const app = express();

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/holdings", holdingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/brokers", brokerRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);

module.exports = app;
