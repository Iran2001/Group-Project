const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db'); // Assuming db.js exports the database connection

const router = express.Router();

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  // Static admin credentials
  if (username === 'Admin' && password === 'Admin@123') {
    return res.status(200).json({ message: 'Login successful', role: 'admin' });
  }

  // Check if the username exists in the database
  const getUserSql = 'SELECT * FROM students WHERE username = ?';
  db.query(getUserSql, [username], async (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      // Username not found
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    // Compare the password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incorrect password
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Authentication successful
    res.status(200).json({ message: 'Login successful', role: user.role || 'student' });
  });
});

module.exports = router;
