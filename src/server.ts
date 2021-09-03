require('dotenv').config();
import express = require('express');
const app = express();
const cors = require('cors');
const accountRoutes = require('./routes/accounts');
const authRoutes = require('./routes/auth');
const MONGODB_URI = `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PW}@${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_HOST_PORT}/passwordManager?authSource=${process.env.MONGO_DB_AUTH_DB}`;
import mongoose = require('mongoose');
// const { MongoClient } = require('mongodb');

console.log(`URI used: ${MONGODB_URI}`)
// const client = new MongoClient(MONGODB_URI)


app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/', accountRoutes);
 
mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('MongoDB with mongoose Connected!!')
    app.listen(8080);
})
.catch((err: Error) => console.log('error connecting with Mongo: ', err.message));

