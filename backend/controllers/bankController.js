import BankDetails from '../models/BankDetails.js';

// @desc    Get bank details
// @route   GET /api/bank
// @access  Private (Authenticated users)
export const getBankDetails = async (req, res, next) => {
  try {
    const bankDetails = await BankDetails.findOne();
    if (!bankDetails) {
      return res.status(200).json({ success: true, data: null, message: 'No bank details found' });
    }
    res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or create bank details
// @route   POST /api/bank
// @access  Private/Admin
export const upsertBankDetails = async (req, res, next) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId, qrCodeImage } = req.body;

    // We only ever want ONE bank detail record.
    // Use findOneAndUpdate with upsert: true. 
    // Since there's no unique filter for just "any" record, 
    // we can use a query that match any or just find first.
    
    let bankDetails = await BankDetails.findOne();
    
    if (bankDetails) {
      // Update existing
      bankDetails.accountHolderName = accountHolderName || bankDetails.accountHolderName;
      bankDetails.accountNumber = accountNumber || bankDetails.accountNumber;
      bankDetails.ifscCode = ifscCode || bankDetails.ifscCode;
      bankDetails.bankName = bankName || bankDetails.bankName;
      bankDetails.upiId = upiId || bankDetails.upiId;
      bankDetails.qrCodeImage = qrCodeImage || bankDetails.qrCodeImage;
      
      await bankDetails.save();
    } else {
      // Create new
      bankDetails = await BankDetails.create({
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        upiId,
        qrCodeImage
      });
    }

    res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    next(error);
  }
};
