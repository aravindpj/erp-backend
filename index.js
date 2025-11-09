
const express = require('express');
const path = require('path');
const connectDB = require('./config/db.config');
const responseHandler = require('./middleware/response.middleware');
const cors = require("cors")
require('dotenv').config();
const app = express();
app.use(cors({
  origin:"*"
}))
app.use(responseHandler)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use("/uploads",express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

// Define Routes
app.use('/api', require('./routes/main.route'));

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
})
