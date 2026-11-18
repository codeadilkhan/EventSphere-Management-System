const express = require('express');
const {
  getProfile,
  updateProfile,
  exportUserData,
  deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { updateProfileValidator, deleteAccountValidator } = require('../utils/validators');

const router = express.Router();

// All user management routes require valid authentication
router.use(protect);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileValidator), updateProfile);
router.get('/me/export-data', exportUserData);
router.delete('/me', validate(deleteAccountValidator), deleteAccount);

module.exports = router;
