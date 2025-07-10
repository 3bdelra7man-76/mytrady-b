const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  cardpoints: { type: Number, default: 0 },
  scrollpoints: { type: Number, default: 0 },
  cards: [{
    code: String,
    points: Number,
    receivedDate: Date,
    source: String,
    isCharged: Boolean
  }]
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)