import mongoose from 'mongoose';
import Tenant from '../models/Tenant.js';

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
export const getAllTenants = async (req, res) => {
  try {
    const allTenants = await Tenant.find({});
    res.status(200).json(allTenants);
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
