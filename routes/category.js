const Category = require("../models/Category");
const {
  verifyToken,
  verifyTokenandAuthorization,
  verifyTokenandAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE CATEGORY
router.post("/", verifyTokenandAdmin, async (req, res) => {
  const newCategory = new Category(req.body);
  try {
    const saveCategory = await newCategory.save();
    res.status(200).json(saveCategory);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// CREATE MULTIPLE CATEGORIES
router.post("/bulk", verifyTokenandAdmin, async (req, res) => {
  const categories = req.body; // Expecting an array of Category objects
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: "Expected an array of categories" });
  }

  try {
    const savedCategories = await Category.insertMany(categories);
    res.status(200).json(savedCategories);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


//UPDATE CATEGORY
router.put("/:id", verifyTokenandAdmin, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE CATEGORY
router.delete("/delete/:id", verifyTokenandAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json("Category deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET CATEGORY
router.get("/find/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET CATEGORIES
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ parentName: null });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});
//GET SUBCATEGORIES
router.get("/:name", async (req, res) => {

  try {
    const subcategories = await Category.find({ parentName: req.params.name });
    res.status(200).json(subcategories);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
