const User = require('../models/User');
const Transaction = require('../models/Transaction');

// POST /api/transfer
exports.transferPoints = async (req, res) => {
    try {
        const { phone, amount, password } = req.body;
        const senderId = req.user.id;

        if (!phone || !amount || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive.' });
        }

        // Find sender
        const sender = await User.findById(senderId);
        if (!sender) return res.status(404).json({ message: 'Sender not found.' });

        // Check password
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(password, sender.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password.' });

        // Check points
        if (sender.points < amount) {
            return res.status(400).json({ message: 'Insufficient points.' });
        }

        // Find receiver
        const receiver = await User.findOne({ phone });
        if (!receiver) return res.status(404).json({ message: 'Receiver not found.' });
        if (receiver.id === senderId) return res.status(400).json({ message: 'Cannot send points to yourself.' });

        // Transfer points
        let cardpointsToUse = Math.min(sender.cardpoints, amount);
        let pointsToUse = amount - cardpointsToUse;
        sender.cardpoints -= cardpointsToUse;
        sender.points -= amount;
        receiver.points += Number(amount);
        
        // Create transaction record
        await Transaction.create({
            sender: senderId,
            receiver: receiver._id,
            amount: amount,
            type: 'transfer'
        });

        await sender.save();
        await receiver.save();

        res.json({ message: 'Points transferred successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};
