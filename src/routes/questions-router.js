import { Router } from "express";
import controllers from "../controllers/index.js";

const router = new Router();
router.post("/ask-question", controllers.QuestionsController.askQuestion);
router.post("/read-messages", controllers.QuestionsController.readMessages);
router.get(
  "/chat-history",
  controllers.QuestionsController.getMessagesByClientId,
);
router.post("/respond-to-user", controllers.QuestionsController.respondToUser);
router.get("/chats", controllers.QuestionsController.getChats);

export default router;
