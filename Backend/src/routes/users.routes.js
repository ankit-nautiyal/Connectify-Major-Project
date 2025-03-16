import { Router } from "express";
import { addToUserHistory, getHistoryOfUser, login, register } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToUserHistory);
router.route("/get_all_activity").get(getHistoryOfUser);

export default router;