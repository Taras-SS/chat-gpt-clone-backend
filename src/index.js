import express from "express";
import { Server as IoServer } from "socket.io";
import routes from "./routes/index.js";
import bodyParser from "body-parser";
import { config } from "dotenv";
import morgan from "morgan";
import startServer from "./start.js";
import cors from "cors";
import { adminsMapper, clientsMapper } from "./utils/index.js";

config();

const app = express();
const server = await startServer(app);
const io = new IoServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(function (req, res, next) {
  req.io = io;
  next();
});
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use("/api", routes.questionRouters);
app.use("/api/auth", routes.authRouter);

io.on("connection", function (socket) {
  console.log(socket.id);
  const isAdminUser = socket.handshake.query.isAdmin === "true";
  console.log(isAdminUser, " isAdminUser");
  if (isAdminUser) {
    adminsMapper.push({ socketId: socket.id });

    socket.on("disconnect", () => {
      const index = adminsMapper.findIndex(
        (admin) => admin.socketId === socket.id,
      );

      adminsMapper.splice(index, 1);
      console.log("An admin has left the chat");
    });
  } else {
    socket.on("send-session-id", ({ sessionId }) => {
      console.log(sessionId);
      const alreadyExists = clientsMapper.find(
        (user) => user.socketId === socket.id,
      );
      if (alreadyExists) {
        return;
      }

      console.log("session id received");
      clientsMapper.push({ socketId: socket.id, sessionId });
    });

    socket.on("disconnect", () => {
      const index = clientsMapper.findIndex(
        (user) => user.socketId === socket.id,
      );

      clientsMapper.splice(index, 1);
      console.log("A client has left the chat");
    });

    socket.on("connect-with-gpt", (res) => {
      if (!res.sessionId) {
        return;
      }

      const client = clientsMapper.find(
        (user) => user.sessionId === res.sessionId,
      );

      if (client) {
        socket.to(client.socketId).emit("connect-with-gpt", {});
      }
    });
  }

  console.log("A new socket has connected");
});
