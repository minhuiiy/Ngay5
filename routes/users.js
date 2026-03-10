const express = require('express');
const router = express.Router();
const userSchema = require('../schemas/users');

// 1) CRUD User
// Create
router.post('/', async (req, res) => {
    try {
        const newUser = new userSchema(req.body);
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Get All with Query username
router.get('/', async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.query.username) {
            query.username = { $regex: req.query.username, $options: 'i' }; // Includes (case-insensitive)
        }
        const users = await userSchema.find(query).populate('role');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await userSchema.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Soft Delete
router.delete('/:id', async (req, res) => {
    try {
        const user = await userSchema.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send({ message: "User soft deleted" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// 2) POST /enable
router.post('/enable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await userSchema.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: true },
            { new: true }
        );
        if (!user) return res.status(404).send({ message: "Thông tin không chính xác" });
        res.send({ message: "User enabled", user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// 3) POST /disable
router.post('/disable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await userSchema.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: false },
            { new: true }
        );
        if (!user) return res.status(404).send({ message: "Thông tin không chính xác" });
        res.send({ message: "User disabled", user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;