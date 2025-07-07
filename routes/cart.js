const Cart = require("../models/Cart");
const {
  verifyToken,
  verifyTokenandAuthorization,
  verifyTokenandAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// //CREATE CART
// router.post("/", verifyToken, async (req, res) => {
//   const newCart = new Cart(req.body);
//   // console.log(newCart);
//   try {
//     const saveCart = await newCart.save();
//     res.status(200).json(saveCart);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //UPDATE CART
// router.put("/:id", verifyTokenandAuthorization, async (req, res) => {
//   try {
//     const updatedCart = await Cart.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedCart);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
//ADD TO CART/INCREASE QUANTITY
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      const newCart = new Cart({
        userId,
        products: [{ productId, quantity: 1 }],
      });
      await newCart.save();
      return res.status(200).json(newCart);
    }

    // Check if product already exists in cart
    const existingProduct = cart.products.find(
      (item) => item.productId === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }

    const updatedCart = await cart.save();
    return res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/add-many", verifyToken, async (req, res) => {
  try {
    const { userId, products } = req.body; // products = [{ productId, quantity }, ...]
    console.log(userId, products);

    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Products must be an array." });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart with the given products
      cart = new Cart({
        userId,
        products: products.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      });
      await cart.save();
      return res.status(200).json(cart);
    }

    for (const { productId, quantity } of products) {
      // Merge incoming products with existing ones
      const existing = cart.products.find(
        (item) => item.productId === productId
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Add-many error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DECREASE ITEM QUANTITY
router.post("/decrease", verifyToken, async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json("Cart not found");

    const itemIndex = cart.products.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1)
      return res.status(404).json("Product not found in cart");

    const product = cart.products[itemIndex];

    if (product.quantity > 1) {
      product.quantity -= 1;
    } else {
      // If quantity is 1, remove the product
      cart.products.splice(itemIndex, 1);
    }

    const updatedCart = await cart.save();
    if (updatedCart.products.length == 0) {
      await Cart.deleteOne({ userId });
    }

    return res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE PRODUCT FROM CART
router.post("/delete-product", verifyToken, async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the product to remove
    cart.products = cart.products.filter(
      (item) => item.productId !== productId
    );

    const updatedCart = await cart.save();
     if (updatedCart.products.length == 0) {
      await Cart.deleteOne({ userId });
    }
    return res.status(200).json(updatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete item from cart" });
  }
});

//DELETE CART
router.delete(
  "/delete-cart/:id",
  verifyTokenandAuthorization,
  async (req, res) => {
    try {
      await Cart.findByIdAndDelete(req.params.id);
      res.status(200).json("Cart deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//GET USER CART
router.get("/find/:userId", verifyTokenandAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL CARTS
router.get("/", verifyTokenandAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
