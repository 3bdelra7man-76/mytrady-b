const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getUserTransactions = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        
        // Find all transactions where user is either sender or receiver
        const transactions = await Transaction.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
        .populate('sender', 'name phone')
        .populate('receiver', 'name phone')
        .sort({ createdAt: -1 }); // Most recent first

        // Format transactions for the client
        const formattedTransactions = transactions
            .filter(t => t.sender && t.receiver)
            .map(t => ({
                type: t.sender._id.toString() === userId ? 'sent' : 'received',
                otherParty: t.sender._id.toString() === userId 
                    ? { name: t.receiver.name, phone: t.receiver.phone }
                    : { name: t.sender.name, phone: t.sender.phone },
                amount: t.amount,
                date: t.createdAt
            }));

        res.json(formattedTransactions);
    } catch (err) {
        console.error('History API error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};
