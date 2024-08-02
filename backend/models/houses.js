import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema(
  {
    houseName: {
      type: String,
      unique: true,
      match: /^House \d+[A-D]$/, // Enforce the format House floorLetter
    },
    floor: {
      type: Number,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const House = mongoose.model('house', houseSchema);
export default House;
