require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const router = require('./routes');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

//mongoDB
mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((e) => console.error('MongoDB fail', e));


app.use(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server on http://localhost:' + PORT));
