const pool = require("../config/db");
const bcrypt = require("bcrypt");
const mockDb = require("../services/mockDb.service");

const useMockDb = process.env.USE_MOCK_DB === 'true';

exports.getProfile = async (req, res) => {
  try {
    if (useMockDb) {
      const users = await mockDb.getUserById(req.user.user_id);
      if (!users.length) return res.status(404).json({ error: "User not found" });
      const user = users[0];
      return res.json({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        date_created: user.date_created
      });
    }

    const [rows] = await pool.query(
      "SELECT user_id, name, email, date_created FROM `user` WHERE user_id=?",
      [req.user.user_id]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    if (useMockDb) {
      const users = await mockDb.getUserById(req.user.user_id);
      if (!users.length) return res.status(404).json({ error: "User not found" });
      const user = users[0];

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Current password required" });
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
          return res.status(401).json({ error: "Current password is incorrect" });
        }
      }

      await mockDb.updateUser(req.user.user_id, name, email, newPassword);
      return res.json({ message: "Profile updated successfully" });
    }

    // Get current user data
    const [rows] = await pool.query(
      "SELECT * FROM `user` WHERE user_id=?",
      [req.user.user_id]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password required" });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE `user` SET name=?, email=?, password=? WHERE user_id=?",
        [name, email, hash, req.user.user_id]
      );
    } else {
      await pool.query(
        "UPDATE `user` SET name=?, email=? WHERE user_id=?",
        [name, email, req.user.user_id]
      );
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
