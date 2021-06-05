require('dotenv').config();
import express = require('express');
const app = express();
const cors = require('cors');
const accountRoutes = require('./routes/accounts');
const authRoutes = require('./routes/auth');
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PW}@${process.env.MONGO_DB_CLUSTER}.mongodb.net/services?retryWrites=true&w=majority`;
import mongoose = require('mongoose');

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/', accountRoutes);
 
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected!!')
    app.listen(8080);
})
.catch((err: Error) => console.log('error connecting with mongoose: ', err));

