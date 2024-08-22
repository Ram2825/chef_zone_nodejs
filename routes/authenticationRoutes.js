import express from "express";
import { LoginAppCtrl, createUserCtrl, getAllChefsCtrl, getUserByIdCtrl, updateUserCtrl } from '../controllers/authenticationController.js';


const router = express.Router();

router.post("/login", LoginAppCtrl);
router.post("/signup", createUserCtrl);
router.get('/chefs', getAllChefsCtrl);
router.get('/user/:id', getUserByIdCtrl);
router.put('/user/:id', updateUserCtrl);

export default router;
