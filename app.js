require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const authRoutes = require('./routes/authRoutes')
const cardRoutes = require('./routes/cardRoutes')
const transferRoutes = require('./routes/transferRoutes')
const profileRoutes = require('./routes/profileRoutes')
const historyRoutes = require('./routes/historyRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '..', 'public')))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err))

app.use('/api/auth', authRoutes)
app.use('/api/cards', cardRoutes)
app.use('/api/transfer', transferRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/history', historyRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
