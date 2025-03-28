// Import required modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // For password hashing

 // This connects to a local MongoDB database

 const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kdl_rentacar';

// Connect to MongoDB locally
mongoose.connect(MONGO_URI, {
}).then(() => {
    console.log("✅ Connected to local MongoDB");
}).catch((error) => {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exit if connection fails
});

// Initialize Express app
const app = express();
const PORT = 5000;
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());


// Sample route to check if the server is running
app.get('/', (req, res) => {
    res.send('🚗 KDL Rent-a-Car local server is running!');
});

// --- USER & ADMIN AUTHENTICATION (Admin Login) ---

// Admin Schema
const adminSchema = new mongoose.Schema({
    FullName: String,
    PhoneNumber: { type: String, unique: true },
    Gender: String,
    Age: Number,
    Password: String
});

const Admin = mongoose.model('Admin', adminSchema);

// Route to Register New Admin
app.post('/admin/register', async (req, res) => {
    try {
        const { FullName, PhoneNumber, Gender, Age, Password } = req.body;

        // Check if Admin already exists
        const existingAdmin = await Admin.findOne({ PhoneNumber });
        if (existingAdmin) {
            return res.status(400).json({ message: "❌ Admin with this phone number already exists" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(Password, 7);

        const newAdmin = new Admin({ FullName, PhoneNumber, Gender, Age, Password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: "✅ Admin registered successfully!" });
    } catch (error) {
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ message: "❌ Error registering admin", error: error.message });
    }
});

// Route to Admin Login (Sign-In)
app.post('/admin/login', async (req, res) => {
    try {
        const { PhoneNumber, Password } = req.body;
        const admin = await Admin.findOne({ PhoneNumber });

        if (!admin) {
            return res.status(401).json({ message: "❌ Admin not found" });
        }

        // Compare Hashed Password
        const isMatch = await bcrypt.compare(Password, admin.Password);
        if (!isMatch) {
            return res.status(401).json({ message: "❌ Incorrect password" });
        }

        res.status(200).json({ message: "✅ Admin logged in successfully!" });
    } catch (error) {
        console.error("❌ Error logging in:", error);
        res.status(500).json({ message: "❌ Error logging in", error: error.message });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try these solutions:`);
        console.error('1. Stop any other servers running on port 5000');
        console.error('2. Use a different port by changing the PORT variable');
        console.error('3. Run this command to find processes using port 5000:');
        console.error('   Windows: netstat -ano | findstr :5000');
        console.error('   Linux/Mac: lsof -i :5000');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

// reservation
const reservationSchema = new mongoose.Schema({
    location: String,
    name: String,
    gender: String,
    age: Number,
    phone: String,
    vehicle: String,
    driverChoice: String,
    pickupDateTime: String,
    returnDateTime: String,
    rentalHours: Number,
    totalCost: Number
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// API Endpoint to Handle Reservations
app.post('/api/reservations', async (req, res) => {
    try {
        const newReservation = new Reservation(req.body);
        await newReservation.save();
        res.status(201).json({ message: "✅ Reservation saved successfully!", reservation: newReservation });
    } catch (error) {
        res.status(500).json({ message: "❌ Error saving reservation", error });
    }
});

// Review Schema
const ReviewSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    review: String
});
const Review = mongoose.model('Review', ReviewSchema);

// API Route for Submitting Reviews
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, rating, review } = req.body;
        if (!name || !rating || !review) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const newReview = new Review({ name, rating, review });
        await newReview.save();
        res.status(201).json({ message: 'Review saved successfully' });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
