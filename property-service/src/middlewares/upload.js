const multer = require("multer");
const { AppError } = require("../../../shared/errors");

// Use memory storage — file goes to RAM as Buffer
// We then stream it directly to Cloudinary
// No files ever saved to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cd) => {
  // Only allow image files
  if (!file.mimetype.startsWith("image/")) {
    return cb(
      new AppError("Only image files are allowed", 400, "INVALID_FILE_TYPE"),
      false,
    );
  }
  cd(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB limit and max 10 files
});


module.exports=upload; 
