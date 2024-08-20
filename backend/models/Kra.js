import mongoose from 'mongoose';

const KraSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
    },
    month: {
      type: String,
    },
    rent: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    referenceNo: {
      type: String,
    },
  },
  { timestamps: true }
);

const Kra = mongoose.model('Kra', KraSchema);

export default Kra;
