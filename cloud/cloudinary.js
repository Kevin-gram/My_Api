const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name ,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret
});

const uploadFile = async (file, res) => {
    try {
        const result = await cloudinary.uploader.upload(file.path);
        return result;
    } catch(err){
        res.status(400).json({ message: err.message });
    }
}



module.exports = uploadFile;