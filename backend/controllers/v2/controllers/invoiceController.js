import Invoice from '../../../models/v2/models/Invoice.js';

// Create a new invoice
export const createInvoice = async (req, res) => {
  const {
    invoiceNumber,
    clientName,
    HouseNo,
    items,
    totalAmount,
    tenantId,
    paymentId,
  } = req.body;

  try {
    const newInvoice = new Invoice({
      invoiceNumber,
      clientName,
      HouseNo,
      items,
      totalAmount,
      tenant: tenantId,
      payment: paymentId,
    });

    const savedInvoice = await newInvoice.save();
    return res.status(201).json(savedInvoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error creating invoice', error: error.message });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: 'tenant',
        select: 'name email houseDetails',
      })
      .populate('payment');

    // Sort invoices by creation date in descending order
    invoices.sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json(invoices);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Get a specific invoice by ID
export const getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findById(id).populate('tenant'); // Populate tenant details if needed
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    return res.status(200).json(invoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching invoice', error: error.message });
  }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { clientName, HouseNo, items, totalAmount, tenantId } = req.body;

  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        clientName,
        HouseNo,
        items,
        totalAmount,
        tenant: tenantId, // Update the tenant ID here
      },
      { new: true }
    );

    if (!updatedInvoice)
      return res.status(404).json({ message: 'Invoice not found' });
    return res.status(200).json(updatedInvoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error updating invoice', error: error.message });
  }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice)
      return res.status(404).json({ message: 'Invoice not found' });
    return res
      .status(200)
      .json({ message: 'Invoice deleted successfully', deletedInvoice });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: error.message || 'Error deleting invoice',
        error: error.message,
      });
  }
};
