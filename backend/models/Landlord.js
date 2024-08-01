import mongoose from 'mongoose';

const landlordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nationalId: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    placementDate: {
      type: Date,
      required: true,
    },
    assignedHouseNo: {
      type: String,
      unique: true,
      required: true,
    },
    monthlyPay: {
      type: Number,
      required: true,
    },
    emergencyContactNumber: {
      type: String,
      required: true,
    },
    emergencyContactName: {
      type: String,
      required: true,
    },
    blackListLandlord: {
      type: Boolean,
      default: false,
    },
    whiteListLandlord: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Landlord = mongoose.model('Landlord', landlordSchema);

export default Landlord;
