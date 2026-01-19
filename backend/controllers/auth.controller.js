const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mockDb = require("../services/mockDb.service");

const useMockDb = process.env.USE_MOCK_DB === 'true';

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    if (useMockDb) {
      // Use mock database
      try {
        const user_id = await mockDb.registerUser(name, email, password);
        const token = jwt.sign(
          { user_id, email },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );
        return res.json({ message: "Registered successfully", user_id, token });
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Email exists" });
        }
        throw err;
      }
    }

    // Use real database
    const [exist] = await pool.query(
      "SELECT user_id FROM `user` WHERE email=?",
      [email]
    );
    if (exist.length) return res.status(409).json({ error: "Email exists" });

    const hash = await bcrypt.hash(password, 10);
    const user_id = crypto.randomUUID();

    await pool.query(
      "INSERT INTO `user` (user_id,name,email,password,date_created) VALUES (?,?,?,?, CURDATE())",
      [user_id, name, email, hash]
    );

    // Generate JWT token for automatic login after registration
    const token = jwt.sign(
      { user_id: user_id, email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: "Registered successfully", user_id, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (useMockDb) {
      // Use mock database
      const users = await mockDb.getUserByEmail(email);
      if (!users.length) return res.status(401).json({ error: "Invalid login" });

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Invalid login" });

      const token = jwt.sign(
        { user_id: user.user_id, email },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.json({ message: "Login success", token });
    }

    // Use real database
    const [rows] = await pool.query(
      "SELECT * FROM `user` WHERE email=?",
      [email]
    );

    if (!rows.length) return res.status(401).json({ error: "Invalid login" });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ error: "Invalid login" });

    const token = jwt.sign(
      { user_id: rows[0].user_id, email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: "Login success", token });
  } catch (err) {
    next(err);
  }
};
