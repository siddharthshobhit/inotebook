const express = require("express");
const router = express.Router();
const User = require("../modles/Users");

const { body, validationResult } = require("express-validator");

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
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
        .then((user) => res.json(user))
        .catch((err) => {
          res.json({ error: err });
        });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Something went wrong")
    }
    
  }
);

module.exports = router;
