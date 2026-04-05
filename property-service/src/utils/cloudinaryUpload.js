const cloudinary = require("cloudinary").v2;
const logger = require("./logger");

// Cofiguration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// uploadBuffer
// Takes a file buffer (from multer memoryStorage) and uploads to Cloudinary
// Returns the secure URL and publicId
//
// Why buffer instead of file path?
// We use multer's memoryStorage — file never touches disk
// Goes straight from RAM to Cloudinary → faster, cleaner
const uploadBuffer = ({ buffer, folder, options = {} }) => 
  new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      transformation: [
        { width: 1200, hieght: 800, crop: "fill", quality: "auto" },
      ],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    stream.end(buffer);
  });


// deleteImage
// Removes an image from Cloudinary using its publicId
// Called when manager deletes a hotel photo
const deleteImage=async(publicId)=>{
    const result=await cloudinary.uploader.destroy(publicId)
    logger.info('Image deleted from Cloudinary', {publicId,result})
    return result
}


module.exports={uploadBuffer,deleteImage}