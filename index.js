const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const socket = require("socket.io");
const http = require("http");
const { routes } = require("./routes");

const { setIntervalAsync } = require("set-interval-async/dynamic");

const indexData = async () => {
  const timer = setIntervalAsync(async () => {
    console.log("Hello");
    console.log("Bye");
  }, 1000);
};

// indexData();

const app = express();

app.use(bodyParser.json({ limit: "100mb" }));
app.use(cors());

const server = http.createServer(app).listen(3001, () => {
  console.log("HTTP server listening on port 3001");
});

let io = socket.listen(server);
io.on("connection", (socket) => {
  socket.on("message", (data) => {
    console.log(data);
  });
  socket.on("disconnect", () => console.log("Client disconnected"));
});

routes(app, io);
