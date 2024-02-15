import { Router } from "express";
import controllers from "../controllers/index.js";

const router = new Router();
router.post("/ask-question", controllers.QuestionsController.askQuestion);
router.post(
  "/read-message",
  controllers.QuestionsController.changeMessageStatus,
);
router.get("/messages", controllers.QuestionsController.getMessagesByAdminId);
router.post("/respond-to-user", controllers.QuestionsController.respondToUser);

export default router;
