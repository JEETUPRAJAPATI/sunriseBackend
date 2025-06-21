import Customer from '../models/Customer.js';
import * as XLSX from 'xlsx';
import multer from 'multer';

// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

export const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    
    res.json({
      total: totalCustomers,
      active: activeCustomers,
      inactive: totalCustomers - activeCustomers
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ message: 'Error fetching customer statistics' });
  }
};

// Export customers to Excel
export const exportCustomersToExcel = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    
    const excelData = customers.map(customer => ({
      'Customer Name': customer.name,
      'Email': customer.email || '',
      'Phone': customer.phone || '',
      'Company': customer.company || '',
      'Address': customer.address || '',
      'City': customer.city || '',
      'State': customer.state || '',
      'Country': customer.country || '',
      'Postal Code': customer.postalCode || '',
      'Status': customer.status || 'active',
      'Customer Type': customer.customerType || '',
      'Created Date': customer.createdAt ? customer.createdAt.toISOString().split('T')[0] : ''
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [];
    Object.keys(excelData[0] || {}).forEach(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      colWidths.push({ width: Math.min(maxLength + 2, 50) });
    });
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    const filename = `customers_${Date.now()}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);

    console.log(`Customers Excel file sent: ${filename}`);
  } catch (error) {
    console.error('Error exporting customers to Excel:', error);
    res.status(500).json({ message: 'Error exporting customers to Excel', error: error.message });
  }
};

// Import customers from Excel
export const importCustomersFromExcel = [upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty or has no valid data' });
    }

    const results = {
      total: jsonData.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

      try {
        const customerData = {
          name: row['Customer Name'] || row['Name'] || '',
          email: row['Email'] || '',
          phone: row['Phone'] || '',
          company: row['Company'] || '',
          address: row['Address'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          country: row['Country'] || '',
          postalCode: row['Postal Code'] || row['Zip Code'] || '',
          status: row['Status'] || 'active',
          customerType: row['Customer Type'] || row['Type'] || ''
        };

        if (!customerData.name) {
          results.errors.push(`Row ${rowNumber}: Customer name is required`);
          results.failed++;
          continue;
        }

        // Check if customer with same email exists
        if (customerData.email) {
          const existingCustomer = await Customer.findOne({ email: customerData.email });
          if (existingCustomer) {
            await Customer.findByIdAndUpdate(existingCustomer._id, customerData);
          } else {
            await Customer.create(customerData);
          }
        } else {
          await Customer.create(customerData);
        }

        results.successful++;
      } catch (rowError) {
        console.error(`Error processing row ${rowNumber}:`, rowError);
        results.errors.push(`Row ${rowNumber}: ${rowError.message}`);
        results.failed++;
      }
    }

    res.json({
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      success: results.failed === 0,
      results
    });

  } catch (error) {
    console.error('Error importing Excel file:', error);
    res.status(500).json({ 
      message: 'Error importing Excel file', 
      error: error.message,
      success: false
    });
  }
}];