const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  //create new User object
  const newUser = new User({
    email: req.body.email,
    title: req.body.title,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    //save user
    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    //check db if email exists
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong Email");
    //if email exists, decrypt stored password
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    //verify stored password matches inputted password
    if (originalPassword !== req.body.password) {
      return res.status(401).json("Wrong Password");
    }

    //create an access token with the userid and isAdmin as payload
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );
    //respond request with user data and token (except password)
    const { password, ...others } = user._doc;
    return res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

// VERIFY EMAIL
router.post("/verify-email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(200).json({ exists: true, message: "Email exists" });
    }
    return res
      .status(200)
      .json({ exists: false, message: "Email does not exist" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
