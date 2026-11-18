const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { ApiServiceException } = require('../utils/helpers');

// Ensure upload directory exists
const uploadDirectory = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Storage configuration with custom prefix
const createCustomStorage = (prefix = 'file') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const uniqueString = crypto.randomBytes(8).toString('hex');
      const safeFilename = `${prefix}-${Date.now()}-${uniqueString}${fileExtension}`;
      cb(null, safeFilename);
    },
  });
};

// Disallowed executable extensions blacklist for defense-in-depth
const DISALLOWED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.py',
  '.pl', '.cgi', '.html', '.htm', '.svg', '.vbs', '.jar', '.msi',
  '.scr', '.com', '.wsf', '.dll'
];

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const ALLOWED_DOC_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_DOC_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

// Image-only filter
const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (DISALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new ApiServiceException('Executable or script files are strictly prohibited.', 400), false);
  }

  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype) && ALLOWED_IMAGE_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiServiceException('Invalid image type. Only JPEG, PNG, and WebP are allowed.', 400), false);
  }
};

// Document & Image filter (allows PDF as well)
const documentFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (DISALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new ApiServiceException('Executable or script files are strictly prohibited.', 400), false);
  }

  if (ALLOWED_DOC_MIMES.includes(file.mimetype) && ALLOWED_DOC_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new ApiServiceException(
        'Invalid document type. Only PDF documents and image files (JPG, PNG, WebP) are permitted.',
        400
      ),
      false
    );
  }
};

const uploadBanner = multer({
  storage: createCustomStorage('banner'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFilter,
});

const uploadLogo = multer({
  storage: createCustomStorage('logo'),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: imageFilter,
});

const uploadDocument = multer({
  storage: createCustomStorage('doc'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: documentFilter,
});

module.exports = {
  uploadBanner,
  uploadLogo,
  uploadDocument,
};
