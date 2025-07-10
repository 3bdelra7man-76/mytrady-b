const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    
    if (await User.findOne({ phone })) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, password: hashedPassword });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1d' 
    });

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      points: user.points,
      cardpoints: user.cardpoints,
      scrollpoints: user.scrollpoints,
      cards: user.cards,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};