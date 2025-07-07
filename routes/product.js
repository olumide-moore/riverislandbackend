const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenandAuthorization,
  verifyTokenandAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE PRODUCT
router.post("/", verifyTokenandAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  console.log(newProduct);
  try {
    const saveProduct = await newProduct.save();
    res.status(200).json(saveProduct);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// CREATE MULTIPLE PRODUCTS
router.post("/bulk", verifyTokenandAdmin, async (req, res) => {
  const products = req.body; // Expecting an array of product objects
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Expected an array of products" });
  }

  try {
    const savedProducts = await Product.insertMany(products);
    res.status(200).json(savedProducts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


//UPDATE PRODUCT
router.put("/:id", verifyTokenandAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE PRODUCT
router.delete("/delete/:id", verifyTokenandAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MULTIPLE PRODUCTS BY IDS
router.post("/find-many", async (req, res) => {
  const { ids } = req.body; // Expecting { ids: [id1, id2, ...] }
  
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "Expected an array of product IDs" });
  }

  try {
    const products = await Product.find({ _id: { $in: ids } });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;

  try {
    let products;
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (qCategory) {
      products = await Product.find({ categories: { $in: [qCategory] } });
    }else{
      products = await Product.find();  
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
