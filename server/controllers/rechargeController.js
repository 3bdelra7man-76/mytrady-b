const User = require('../models/User')

const rechargeCard = async (req, res) => {
  try {
    const { cardCode } = req.body;
    if (!cardCode) {
      return res.status(400).json({ message: 'Card code is required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Find the card by code
    const card = user.cards.find(c => c.code === cardCode);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    if (card.isCharged) {
      return res.status(400).json({ message: 'Card already charged' });
    }
    card.isCharged = true;
    user.points += card.points;
    await user.save();
    res.json({ message: 'Card charged successfully', points: user.points, card });
  } catch (error) {
    console.error('Error charging card:', error);
    res.status(500).json({ message: 'Error charging card' });
  }
};

module.exports = rechargeCard;
