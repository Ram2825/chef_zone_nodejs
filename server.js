import express from 'express';
import http from 'http';
import bodyParser from "body-parser";
import dotenv from "dotenv";
const app = express();
import cors from 'cors';
import autenticationRoute from "./routes/authenticationRoutes.js"
import jobRoute from "./routes/jobRoutes.js"
import { db } from './config/dbConfig.js';

dotenv.config();
app.use(cors());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

var corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    if (req.method === "OPTIONS") {
        res.header("ACCESS-CONTROL-ALLOW-METHODS", "PUT, POST, PATCH, GET, DELETE");
        return res.status(200).json({});
    }
    next();
});

// Contact us endpoint
app.post('/contactus', (req, res) => {
    const { name, email, message } = req.body;
    const sql = 'INSERT INTO ContactUs (name, email_id, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error('Error inserting into ContactUs table:', err);
            res.status(500).json({ success: false, message: 'Failed to insert into ContactUs table' });
            return;
        }
        console.log('Inserted into ContactUs table:', result);
        res.status(200).json({ success: true, message: 'Contact details inserted successfully' });
    });
});

// Contact us endpoint
app.post('/jobapplied', (req, res) => {
    const { name, email, jobTitle } = req.body;
    const sql = 'INSERT INTO Applications (name, email_id,job_title) VALUES (?, ?, ?)';
    db.query(sql, [name, email, jobTitle], (err, result) => {
        if (err) {
            console.error('Error inserting into ContactUs table:', err);
            res.status(500).json({ success: false, message: 'Failed to insert into ContactUs table' });
            return;
        }
        console.log('Inserted into Application table:', result);
        res.status(200).json({ success: true, message: 'Job applied successfully' });
    });
});

app.get('/allapplications', (req, res) => {
    const sql = 'SELECT * FROM Applications';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error retrieving applications:', err);
            res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
            return;
        }
        console.log('Retrieved applications:', result);
        res.status(200).json({ success: true, data: result });
    });
});



app.use("/ess/autenticate", autenticationRoute);
app.use("/ess/jobs", jobRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server connected to ${PORT}`);
});
