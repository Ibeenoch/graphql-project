import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

dotenv.config()

 cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });

  export const uploads = (file, folder) => {
      return new Promise(resolve => {
          cloudinary.uploader.upload(file, (result) => {
              resolve({
                  url: result.url,
                  id: result.public_id,
              })
          }, {
              resource_type: 'auto',
              folder: folder
          })
      })
  }

  export default cloudinary