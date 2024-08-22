import express from "express";
const app = express();

import Jwt from 'jsonwebtoken';

import { loginMdl, createUserMdl ,getAllChefsMdl, getUserByIdMdl, updateUserMdl } from '../models/authenticationModel.js';


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

export const createUserCtrl = (req, res) => {
    const userData = req.body;

    createUserMdl(userData, (err, results) => {
        if (err) {
            if (err.message === "Email already exists") {
                res.status(400).json({ status: 400, message: "Email already exists" });
            } else if (err.message === "Username already exists") {
                res.status(400).json({ status: 400, message: "Username already exists" });
            } else {
                res.status(500).json({ status: 500, message: "Internal server error" });
            }
        } else {
            res.status(201).json({ status: 201, message: "User registered successfully" });
        }
    });
};

export const getAllChefsCtrl = (req, res) => {
    getAllChefsMdl((err, results) => {
        if (err) {
            console.error("Error fetching chefs:", err);
            res.status(500).json({ status: 500, message: "An error occurred while fetching chefs." });
        } else {
            res.status(200).json({ status: 200, message: "Chefs fetched successfully", results });
        }
    });
};

// New Controller for Getting a User by ID
export const getUserByIdCtrl = (req, res) => {
    const userId = req.params.id; // Assuming the user ID is passed as a URL parameter

    getUserByIdMdl(userId, (err, results) => {
        if (err) {
            console.error("Error fetching user by ID:", err);
            res.status(500).json({ status: 500, message: "An error occurred while fetching the user." });
        } else if (results.length === 0) {
            res.status(404).json({ status: 404, message: "User not found." });
        } else {
            res.status(200).json({ status: 200, message: "User fetched successfully", user: results[0] });
        }
    });
};

// Update User Controller
export const updateUserCtrl = (req, res) => {
    const userId = req.params.id; // Assuming the user ID is passed as a URL parameter
    const userData = req.body; // The updated user data

    updateUserMdl(userId, userData, (err, results) => {
        if (err) {
            console.error("Error updating user:", err);
            res.status(500).json({ status: 500, message: "An error occurred while updating the user." });
        } else {
            res.status(200).json({ status: 200, message: "User updated successfully" });
        }
    });
};