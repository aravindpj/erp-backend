
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

// Init Middleware
app.use(express.json({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

// Define Routes
app.use('/api/users', require('./routes/users'));

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})
