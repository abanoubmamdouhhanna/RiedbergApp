import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from 'cors'
import http from "http";
import { Server } from "socket.io";
import initApp from "./src/app.router.js";

// Set directory dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "./config/.env") });
const app = express();
const port = process.env.PORT;
app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

initApp(app, express);

server.listen(port, () => {
  console.log(`Server is running on port.......${port}`);
});
