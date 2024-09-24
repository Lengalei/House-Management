import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Houses: {
      type: Number,
    },
    Location: {
      type: String,
    },
  },
  { timestamps: true }
);

const Apartment = mongoose.model("apartments", apartmentSchema);

export default Apartment;
