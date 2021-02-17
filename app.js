require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const accountRoutes = require('./routes/accounts');
const authRoutes = require('./routes/auth');
const MONGODB_URI = `mongodb+srv://GLCorey:${process.env.MONGO_DB_PW}@cluster0-hdloo.mongodb.net/services?retryWrites=true&w=majority`;
const mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(cors());
//Code below does the same thing that the above use(cors()) call does
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

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

