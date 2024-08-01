import mongoose from 'mongoose';
import Tenant from '../models/Tenant.js';
import cron from 'node-cron';
import Payment from '../models/Payment.js';

// Register Tenant
export const registerTenant = async (req, res) => {
  const {
    name,
    email,
    nationalId,
    phoneNo,
    placementDate,
    houseDeposit,
    waterDeposit,
    houseNo,
    rentPayable,
    emergencyContactNumber,
    emergencyContactName,
  } = req.body;

  if (
    !name ||
    !email ||
    !nationalId ||
    !phoneNo ||
    !placementDate ||
    !houseDeposit ||
    !waterDeposit ||
    !houseNo ||
    !rentPayable ||
    !emergencyContactNumber ||
    !emergencyContactName
  ) {
    return res.status(400).json({ message: 'Please fill in all the details!' });
  }

  try {
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant already exists!' });
    }
    const existingTenantInHouse = await Tenant.findOne({ houseNo });
    if (existingTenantInHouse) {
      return res.status(400).json({ message: 'House Already Occupied!' });
    }
    const existingNationalId = await Tenant.findOne({ nationalId });
    if (existingNationalId) {
      return res
        .status(409)
        .json({ message: 'Tenant National Id already exists!' });
    }

    const newTenant = await Tenant.create({
      name,
      email,
      nationalId,
      phoneNo,
      placementDate,
      houseDeposit,
      waterDeposit,
      houseNo,
      rentPayable,
      emergencyContactNumber,
      emergencyContactName,
    });

    res.status(201).json(newTenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get All Tenants
// Get All Tenants with Payment Details
export const getAllTenants = async (req, res) => {
  try {
    // Fetch all tenants
    const allTenants = await Tenant.find({});

    // For each tenant, fetch payment details
    const tenantsWithPaymentDetails = await Promise.all(
      allTenants.map(async (tenant) => {
        // Get payment details for the tenant
        const payments = await Payment.find({ tenantId: tenant._id });

        // Calculate totalAmount and balance
        const totalAmount = payments.reduce(
          (sum, payment) => sum + payment.totalAmount,
          0
        );
        const balance = payments.reduce(
          (sum, payment) => sum + payment.balance,
          0
        );

        return {
          ...tenant.toObject(),
          totalAmount,
          balance,
        };
      })
    );

    res.status(200).json(tenantsWithPaymentDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Single Tenant
export const getSingleTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(200).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Patch Single Tenant
export const updateSingleTenant = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.status(200).json(updatedTenant);
  } catch (err) {
    console.error('Error updating tenant:', err);
    return res
      .status(500)
      .json({ error: 'Server error', message: err.message });
  }
};

// Delete Tenant By ID
export const deleteTenantById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findByIdAndDelete(id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json({ message: 'Tenant deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Blacklist Tenant By ID
export const blackListTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { blackListTenant: true },
      { new: true }
    );
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res
      .status(200)
      .json({ message: 'Tenant blacklisted successfully', tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Whitelist Tenant By ID
export const whiteListTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { whiteListTenant: true, blackListTenant: false },
      { new: true }
    );
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    console.log(tenant);
    res
      .status(200)
      .json({ message: 'Tenant whitelisted successfully', tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//update Tenant Payments
export const updateTenantPayments = async () => {
  try {
    const tenants = await Tenant.find({});
    tenants.forEach(async (tenant) => {
      let newTotalAmount =
        tenant.monthlyRent +
        tenant.waterBill +
        tenant.garbageFee +
        tenant.extraBills;
      if (tenant.balance > 0) {
        newTotalAmount += tenant.balance;
      }
      await Tenant.findByIdAndUpdate(tenant._id, {
        totalAmount: newTotalAmount,
        balance: newTotalAmount - tenant.amountPaid,
      });
    });
  } catch (error) {
    console.error('Error updating tenant payments:', error);
  }
};
cron.schedule('0 0 1 * *', updateTenantPayments); // Runs on the 1st of every month
