const User = require("../models/User");
const CryptoJS = require("crypto-js");
const {
  verifyToken,
  verifyTokenandAuthorization,
  verifyTokenandAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//UPDATE USER
router.post("/:userId", verifyTokenandAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: req.body,
      },
      { new: true }
    );
    const { password, ...others } = updatedUser._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});


//CHANGE PASSWORD
router.post("/change-password/:userId", verifyTokenandAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    ).toString(CryptoJS.enc.Utf8);
    console.log(decryptedPassword);

    if (decryptedPassword !== req.body.currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newEncryptedPassword = CryptoJS.AES.encrypt(
      req.body.newPassword,
      process.env.PASS_SEC
    ).toString();

    user.password = newEncryptedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});


//DELETE USER
router.delete("/delete/:userId", verifyTokenandAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/find/:userId", verifyTokenandAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    //respond request with user data and token (except password)
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET  ALL USERS
router.get("/", verifyTokenandAdmin, async (req, res) => {
  const query = req.query.new; //if param new in query
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS
router.get("/stats", verifyTokenandAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
