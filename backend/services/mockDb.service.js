// Mock database service for testing without MySQL
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// In-memory storage
const users = new Map();
const portfolios = new Map();
const holdings = new Map();

// Helper to generate mock responses in mysql2 format
const mockResult = (data) => [data, null];

const mockDbService = {
  // User operations
  async registerUser(name, email, password) {
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      const err = new Error('Email already exists');
      err.code = 'ER_DUP_ENTRY';
      throw err;
    }

    const user_id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    
    users.set(user_id, {
      user_id,
      name,
      email,
      password: hash,
      date_created: new Date().toISOString().split('T')[0]
    });

    return user_id;
  },

  async getUserByEmail(email) {
    const user = Array.from(users.values()).find(u => u.email === email);
    return user ? [user] : [];
  },

  async getUserById(user_id) {
    const user = users.get(user_id);
    return user ? [user] : [];
  },

  async updateUser(user_id, name, email, newPassword) {
    const user = users.get(user_id);
    if (!user) return false;
    
    user.name = name;
    user.email = email;
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    users.set(user_id, user);
    return true;
  },

  // Portfolio operations
  async createPortfolio(user_id, name) {
    const portfolio_id = Date.now();
    portfolios.set(portfolio_id, {
      portfolio_id,
      user_id,
      name,
      created_at: new Date().toISOString()
    });
    return portfolio_id;
  },

  async getPortfolios(user_id) {
    return Array.from(portfolios.values()).filter(p => p.user_id === user_id);
  },

  async deletePortfolio(portfolio_id, user_id) {
    const portfolio = portfolios.get(portfolio_id);
    if (portfolio && portfolio.user_id === user_id) {
      portfolios.delete(portfolio_id);
      return true;
    }
    return false;
  },

  // Holdings operations
  async addHolding(portfolio_id, user_id, broker_id, stock_id, quantity, invested) {
    const holding_id = Date.now();
    holdings.set(holding_id, {
      holding_id,
      portfolio_id,
      user_id,
      broker_id,
      stock_id,
      quantity,
      invested,
      date_created: new Date().toISOString(),
      date_edited: new Date().toISOString()
    });
    return holding_id;
  },

  async getHoldings(user_id) {
    return Array.from(holdings.values()).filter(h => h.user_id === user_id);
  },

  async updateHolding(holding_id, user_id, broker_id, stock_id, quantity, invested) {
    const holding = holdings.get(holding_id);
    if (holding && holding.user_id === user_id) {
      holdings.set(holding_id, {
        ...holding,
        broker_id,
        stock_id,
        quantity,
        invested,
        date_edited: new Date().toISOString()
      });
      return true;
    }
    return false;
  },

  async deleteHolding(holding_id, user_id) {
    const holding = holdings.get(holding_id);
    if (holding && holding.user_id === user_id) {
      holdings.delete(holding_id);
      return true;
    }
    return false;
  }
};

module.exports = mockDbService;
