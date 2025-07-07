const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Slug as the _id
    name: { type: String, required: true },
    image: { type: String, required: true },
    parentName: { type: String },
    sizeType: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
