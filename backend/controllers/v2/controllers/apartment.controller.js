import mongoose from 'mongoose';
import Apartment from '../../../models/v2/models/apartment.model.js';

// create a new apartment or add a new apartment
export const createApartment = async (req, res) => {
  const { name, noHouses, location } = req.body;
  if (!name || !noHouses || !location) {
    return res.status(400).json({ message: 'Please fill in all the fields' });
  }

  try {
    const createdApartment = await Apartment.create({
      name,
      noHouses,
      location,
    });
    if (!createdApartment) {
      return res.status(400).json({ message: 'Error Creating Apartment' });
    }
    res.status(200).json(createdApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// get all apartments
export const allApartments = async (req, res) => {
  try {
    const fetchedApartments = await Apartment.find({});

    res.status(200).json(fetchedApartments);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// get a single apartment
export const apartment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'no such apartment' });
  }

  try {
    const fetchedApartment = await Apartment.findById(id);

    if (!fetchedApartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.status(200).json(fetchedApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// delete an apartment
export const deleteApartment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'no such apartment' });
  }
  try {
    const deletedApartment = await Apartment.findByIdAndDelete(id);
    if (!deletedApartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.status(200).json(deletedApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// update an apartment
export const updateApartment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'no such apartment' });
  }
  try {
    const updatedApartment = await Apartment.findByIdAndUpdate(
      { id },
      { ...req.body },
      { new: true }
    );
    if (!updatedApartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.status(200).json(updatedApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

//
