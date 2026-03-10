const express = require('express');
const router = express.Router();
const roleSchema = require('../schemas/roles');
const userSchema = require('../schemas/users');

// 1) CRUD Role
// Create
router.post('/', async (req, res) => {
    try {
        const newRole = new roleSchema(req.body);
        await newRole.save();
        res.status(201).send(newRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Get All
router.get('/', async (req, res) => {
    try {
        const roles = await roleSchema.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get by ID
router.get('/:id', async (req, res) => {
    try {
        const role = await roleSchema.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) return res.status(404).send({ message: "Role not found" });
        res.send(role);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Soft Delete
router.delete('/:id', async (req, res) => {
    try {
        const role = await roleSchema.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!role) return res.status(404).send({ message: "Role not found" });
        res.send({ message: "Role soft deleted" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// 4) GET users by role ID
router.get('/:id/users', async (req, res) => {
    try {
        const users = await userSchema.find({ role: req.params.id, isDeleted: false }).populate('role');
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;