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
    houseNo,
    rentPayable,
  } = req.body;

if( !name || !email|| !nationalId|| !phoneNo|| !placementDate|| !houseDeposit|| !houseNo|| !rentPayable){
      return res.status(400).json({ message: 'Fill In all the details!' });
  }

  try {
    const newTenant = await Tenant.create({
      name,
      email,
      nationalId,
      phoneNo,
      placementDate,
      houseDeposit,
      houseNo,
      rentPayable,
    });
    if (!newTenant) {
      return res.status(400).json({ message: 'Error Creating Tenant' });
    }
    res.status(201).json(newTenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// getAll Tenants
export const getAllTenants = async (req, res) => {
  try {
    const allTenants = await Tenant.find({});
    if (!allTenants) {
      return res.status(400).json({ message: 'No Tenants Available' });
    }
    res.status(200).json(allTenants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//delete tenant by Id
export const deleteTenantById = async (req, res) => {
  const id = req.params.id;
  try {
    const tenant = await Tenant.findByIdAndDelete(id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.status(200).json({ message: 'Tenant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
