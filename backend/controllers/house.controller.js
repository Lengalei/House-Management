import House from '../models/houses.js';

//register house
export const registerHouse = async (req, res) => {
  const { houseName, floor } = req.body;
  console.log('HouseDtSent', req.body);
  try {
    // Convert floor to number
    const floorNum = Number(floor) || 0;

    // Check if house is already registered
    const isAlreadyRegistered = await House.findOne({
      houseName,
    });
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'House already Registered' });
    }

    // Register house
    const house = await House.create({
      houseName,
      floor: floorNum,
    });
    if (!house) {
      return res.status(400).json({ message: 'Error Creating House' });
    }
    console.log('CreatedHouse: ', house);
    res.status(200).json(house);
  } catch (err) {
    console.error('Error registering House:', err);
    res.status(500).json({ message: 'Failed to create House' });
  }
};

//fetch All Houses
export const fetchALlHouses = async (req, res) => {
  try {
    const houses = await House.find();
    if (!houses) {
      return res.status(400).json({ message: 'No houses Registered' });
    }
    console.log('RegistedHouses: ', houses);
    res.status(200).json(houses);
  } catch (err) {
    console.error('Error Fetching Houses:', err);
    res.status(500).json({ message: 'Failed to Fetch Houses' });
  }
};

//fetch Single House
export const fetchSingleHouse = async (req, res) => {
  const { houseName, floor } = req.body;
  try {
    //convert floor to number
    const floorNum = Number(floor) || 0;
    const houses = await House.find({ houseName, floor: floorNum });
    if (!houses) {
      return res.status(400).json({ message: 'No houses Registered' });
    }
    console.log('RegistedHouses: ', houses);
    res.status(200).json(houses);
  } catch (err) {
    console.error('Error Fetching Houses:', err);
    res.status(500).json({ message: 'Failed to Fetch Houses' });
  }
};

//Delete Single House
export const deleteHouse = async (req, res) => {
  const { houseName, floor } = req.body;
  try {
    //convert floor to number
    const floorNum = Number(floor) || 0;
    const deletedHouse = await House.findOneAndDelete({
      houseName,
      floor: floorNum,
    });

    res.status(200).json(deletedHouse);
  } catch (err) {
    console.error('Error Fetching Houses:', err);
    res.status(500).json({ message: 'Failed to Fetch Houses' });
  }
};
