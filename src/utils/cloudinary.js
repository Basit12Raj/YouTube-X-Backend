import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

          
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  // ===>>> The Function About File upload on Cloudinary from local storage: 
  const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if (!localFilePath) return null;

        //File upload Method on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })

        //when file is uploaded successfully
        // console.log("File uploaded successfully", response.url);

        // ==>> unlink/ Delete file from where they were uploaded
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) //Remove temporary file from local filesystem if operation got failed
        return null;
    }
  }
  

  export {uploadOnCloudinary}