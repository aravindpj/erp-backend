const express = require("express");
const http = require("http");
const path = require("path");
const connectDB = require("./config/db.config");
const responseHandler = require("./middleware/response.middleware");
const {initSocket} = require("./config/socket.config")
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(responseHandler);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const server = http.createServer(app);
//socket connection
initSocket(server)
// Connect Database
connectDB();

const port = parseInt(process.env.PORT) || process.argv[3] || 8080;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

// Define Routes
app.use("/api", require("./routes/main.route"));

server.listen(port,process.env.IP || "localhost", () => {
  console.log(`Listening on http://${process.env.IP || "localhost"}:${port}`);
});
