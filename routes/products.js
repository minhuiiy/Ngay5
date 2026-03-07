const express = require('express')
let router = express.Router()
let { GenID, GetCateByID } = require('../utils/IDHandler')
let slugify = require('slugify')
let {dataProducts,dataCategories} = require('../utils/data')
let productSchema = require('../schemas/products')

router.get('/', async (req, res) => {
    try {
        let result = await productSchema.find({ isDeleted: false }).populate('category')
        res.send(result)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})
router.get('/:id', async (req, res) => {//req.params
    try {
        let result = await productSchema.findOne({ id: req.params.id, isDeleted: false }).populate('category')
        res.send(result)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})
router.post('/', async (req, res) => {
    try {
        let newProduct = new productSchema({
            title: req.body.title,
            slug: slugify(req.body.title, {
                replacement: '-',
                lower: true, // Thường để slug là chữ thường
                remove: undefined,
            }),
            price: req.body.price,
            description: req.body.description,
            category: req.body.category, // ID của category từ MongoDB
            images: req.body.images
        })
        await newProduct.save()
        res.status(201).send(newProduct)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.put('/:id', (req, res) => {
    let getProduct = dataProducts.filter(
        function (e) {
            return e.id == req.params.id && !e.isDeleted
        }
    )
    if (getProduct.length > 0) {
        getProduct = getProduct[0];
        let keys = Object.keys(req.body);
        for (const key of keys) {
            if (getProduct[key]) {
                getProduct[key] = req.body[key];
            }
        }
        getProduct.updatedAt = new Date(Date.now());
        res.status(200).send(getProduct)
    } else {
        res.status(404).send("id not found")
    }

})
router.delete('/:id', (req, res) => {
    let getProduct = dataProducts.filter(
        function (e) {
            return e.id == req.params.id && !e.isDeleted
        }
    )
    if (getProduct.length > 0) {
        getProduct = getProduct[0];
        getProduct.isDeleted = true;
        getProduct.updatedAt = new Date(Date.now());
        res.status(200).send(getProduct)
    } else {
        res.status(404).send("id not found")
    }

})

module.exports = router;