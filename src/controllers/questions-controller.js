import { OpenAIService } from "../services/index.js";
import Message from "../models/message.js";
import { jwtDecode } from "jwt-decode";
import { adminsMapper, clientsMapper } from "../utils/index.js";

export default class QuestionsController {
  constructor() {}

  static async askQuestion(req, res) {
    try {
      if (!req.body.clientSessionId) {
        return res
          .status(400)
          .json({ message: "clientSessionId was not provided" });
      }

      if (!req.body.question?.trim()) {
        return res.status(400).json({ message: "question was not provided" });
      }

      const chatGPTResponse = await OpenAIService.askQuestion(
        req.body.question,
      );

      const question = new Message({
        clientSessionId: req.body.clientSessionId,
        createdAt: new Date().getTime(),
        viewedByAdmin: false,
        viewedByUser: true,
        message: req.body.question,
      });
      const chatGPTMessage = new Message({
        clientSessionId: req.body.clientSessionId,
        createdAt: new Date().getTime(),
        viewedByAdmin: false,
        viewedByUser: true,
        message: JSON.stringify(chatGPTResponse),
      });
      await question.save();
      await chatGPTMessage.save();

      adminsMapper.map((admin) =>
        req.io.to(admin.socketId).emit("send-question", {
          question: req.body.question,
          answer: chatGPTResponse,
        }),
      );

      return res.status(200).json({ answers: chatGPTResponse });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async readMessages(req, res) {
    try {
      if (!req.body.clientSessionId) {
        return res.status(400).json({
          message: "clientSessionId was not provided",
        });
      }

      const decodedToken = jwtDecode(req.headers.authorization || "");
      const message = await Message.findOne({
        clientSessionId: req.body.clientSessionId,
      });

      if (!message) {
        return res.status(200).json({
          message: `There are no messages for user : ${req.body.clientSessionId}`,
        });
      }

      await Message.updateMany(
        {
          clientSessionId: req.body.clientSessionId,
        },
        {
          viewedByAdmin: decodedToken.isAdmin,
          viewedByUser: !decodedToken.isAdmin,
        },
      );
      return res
        .status(200)
        .json({ message: "Message has ben successfully updated" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getMessagesByClientId(req, res) {
    try {
      if (!req.body.clientSessionId) {
        return res
          .status(400)
          .json({ message: "clientSessionId was not provided" });
      }

      return Message.find({ clientSessionId: req.body.clientSessionId });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async respondToUser(req, res) {
    try {
      if (!req.body.clientSessionId) {
        return res
          .status(403)
          .json({ message: "clientSessionId was not provided" });
      }

      if (!req.body.answer) {
        return res.status(400).json({ message: "answer was not provided" });
      }

      const message = new Message({
        clientSessionId: req.body.clientSessionId,
        createdAt: new Date().getTime(),
        viewedByAdmin: true,
        viewedByUser: false,
        message: req.body.answer,
      });

      await message.save();

      const clientSocketId = clientsMapper.find(
        (user) => user.sessionId === req.body.clientSessionId,
      );
      if (clientSocketId) {
        req.io.to(clientSocketId).emit("send-response", message);
      }
      return res.status(201).json({ data: message });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getChats(req, res) {
    try {
      const chats = await Message.aggregate([
        {
          $group: { _id: "$clientSessionId", doc: { $first: "$$ROOT" } },
        },
      ]);
      return res.status(200).json({ data: chats });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}
