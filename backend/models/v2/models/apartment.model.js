import mongoose from 'mongoose';

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    noHouses: {
      type: Number,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

const Apartment = mongoose.model('apartments', apartmentSchema);

export default Apartment;
