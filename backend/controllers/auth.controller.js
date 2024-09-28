/* eslint-disable no-undef */
// auth.Controller.mjs
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendResetPasswordEmail from '../utils/sendEmail.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Function to generate tokens
const generateTokens = (user) => {
  const age = 1000 * 60 * 60 * 24 * 30; // 30 days
  const accessToken = jwt.sign(
    { id: user._id, isAdmin: false },
    process.env.JWT_SECRET_KEY,
    { expiresIn: age }
  );

  return {
    accessToken,
    expiresIn: age,
  };
};

// Register function for admins
export const registerAdmin = async (req, res) => {
  const { email, username, password, role } = req.body;

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

    // Validate role - Optional step
    const validRoles = ['super_admin', 'admin', 'moderator'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create a new user and save to DB
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      role: role || 'admin',
    });

    // Clear sensitive fields before sending user data
    newUser.password = undefined;

    // Set cookie and respond with user data and token
    res.status(200).json(newUser);
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ message: 'Failed to create admin' });
  }
};

// Login function
export const login = async (req, res) => {
  const { username, password, rememberMe } = req.body;
  console.log('rememberMe:', rememberMe);

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials!' });

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: 'Invalid Credentials!' });

    // Generate tokens based on rememberMe option
    const { accessToken, expiresIn } = generateTokens(user);

    user.password = undefined;
    // Set cookie and respond with user data and token
    res
      .status(200)
      .cookie('token', accessToken, {
        httpOnly: true,
        maxAge: expiresIn,
        // secure: true, // Set to true if using HTTPS
        // sameSite: 'None', // Adjust as per your security requirements
      })
      .json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to login!' });
  }
};

/* Logout */
export const logout = (req, res) => {
  res
    .cookie('HouseAdmintoken', '', { maxAge: new Date(0) })
    .status(200)
    .json({ msg: 'success logout' });
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
    const resetLink = `${process.env.CLIENT_URL}/resetPasswordLinkClicked?token=${token}`;
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

/*Update the password*/
export const adminChangePassword = async (req, res) => {
  const { adminId, currentPassword, newPassword } = req.body;
  if (!adminId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields must be filled' });
  }
  try {
    // Find user with the passed adminId
    const user = await User.findById(adminId);
    if (!user) {
      return res.status(400).json({ error: 'No user found' });
    }
    // Compare the password passed to password in Db
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }
    // Hash the new password
    const hashPass = await bcrypt.hash(newPassword, 10);
    const changeUserPass = await User.findByIdAndUpdate(
      adminId,
      {
        password: hashPass,
      },
      { new: true }
    );
    if (!changeUserPass) {
      return res
        .status(400)
        .json({ error: 'Error occurred while updating password' });
    }
    changeUserPass.password = undefined;
    return res.status(200).json(changeUserPass);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Internal server error. Failed to change password' });
  }
};

/*admin update profile*/
export const adminUpdateProfile = async (req, res) => {
  const { profile } = req.body;
  const { id } = req.params;
  if (!profile) {
    return res.status(400).json({ error: 'All fields must be filled' });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        profile,
      },
      {
        new: true,
      }
    );
    if (!user) {
      return res.status(400).json({ error: 'Error Updating the Profile' });
    }
    user.password = undefined;
    console.log(user);
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Iternal server Error. Failled to Change Pass' });
  }
};

//get admins
export const checkIfthereIsAnyAdmin = async (req, res) => {
  try {
    const admins = await User.find({});
    if (!admins) {
      return res.status(404).json({ message: 'No admins found!' });
    }
    res.status(200).json(admins);
  } catch (error) {
    console.log('error Occured fetching Admins: ', error);
    res.status(500).json({ message: 'Server Error!', errro });
  }
};
