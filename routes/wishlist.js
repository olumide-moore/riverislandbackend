const Wishlist = require("../models/Wishlist");
const {
  verifyToken,
  verifyTokenandAuthorization,
  verifyTokenandAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//TOGGLE PRODUCT AS WISHLIST
router.post(
  "/toggle/:userId",
  verifyTokenandAuthorization,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const productId = req.body.productId;

      const wishlist = await Wishlist.findOne({ userId: req.params.userId });

      if (!wishlist) {
        // Create new wishlist and add product
        const newWishlist = new Wishlist({
          userId: req.params.userId,
          productIds: [productId],
        });
        await newWishlist.save();
        return res.status(200).json({ liked: true });
      }

      const alreadyExists = wishlist.productIds.includes(productId);

      let updatedWishlist;

      if (alreadyExists) {
        // Remove product
        updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: req.params.userId },
          { $pull: { productIds: productId } },
          { new: true }
        );
        if (updatedWishlist.productIds.length === 0) {
          await Wishlist.deleteOne({ userId: req.params.userId });
        }
      } else {
        // Add product
        updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: req.params.userId },
          { $addToSet: { productIds: productId } },
          { new: true }
        );
      }
      res.status(200).json({ liked: !alreadyExists });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ADD PRODUCTS TO WISHLIST
router.post(
  "/add-many/:userId",
  verifyTokenandAuthorization,
  async (req, res) => {
    try {
      const productIds = req.body.productIds;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json("Invalid or empty productIds array");
      }

      const updatedWishlist = await Wishlist.findOneAndUpdate(
        { userId: req.params.userId },
        { $addToSet: { productIds: { $each: productIds } } }, // $each is key here
        { new: true, upsert: true }
      );

      return res.status(200).json(updatedWishlist);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

//CLEAR USER'S WISHLISTS
router.delete(
  "/delete/:userId",
  verifyTokenandAuthorization,
  async (req, res) => {
    try {
      await Wishlist.findByIdAndDelete(req.params.userId);
      res.status(200).json("Wishlist deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//GET USER WISHLIST
router.get("/find/:userId", verifyTokenandAuthorization, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL WISHLISTS
router.get("/", verifyTokenandAdmin, async (req, res) => {
  try {
    const wishlists = await Wishlist.find();
    res.status(200).json(wishlists);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
