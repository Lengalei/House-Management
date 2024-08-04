import mongoose from 'mongoose';
import Landlord from '../models/Landlord.js';

// register Landlord
export const registerLandlord = async (req, res) => {
  const {
    name,
    email,
    nationalId,
    phoneNo,
    placementDate,
    assignedHouseNo,
    monthlyPay,
    emergencyContactNumber,
    emergencyContactName,
  } = req.body;

  if (
    !name ||
    !email ||
    !nationalId ||
    !phoneNo ||
    !placementDate ||
    !assignedHouseNo ||
    !monthlyPay ||
    !emergencyContactNumber ||
    !emergencyContactName
  ) {
    return res.status(400).json({ message: 'Please fill in all the details!' });
  }

  try {
    const existingLandlord = await Landlord.findOne({ email });
    if (existingLandlord) {
      return res.status(400).json({ message: 'Landlord already exists!' });
    }
    const existingLandlordHouse = await Landlord.findOne({ assignedHouseNo });
    if (existingLandlordHouse) {
      return res
        .status(400)
        .json({ message: 'House is already occupied by a current Landlord!' });
    }
    const newLandlord = await Landlord.create({
      name,
      email,
      nationalId,
      phoneNo,
      placementDate,
      assignedHouseNo,
      monthlyPay,
      emergencyContactNumber,
      emergencyContactName,
    });

    res.status(201).json(newLandlord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get All Landlords
export const getAllLandlords = async (req, res) => {
  try {
    const allLandlords = await Landlord.find({});
    res.status(200).json(allLandlords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Single Landlord
export const getSingleLandlord = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const landlord = await Landlord.findById(id);
    if (!landlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }
    res.status(200).json(landlord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// update Single Landlord
export const updateSingleLandlord = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const updatedLandlord = await Landlord.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedLandlord) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.status(200).json(updatedLandlord);
  } catch (err) {
    console.error('Error updating tenant:', err);
    return res
      .status(500)
      .json({ error: 'Server error', message: err.message });
  }
};

// Delete Landlord By ID
export const deleteLandlordById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const landlord = await Landlord.findByIdAndDelete(id);
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }
    res.status(200).json({ message: 'Landlord deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Blacklist Landlord By ID
export const blackListLandlord = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const landlord = await Landlord.findByIdAndUpdate(
      id,
      { blackListLandlord: true },
      { new: true }
    );
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }
    res
      .status(200)
      .json({ message: 'Landlord blacklisted successfully', landlord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Whitelist Landlord By ID
export const whiteListLandlord = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const landlord = await Landlord.findByIdAndUpdate(
      id,
      { whiteListLandlord: true, blackListLandlord: false },
      { new: true }
    );
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }
    res
      .status(200)
      .json({ message: 'Landlord whitelisted successfully', landlord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
