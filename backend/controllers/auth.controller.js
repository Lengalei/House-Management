/* eslint-disable no-undef */
// auth.Controller.mjs
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendResetPasswordEmail from '../utils/sendEmail.js';
import User from '../models/user.model.js';

// Function to generate tokens
const generateTokens = (user, rememberMe = false) => {
  const age = rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 2; // 30 days for rememberMe, 2 days otherwise
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: false },
    process.env.JWT_SECRET_KEY,
    { expiresIn: age }
  );

  return {
    accessToken,
    expiresIn: age,
  };
};

// Register function
export const register = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Validate email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Validate username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and save to DB
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    // Generate token and send to user
    const { accessToken, expiresIn } = generateTokens(newUser);

    // Clear sensitive fields before sending user data
    newUser.password = undefined;

    // Set cookie and respond with user data and token
    res
      .cookie('token', accessToken, {
        httpOnly: true,
        maxAge: expiresIn,
      })
      .status(200)
      .json({ user: newUser, accessToken });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Login function
export const login = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials!' });

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: 'Invalid Credentials!' });

    // Generate tokens based on rememberMe option
    const { accessToken, expiresIn } = generateTokens(user, rememberMe);

    user.password = undefined;
    // Set cookie and respond with user data and token
    res
      .cookie('token', accessToken, {
        httpOnly: true,
        maxAge: expiresIn,
        // secure: true, // Set to true if using HTTPS
        // sameSite: 'None', // Adjust as per your security requirements
      })
      .status(200)
      .json({ user, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to login!' });
  }
};

/* Logout */
export const logout = (req, res) => {
  res.clearCookie('token').status(200).json({ message: 'Logout Successful' });
};

/* Forgot Password */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found!' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    const resetLink = `${process.env.CLIENT_URL}/resetPassword?token=${token}`;
    await sendResetPasswordEmail(user.email, resetLink);

    res.status(200).json({ message: 'Reset password email sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send email!' });
  }
};

/* Reset Password */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: userId }, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password!' });
  }
};
