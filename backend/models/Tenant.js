import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
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
    type: Number,
    required: true,
    unique: true,
  },
  phoneNo: {
    type: Number,
    required: true,
  },
  placementDate: {
    type: Date,
    required: true,
  },
  houseDeposit: {
    type: Number,
    required: true,
  },
  houseNo: {
    type: String,
    required: true,
  },
  rentPayable: {
    type: Number,
    required: true,
  },
});

const Tenant = mongoose.model('Tenant', TenantSchema);

export default Tenant;
