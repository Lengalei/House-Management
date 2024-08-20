import mongoose from 'mongoose';
import Kra from '../models/Kra.js';

//create kra record
export const createKraRecord = async (req, res) => {
  const { date, month, rent, tax, referenceNo } = req.body;
  try {
    const kra = await Kra.create({
      date,
      month,
      rent,
      tax,
      referenceNo,
    });
    if (!kra) {
      return res.status(404).json({ message: 'Error creating Kra doc' });
    }
    res.status(201).json(kra);
  } catch (error) {
    console.log('server error: ', error);
    res.status(500).json({ message: 'Internal server Error' });
  }
};

//get all kra records
export const getAllKraRecords = async (req, res) => {
  try {
    const allKra = await Kra.find({});
    if (!allKra) {
      return res.status(404).json({ message: 'No Kra Records Found' });
    }
    res.status(200).json(allKra);
  } catch (error) {
    console.log('server error: ', error);
    res.status(500).json({ message: 'Internal server Error' });
  }
};

// delete kra record
export const deleteKraRecord = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Id parameter' });
  }

  try {
    // Find and delete the record
    const kraRecord = await Kra.findByIdAndDelete(id);

    // Check if the record was found and deleted
    if (!kraRecord) {
      return res.status(404).json({ message: 'No KRA record found to delete' });
    }

    // Respond with the deleted record
    res.status(200).json(kraRecord);
  } catch (error) {
    console.log('Server Error: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
