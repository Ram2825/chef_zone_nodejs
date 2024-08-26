import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import autenticationRoute from './routes/authenticationRoutes.js';
import { db } from './config/dbConfig.js';

dotenv.config();

const app = express();

// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // append the file extension
    }
});

const upload = multer({ storage: storage });

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

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

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
// Update booking status
app.post('/bookings/:booking_id/status', (req, res) => {
    const { booking_id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ status: 400, message: 'Status is required' });
    }

    // SQL query to update booking status
    const query = `
        UPDATE booking
        SET status = ?
        WHERE booking_id = ?
    `;
    console.log(query)

    db.query(query, [status, booking_id], (err, results) => {
        if (err) {
            console.error('Error updating booking status:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }

        if (results.affectedRows > 0) {
            res.status(200).json({ status: 200, message: 'Booking status updated successfully' });
        } else {
            res.status(404).json({ status: 404, message: 'Booking not found' });
        }
    });
});

// API to get bookings by chef_id
app.get('/bookings/chef/:chef_id', (req, res) => {
    const chefId = req.params.chef_id;

    // Query to fetch bookings with additional details of the user
    const query = `
        SELECT 
            booking.*, 
            CONCAT(user.first_name, ' ', user.last_name) AS user_name,
            user.email AS user_email,
            user.mobile_no AS user_mobile
        FROM 
            booking
        JOIN 
            user ON booking.user_id = user.user_id
        WHERE 
            booking.chef_id = ?;
    `;

    db.query(query, [chefId], (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        res.json({ status: 200, results });
    });
});

// // API to get bookings by chef_id
// app.get('/bookings/chef/:chef_id', (req, res) => {
//     const chefId = req.params.chef_id;

//     const query = 'SELECT * FROM booking WHERE chef_id = ?';
//     db.query(query, [chefId], (err, results) => {
//         if (err) {
//             console.error('Error fetching bookings:', err);
//             return res.status(500).json({ status: 500, message: 'Internal Server Error' });
//         }
//         res.json({ status: 200, results });
//     });
// });


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

// API to get all reviews by chef_id
app.get('/chef_zone/reviews/:chef_id', (req, res) => {
    const chef_id = req.params.chef_id;

    // SQL query to get all reviews by chef_id
    const sql = `
        SELECT r.review_id, r.rating, r.review_text, r.created_at, u.first_name, u.last_name
        FROM reviews r
        JOIN user u ON r.user_id = u.user_id
        WHERE r.chef_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [chef_id], (err, results) => {
        if (err) {
            console.error('Error retrieving reviews:', err);
            res.status(500).json({ status: 500, message: 'Failed to retrieve reviews' });
            return;
        }

        res.status(200).json({
            status: 200,
            message: 'Reviews retrieved successfully',
            results
        });
    });
});


// POST API to submit a review
app.post('/chef_zone/reviews/:chef_id', (req, res) => {
    const chef_id = req.params.chef_id;
    const { user_id, rating, review_text } = req.body;

    if (!user_id || !rating || !review_text) {
        return res.status(400).json({ status: 400, message: 'user_id, rating, and review_text are required.' });
    }

    // SQL query to insert a new review
    const sql = `
        INSERT INTO reviews (chef_id, user_id, rating, review_text, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;

    // Execute the query
    db.query(sql, [chef_id, user_id, rating, review_text], (err, result) => {
        if (err) {
            console.error('Error inserting review into reviews table:', err);
            return res.status(500).json({ status: 500, message: 'Failed to submit review.' });
        }
        console.log('Review inserted successfully:', result);
        res.status(200).json({ status: 200, message: 'Review submitted successfully.', newReview: { chef_id, user_id, rating, review_text } });
    });
});


// API to get bookings by user_id
app.get('/bookings/user/:user_id', (req, res) => {
    const userId = req.params.user_id;

    const query = 'SELECT * FROM booking WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        res.json({ status: 200, results });
    });
});


app.get('/food_blog', (req, res) => {
    // SQL query to select all blog posts along with the author's name
    const query = `
        SELECT 
            fb.*,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM 
            food_blog fb
        JOIN 
            user u ON fb.author_id = u.user_id
    `;
    
    db.query(query, (err, results) => {
        // console.log(results)
        if (err) {
            console.error('Error fetching blog posts:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        res.json({ status: 200, results });
    });
});


app.get('/food_blog/:post_id', (req, res) => {
    const postId = req.params.post_id;

    // SQL query to fetch a blog post by ID along with the author's name
    const query = `
        SELECT 
            fb.*,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM 
            food_blog fb
        JOIN 
            user u ON fb.author_id = u.user_id
        WHERE 
            fb.post_id = ?
    `;
    
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching the blog post:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ status: 404, message: 'Blog Post Not Found' });
        }
        res.json({ status: 200, result: results[0] });
    });
});


// POST API to create a new blog post with optional image upload
app.post('/food_blog', upload.single('image'), (req, res) => {
    const { title, content, author_id, category, tags, ingredients, preparation_time, cooking_time, servings, difficulty } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
        INSERT INTO food_blog 
        (title, content, author_id, category, tags, ingredients, preparation_time, cooking_time, servings, difficulty, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [title, content, author_id, category, tags, ingredients, preparation_time, cooking_time, servings, difficulty, imageUrl];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating new blog post:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }
        res.json({ status: 201, message: 'Blog Post Created Successfully', postId: result.insertId });
    });
});

app.get('/food_blog/:post_id', (req, res) => {
    const postId = req.params.post_id;

    // SQL query to fetch a single blog post by ID
    const query = 'SELECT * FROM food_blog WHERE post_id = ?';

    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching the blog post:', err);
            return res.status(500).json({ status: 500, message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ status: 404, message: 'Blog Post Not Found' });
        }

        res.status(200).json({ status: 200, result: results[0] });
    });
});



app.use("/chef_zone/autenticate", autenticationRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server connected to ${PORT}`);
});
