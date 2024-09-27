// middlewares/accessControl.js
const AccessTable = require('../models/accessTable.model');

const checkAccess = async (req, res, next) => {
  const { username } = req.user; // Assuming req.user is set after authentication

  try {
    // Fetch the user's access details from the AccessTable
    const accessRecord = await AccessTable.findOne({ username });

    if (!accessRecord) {
      return res.status(403).json({ message: 'Access denied: No access record found for user' });
    }

    // Get the current page or route
    const currentPage = req.path.replace('/', ''); // Example: Extract 'dashboard' from '/dashboard'

    // Check if the current page is allowed
    if (accessRecord.allowedPages.includes(currentPage)) {
      next(); // Allow access
    } else {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view this page' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = checkAccess;
