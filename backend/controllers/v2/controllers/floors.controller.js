import Floor from '../../../models/v2/models/floor.model.js';

export const createFloor = async (req, res) => {
  const { floorNumber, floorName, apartmentId } = req.body;
  try {
    const floor = await Floor.create({
      floorNumber,
      floorName,
      apartment: apartmentId,
    });
    if (!floor) {
      return res.status(400).json({ message: 'Error creating Floor!' });
    }
    res.status(200).json(floor);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error Posting Floor!' });
  }
};

//get all floors in an apartment
export const getAllFloorsInApartment = async (req, res) => {
  const { apartmentId } = req.params;
  try {
    const floors = await Floor.find({ apartment: apartmentId });
    if (!floors) {
      return res.status(400).json({ message: 'No floors Available!' });
    }
    res.status(200).json(floors);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching Floor!' });
  }
};

//get all floors
export const getAllFloors = async (req, res) => {
  try {
    const floors = await Floor.find({});
    if (!floors) {
      return res.status(400).json({ message: 'No floors Available!' });
    }
    res.status(200).json(floors);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching Floor!' });
  }
};
