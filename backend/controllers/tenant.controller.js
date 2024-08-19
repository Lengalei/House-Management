import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import cron from "node-cron";
import Payment from "../models/Payment.js";
import House from "../models/houses.js";

// Function to convert floor string to corresponding number
const convertFloorToNumber = (floor) => {
  const floorMap = {
    "Ground Floor": 0,
    "Floor 1": 1,
    "Floor 2": 2,
    "Floor 3": 3,
    "Floor 4": 4,
    "Floor 5": 5,
    "Floor 6": 6,
  };
  return floorMap[floor] || null;
};

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
    return res.status(400).json({ message: "Please fill in all the details!" });
  }

  // Special handling for "Ground Floor"
  let floorNumber;
  let houseName;

  if (houseNo.startsWith("Ground Floor")) {
    floorNumber = 0;
    houseName = houseNo.split(",")[1]?.trim() || "";
  } else {
    const [floorStr, houseNamePart] = houseNo
      .split(",")
      .map((part) => part.trim());
    console.log("floorStr:", floorStr); // Debugging
    console.log("houseName:", houseNamePart); // Debugging

    floorNumber = convertFloorToNumber(floorStr);
    houseName = houseNamePart;
  }

  if (floorNumber === null) {
    return res.status(400).json({ message: "Invalid floor provided!" });
  }

  try {
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant already exists!" });
    }
    const existingTenantInHouse = await Tenant.findOne({ houseNo });
    if (existingTenantInHouse) {
      return res.status(400).json({ message: "House Already Occupied!" });
    }
    const existingNationalId = await Tenant.findOne({ nationalId });
    if (existingNationalId) {
      return res
        .status(409)
        .json({ message: "Tenant National Id already exists!" });
    }

    console.log("Searching for house:", {
      floor: floorNumber,
      houseName: houseName,
    }); // Debugging

    const house = await House.findOneAndUpdate(
      { floor: floorNumber, houseName: houseName },
      { isOccupied: true },
      { new: true }
    );

    if (!house) {
      return res.status(404).json({ message: "House not found!" });
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

    //calculate total amount
    // const rentPayableNum = Number(rentPayable) || 0;
    // const houseDepositNum = Number(houseDeposit) || 0;
    // const waterDepositNum = Number(waterDeposit) || 0;
    // let totalAmount = rentPayableNum + houseDepositNum + waterDepositNum;
    // res.status(201).json({ newTenant, totalAmount });
    res.status(201).json(newTenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Single Tenant
export const getSingleTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    res.status(200).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Patch Single Tenant
export const updateSingleTenant = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    return res.status(200).json(updatedTenant);
  } catch (err) {
    console.error("Error updating tenant:", err);
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
};

// Delete Tenant By ID
export const deleteTenantById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    // Find and delete the tenant
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Extract houseNo from tenant
    const { houseNo } = tenant;

    // Determine floor and house name
    let floorNumber;
    let houseName;

    if (houseNo.startsWith("Ground Floor")) {
      floorNumber = 0;
      houseName = houseNo.split(",")[1]?.trim() || "";
    } else {
      const [floorStr, houseNamePart] = houseNo
        .split(",")
        .map((part) => part.trim());
      floorNumber = convertFloorToNumber(floorStr);
      houseName = houseNamePart;
    }

    if (floorNumber === null) {
      return res
        .status(400)
        .json({ message: "Invalid floor in house number!" });
    }

    // Delete the tenant
    await Tenant.findByIdAndDelete(id);

    // Update the house to set isOccupied to false
    const house = await House.findOneAndUpdate(
      { floor: floorNumber, houseName: houseName },
      { isOccupied: false },
      { new: true }
    );

    if (!house) {
      return res.status(404).json({ message: "House not found!" });
    }

    res.status(200).json({
      message: "Tenant deleted successfully and house status updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Blacklist Tenant By ID
export const blackListTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { blackListTenant: true },
      { new: true }
    );
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    res
      .status(200)
      .json({ message: "Tenant blacklisted successfully", tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Whitelist Tenant By ID
export const whiteListTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { whiteListTenant: true, blackListTenant: false },
      { new: true }
    );
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    console.log(tenant);
    res
      .status(200)
      .json({ message: "Tenant whitelisted successfully", tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
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
    console.error("Error updating tenant payments:", error);
  }
};
cron.schedule("0 0 1 * *", updateTenantPayments); // Runs on the 1st of every month
