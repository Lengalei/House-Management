import mongoose from 'mongoose';

const floorSchema = new mongoose.Schema(
  {
    apartment: {
      type: mongoose.Types.ObjectId,
      ref: 'apartments',
      required: true,
    },
    floorNumber: {
      type: Number,
      default: false,
    },
    floorName: {
      type: String,
      default: false,
    },
  },
  { timestamps: true }
);

const Floor = mongoose.model('floor', floorSchema);

export default Floor;
