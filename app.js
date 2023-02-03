const express = require('express');
const userRouter = require('./api/users');
const app = express()
const dotenv = require('dotenv')

dotenv.config()
app.use(express.json())
app.use('/users', userRouter)

module.exports = app;
