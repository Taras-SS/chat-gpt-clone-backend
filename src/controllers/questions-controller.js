import { OpenAIService } from "../services/index.js";
import Message from "../models/message.js";
import { jwtDecode } from "jwt-decode";
import { adminsMapper } from "../utils/index.js";

export default class QuestionsController {
  constructor() {}

  static async askQuestion(req, res) {
    try {
      if (!req.body.question?.trim()) {
        return res.status(400).json({ message: "Question was not added" });
      }

      const chatGPTResponse = await OpenAIService.askQuestion(
        req.body.question,
      );

      // const availableAdmin = adminsMapper.reduce((availableAdmin, current) => {
      //   if (
      //     availableAdmin &&
      //     current.activeUsersCount < availableAdmin.activeUsersCount
      //   ) {
      //     return current;
      //   }
      //
      //   return availableAdmin;
      // }, adminsMapper[0]);
      //
      // if (availableAdmin) {
      //   req.io
      //     .to(availableAdmin.socketId)
      //     .emit("send-question", req.body.question);
      // }

      return res.status(200).json({ answers: chatGPTResponse });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async changeMessageStatus(req, res) {
    try {
      if (!req.body.messageId) {
        return res.status(400).json({
          message: "messageId was not provided",
        });
      }

      const decodedToken = jwtDecode(req.headers.authorization || "");
      const message = await Message.findById(req.body.messageId);

      if (!message) {
        return res.status(400).json({
          message: `Message with ID: ${req.body.messageId} does not exist`,
        });
      }

      await Message.findByIdAndUpdate(req.body.messageId, {
        viewedByAdmin: decodedToken.isAdmin,
        viewedByUser: !decodedToken.isAdmin,
      });
      return res
        .status(200)
        .json({ message: "Message has ben successfully updated" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async getMessagesByAdminId(req, res) {
    try {
      if (!req.body.adminId) {
        return res.status(403).json({ message: "adminId was not provided" });
      }

      return Message.find({ adminId: req.body.adminId });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async respondToUser(req, res) {
    try {
      if (!req.body.adminId) {
        return res.status(400).json({ message: "adminId was not provided" });
      }

      if (!req.body.clientSocketId) {
        return res
          .status(403)
          .json({ message: "clientSocketId was not provided" });
      }

      if (!req.body.answer) {
        return res.status(400).json({ message: "answer was not provided" });
      }

      const message = new Message({
        clientSocketId: req.body.clientSocketId,
        adminId: req.body.adminId,
        createdAt: new Date().getTime(),
        viewedByAdmin: true,
        viewedByUser: false,
        message: req.body.answer,
      });

      await message.save();

      req.io.to(req.body.clientSocketId).emit("send-response", message);
      return res.status(201).json({ data: message });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}
