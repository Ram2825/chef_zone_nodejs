import express from "express";

import { LoginAppCtrl} from '../controllers/authenticationController.js'

const route = express.Router()

route.post("/login", LoginAppCtrl)

export default route;