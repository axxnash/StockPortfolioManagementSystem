// mockPriceService.js

exports.getPrice = (symbol) => {
  const prices = {
    AAPL: 175.23,
    MSFT: 412.85,
    GOOGL: 153.40,
    AMZN: 168.92,
    TSLA: 238.15,
    NVDA: 612.50,
    META: 485.30,
    NFLX: 558.10,
    BABA: 74.85,
    ORCL: 118.60,
    CRM: 287.45,
    AMD: 162.90,
    INTC: 43.25,
    UBER: 68.70,
    SPOT: 298.40,
    PYPL: 61.55,
    ADBE: 573.20,
    CSCO: 51.80,
    IBM: 188.65,
    DIS: 96.30
  };

  // default price if symbol not found
  return prices[symbol] ?? 150;
};
