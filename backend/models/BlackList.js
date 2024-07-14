import mongoose from 'mongoose';

const BlackListSchema = new mongoose.Schema(
  {
    blackListTenant: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BlackListTenant = mongoose.model('BlackList', BlackListSchema);

export default BlackListTenant;
