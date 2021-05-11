require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const accountRoutes = require('./routes/accounts');
const authRoutes = require('./routes/auth');
const MONGODB_URI = `mongodb+srv://GLCorey:${process.env.MONGO_DB_PW}@cluster0-hdloo.mongodb.net/services?retryWrites=true&w=majority`;
const mongoose = require('mongoose');

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
.catch(err => console.log('error connecting with mongoose: ', err));

