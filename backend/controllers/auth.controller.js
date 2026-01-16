const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

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

  res.json({ message: "Registered", user_id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

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
};
