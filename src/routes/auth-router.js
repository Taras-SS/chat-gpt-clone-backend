import { Router } from "express";
import controllers from "../controllers/index.js";

const router = new Router();

router.post("/sign-up", controllers.AuthController.signUp);
router.post("/sign-in", controllers.AuthController.signIn);

export default router;
