const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SECRET

const User = require('../models/userModel');


const registerUser = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase()

    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists, Sign in!' });
    }

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user instance with hashed password
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: 'Registration successful, now you can login!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};


let loginUser = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase()
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    

    if (passwordMatch) {
    // const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

      res.status(201).json({ "token": token, "message": "Successufully logged in!", data: {useremail: user.email } });
    } else {
      res.status(401).send({ message: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}



module.exports = { registerUser, loginUser };
