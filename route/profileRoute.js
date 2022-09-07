import express from 'express'
import { protect } from '../middleware/authmiddleware.js'
import multer from 'multer'
import Person from '../model/personModel.js'
import Profile from '../model/profileModel.js'
import cloudinaryz from '../middleware/clodinary.js'
import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
import uploadImage from '../middleware/multer.js'
import { uploads } from '../middleware/clodinary.js'
import fs from 'fs'

dotenv.config()

const profileRouter = express.Router()


//create user profile

 profileRouter.route('/create').post( protect, uploadImage.array('image', 5), async (req, res) => {
 
    try {
        const uploader = async(path) => await uploads(path, 'Images')

        if(req.method === 'POST'){
            const urls = []

            //req.files is an array
            const files = req.files
            

            for(const file of files){
                const { path } = file

                const newPath = await uploader(path)
               

               urls.push(newPath)

               fs.unlinkSync(path)
           }  

           const createProfile = await Profile.create({
            handle: req.body.handle,
            bio: req.body.bio,
            location: req.body.location,
            profilepics:  {
                url: urls[0].url,
                public_id: urls[0].id,
            },
            coverphoto: {
                url: urls[1].url,
                public_id: urls[1].id,
            },
            owner: req.user._id,
        })

                res.status(200).json({
                    message: 'image upload sucessful',
                  createProfile,
                })
          
        }else{
            res.status(405).json({
                err: 'image upload not sucessful',
                
            })
        }
         

    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

//get my profile
profileRouter.route('/myprofile/:id').get( async(req, res) => {
    try {
        const fetchProfile = await Profile.find({ owner: req.params.id})

        res.status(200).json({
            message: 'others post fetched',
            fetchProfile,
        })
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

//updating profilepics
profileRouter.route('/updateprofilepics/:id').put(protect, uploadImage.single('image'), async (req, res) => {


    try {

        const profile = await Profile.findOne({ owner: req.user._id })
        if(!profile){
            res.status(404)
            throw new Error('profile not found!')
        }

        var ids = profile.profilepics.public_id;

        const deleted = await cloudinary.v2.uploader.destroy(ids)
        console.log(deleted)  

const result = await cloudinaryz.v2.uploader.upload(req.file.path)



   const updateProfile = await Profile.findByIdAndUpdate(profile._id, {
    profilepics:  {
        url: result.secure_url,
        public_id: result.public_id,
    },
    
}, { new: true })

        res.status(200).json({
            message: 'profile pics updated successfully',
            updateProfile,
        })

    } catch (error) {
        res.status(500)
        throw new Error(error)
    }

  
})


//updating coverphoto
profileRouter.route('/updatecoverphoto/:id').put(protect, uploadImage.single('image'), async (req, res) => {


    try {

        const profile = await Profile.findOne({ owner: req.user._id })
        if(!profile){
            res.status(404)
            throw new Error('profile not found!')
        }

        var ids = profile.coverphoto.public_id;

const deleted = await cloudinary.v2.uploader.destroy(ids)

console.log(deleted)

const result = await cloudinaryz.v2.uploader.upload(req.file.path)



   const updateProfile = await Profile.findByIdAndUpdate(profile._id, {
    coverphoto:  {
        url: result.secure_url,
        public_id: result.public_id,
    },
    
}, { new: true })

        res.status(200).json({
            message: 'coverphoto updated successfully',
            updateProfile,
        })

    } catch (error) {
        res.status(500)
        throw new Error(error)
    }

  
})

profileRouter.route('/update/:id').put(protect, async(req, res) => {
    try {
        const profile = await Profile.findOne({ owner: req.user._id })

        if(!profile){
            res.status(404)
            throw new Error('profile do not exist')
        }

        const updatedProfile = await Profile.findByIdAndUpdate(profile._id, {
            handle: req.body.handle ? req.body.handle : profile.hbioandle,
            bio: req.body.bio ? req.body.bio : profile.bio,
            location: req.body.location ? req.body.location : profile.location,
        }, { new: true })


        res.status(200).json({
            message: 'profile updated',
            updatedProfile,
        })
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})



export default profileRouter
