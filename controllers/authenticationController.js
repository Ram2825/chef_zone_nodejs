import express from "express";
const app = express();

import Jwt from 'jsonwebtoken';

import { loginMdl } from '../models/authenticationModel.js'


export const LoginAppCtrl = function (req, res) {
    var data = req.body;
    loginMdl(data, function (err, results) {
        try {
            if (err) {
                res.send({ status: 400, message: "Not able to process the request, please try again" });
                return;
            }
            if (results.length <= 0) {
                res.send({ status: 404, message: "Email/Mobile number not exist" });
            } else if (results.length > 0) {
                const validPass = (
                    req.body.Password == results[0].password
                )

                if (validPass) {

                    var SecretKey = process.env.SecretKey

                    let payload = {
                        subject: req.body.userEmail
                    };
                    let token = Jwt.sign(payload, SecretKey, { expiresIn: "3h" });

                    res.send({
                        status: 200, message: "login Successful", results, token: token
                    });
                    // }
                } else {
                    res.send({ status: 400, message: "Invalid password" })
                }
            }
        } catch (err) {
            res.send({ status: 500, message: "Internal server error" })
        }
    });
};
