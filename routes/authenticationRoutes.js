import express from "express";
import { LoginAppCtrl, createUserCtrl, getAllChefsCtrl } from '../controllers/authenticationController.js';
import jwt from 'jsonwebtoken';


const router = express.Router();

router.post("/login", LoginAppCtrl);
router.post("/signup", createUserCtrl);
router.get('/chefs', getAllChefsCtrl);

export default router;
