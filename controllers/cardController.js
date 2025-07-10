const User = require('../models/User')

function generateCardCode() {
  return 'MT-' + Math.random().toString(36).substr(2, 8).toUpperCase()
}

const generateDailyCard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const now = new Date()
    const lastCard = user.cards
      .filter(c => c.source === 'daily')
      .sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate))[0]

    const alreadyClaimedToday =
      lastCard &&
      new Date(lastCard.receivedDate).toDateString() === now.toDateString()

    if (alreadyClaimedToday) {
      return res.status(400).json({ message: "Already claimed today's card" })
    }

    const card = {
      code: generateCardCode(),
      points: 1,
      receivedDate: now,
      source: 'daily',
      isCharged: false,
    }

    user.cards.push(card)
    await user.save()

    res.json({ 
      card
    })
  } catch (error) {
    console.error('Error generating daily card:', error)
    res.status(500).json({ message: 'Error generating daily card' })
  }
}

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
    const card = user.cards.find(c => c.code === cardCode);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    if (card.isCharged) {
      return res.status(400).json({ message: 'Card already charged' });
    }
    card.isCharged = true;
    user.points += card.points;
    // Update cardpoints by recalculating total charged card points
    user.cardpoints = user.cards.reduce((total, c) => 
      total + ((c === card ? true : c.isCharged) ? c.points : 0), 0);
    await user.save();
    res.json({ message: 'Card charged successfully', points: user.points, card });
  } catch (error) {
    console.error('Error charging card:', error);
    res.status(500).json({ message: 'Error charging card' });
  }
}

const getUserCards = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ 
      cards: user.cards,
      totalPoints: user.points,
      cardpoints: user.cardpoints
    })
  } catch (error) {
    console.error('Error fetching user cards:', error)
    res.status(500).json({ message: 'Error fetching user cards' })
  }
}

module.exports = {
  generateDailyCard,
  getUserCards,
  rechargeCard
}
