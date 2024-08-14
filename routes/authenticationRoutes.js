import express from "express";
import { LoginAppCtrl, createUserCtrl } from '../controllers/authenticationController.js';
import jwt from 'jsonwebtoken';


const router = express.Router();

router.post("/login", LoginAppCtrl);
router.post("/signup", createUserCtrl);

export default router;
