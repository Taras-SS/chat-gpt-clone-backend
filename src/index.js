import express from "express";
import { Server as IoServer } from "socket.io";
import routes from "./routes/index.js";
import bodyParser from "body-parser";
import { config } from "dotenv";
import morgan from "morgan";
import startServer from "./start.js";
import cors from "cors";
import { adminsMapper } from "./utils/index.js";

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
  const isAdminUser =
    socket.handshake.headers.origin === process.env.ADMIN_SOCKET_CONNECTION_URL;
  if (isAdminUser) {
    adminsMapper.push({ socketId: socket.client.id, activeUsersCount: 0 });
  }

  console.log("Client user connected");
});
