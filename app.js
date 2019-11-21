const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const accountRoutes = require('./routes/accounts');
const MONGODB_URI = '';
const mongoose = require('mongoose');
//Accounts route
//  GET, POST, PUT, DELETE

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', accountRoutes);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    app.listen(8080);
})
.catch(err => console.log('error connecting with mongoose: ', err));

