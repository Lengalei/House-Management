import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema(
  {
    houseName: {
      type: String,
    },
    floor: {
      type: Number,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'apartments',
      required: true,
    },
  },
  { timestamps: true }
);
houseSchema.index({ houseName: 1, apartment: 1 }, { unique: true });

const House = mongoose.model('house', houseSchema);
export default House;
