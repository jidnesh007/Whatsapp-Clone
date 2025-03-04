const express = require("express");
const app = express();
const http = require("http").createServer(app);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

// Serve static files from the 'public' directory
app.use(express.static(__dirname + "/public"));

// Serve index.html at the root URL
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Serve video.html at /video route
app.get("/video", (req, res) => {
  res.sendFile(__dirname + "/video.html");
});

// Socket.io setup
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log("connected...");

  // Broadcast messages to all other clients
  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });
});
