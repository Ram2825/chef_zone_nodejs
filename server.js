import express from 'express';
import bodyParser from "body-parser";
import dotenv from "dotenv";
const app = express();
import cors from 'cors';
import autenticationRoute from "./routes/authenticationRoutes.js"
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

app.post('/bookings', (req, res) => {
    const { user_id, chef_id, booking_date, booking_time, additional_notes } = req.body;
    
    // SQL query to insert a new booking record
    const sql = `
        INSERT INTO booking (user_id, chef_id, booking_date, booking_time, additional_notes)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    // Execute the query
    db.query(sql, [user_id, chef_id, booking_date, booking_time, additional_notes], (err, result) => {
        if (err) {
            console.error('Error inserting into bookings table:', err);
            res.status(500).json({ status: 500, message: 'Failed to insert into bookings table' });
            return;
        }
        console.log('Inserted into bookings table:', result);
        res.status(200).json({ status: 200, message: 'Booking record inserted successfully' });
    });
});

// API to get bookings by user_id
app.get('/bookings/user/:user_id', (req, res) => {
    const userId = req.params.user_id;

    const query = `SELECT 
    booking.*, 
    CONCAT(user.first_name, ' ', user.last_name) AS chef_name
FROM 
    booking
JOIN 
    user ON booking.chef_id = user.user_id
WHERE 
    booking.user_id = ?;
`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        res.json({ status: 200, results });
    });
});

// API to get bookings by chef_id
app.get('/bookings/chef/:chef_id', (req, res) => {
    const chefId = req.params.chef_id;

    const query = 'SELECT * FROM booking WHERE chef_id = ?';
    db.query(query, [chefId], (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        res.json({ status: 200, results });
    });
});

// Update booking status
app.patch('/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ status: 400, message: 'Status is required' });
    }

    // SQL query to update the status of a booking record
    const sql = `
        UPDATE booking
        SET status = ?
        WHERE id = ?
    `;
    
    // Execute the query
    db.query(sql, [status, bookingId], (err, result) => {
        if (err) {
            console.error('Error updating booking status:', err);
            return res.status(500).json({ status: 500, message: 'Failed to update booking status' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        console.log('Updated booking status:', result);
        res.status(200).json({ status: 200, message: 'Booking status updated successfully' });
    });
});

app.use("/chef_zone/autenticate", autenticationRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server connected to ${PORT}`);
});
