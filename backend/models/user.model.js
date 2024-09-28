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
      default: true, // Ensure only admin users are created with this schema
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'], // Define specific roles
      default: 'admin', // Default role is admin
    },
    profile: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
