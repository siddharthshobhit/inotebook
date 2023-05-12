const express = require("express");
const router = express.Router();
const User = require("../modles/Users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const token = jwt.sign({ foo: "bar" }, "shhhhh");
const JWT_SECRETE = 'Sidisacoolguy'
// create a user using API "/api/auth" doesnt require auth
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    // body("email")(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => { 
    console.log("req", req.body);
    // Error handling for modles
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is already exists
      let user = await User.findOne({ email: req.body.email }); 
      if (user) {
        return res
          .status(400)
          .json({ errors: "User with this mail already exist" });
      } 
      // Create a new user
       const salt = await bcrypt.genSaltSync(10); 
      const secPassword = await bcrypt.hash(req.body.password, salt);
      
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
      });
      const data = {
        id: user.id
      } 
      const authToken = jwt.sign(data, JWT_SECRETE); 
      res.json({authToken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error")
    }
    
  }
);


// Auth a user using API "/api/login" doesnt require auth
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Can't be empty").exists(),
  ],
  async (req, res) => {
    // Error handling for modles
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Check if user is already exists
      let user = await User.findOne({ email });
      if (!user) {
        return user.status(404).json({ error: "User doesn't exists" });
      } 
      const passwordCompare = await bcrypt.compare(password, user.password)
      if (!passwordCompare) {
        return user.status(404).json({ error: "Please correct credentials" });
      } 

      const data = {
        id: user.id,
      };
      const authToken = jwt.sign(data, JWT_SECRETE);
      res.json({ authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);
module.exports = router;
