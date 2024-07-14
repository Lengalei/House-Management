import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profile: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema); // Corrected the model name capitalization
export default User;
