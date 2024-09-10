const { Server } = require("socket.io");
const express = require("express");
const app = express();
const port = process.env.port || 8000;
const expressServer = app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})
const io = new Server(expressServer, { cors: true });



const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Connected to new room");
  socket.on("room:join", (data) => {
    console.log("Room joined successfully");
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket?.id);
    socketIdToEmailMap.set(socket?.id, email);
    // To Let the first member of the created room know about the newly added member.
    io.to(room).emit("room:joined", { email, id: socket.id });
    socket.join(room);
    // this is needed such that the user can navigate to room screen
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
