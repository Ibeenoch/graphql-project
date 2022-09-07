import express from 'express';
import multer from 'multer';
import ModelPost from '../model/modelPost.js';
import Person from '../model/personModel.js';
import { protect } from '../middleware/authmiddleware.js';
import Profile from '../model/profileModel.js';
import uploadImage from '../middleware/multer.js';
import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

dotenv.config()

 cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });





const postRouter = express.Router()

postRouter.route('/post/create').post( protect, uploadImage.single('image'), async (req, res, next) => {
  
   try {
        const result = await cloudinary.v2.uploader.upload(req.file.path)
       console.log(result)
       const postz = await ModelPost.create({
           message: req.body.message,
           image: {
               url: result.secure_url,
               public_id: result.public_id
           },
           owner: req.user._id
       })


    const user = await Person.findById(req.user._id)

    user.posts.push(postz._id)
    await user.save()




       res.status(200).json({
           postz,
           user, 
         
        })
   } catch (error) {
       console.log({ message: error.message})
   }
} )

//update post
postRouter.route('/postupdate/:id').put(protect, uploadImage.single('image'), async (req, res, next) =>{
    try {
        const oldId = await ModelPost.findById(req.params.id)

        console.log(oldId)

        await cloudinary.v2.uploader.destroy(oldId.image.public_id)

        const result = await cloudinary.v2.uploader.upload(req.file.path)

        console.log(result)

        const postData = {
            message: req.body.message || oldId.message ,
            image:  {
                url: result.secure_url || oldId.image.url,
                public_id: result.public_id || oldId.image.public_id,
            },
            owner: req.user._id,
        }

        if(oldId.owner.toString() !== req.user._id.toString()){
            res.status(409)
            throw new Error('not authorized')
        }
       
        const updatedPost = await ModelPost.findByIdAndUpdate(req.params.id, postData, {new: true})
      
        res.status(201).json({updatedPost})

    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})


//delete post
postRouter.route('/deletepost/:id').delete(protect,  async (req, res) =>{
    try {

      

        const post = await ModelPost.findById(req.params.id)

        if(post.owner.toString() !== req.user._id.toString()){
            res.status(409)
            throw new Error('not authorized')
        }
       
        const deletedPost = await ModelPost.findByIdAndRemove(req.params.id)
      
        res.status(201).json({message: 'post deleted'})

    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})

//get my post and post of following and followers
postRouter.route('/allpost').get( protect, async (req, res) => {
    try {
        
        const user = await Person.findById(req.user._id)

        let ids = user.following && user.followers && user._id

        const allPost = await  ModelPost.find({ owner: {
            $in: ids
        } }).sort({ createdAt: -1 }).populate('owner').exec()

        res.status(200).json({
            allPost
        })
    } catch (error) {
        console.log(error.message)
    }

})

//like and unlike post
postRouter.route('/post/likes/:id').put(protect, async(req, res) => {
    try {
        const user = await Person.findById(req.user._id)
        const post = await ModelPost.findById(req.params.id)


        if(post.likes.includes(user._id)){
            const findIndex = post.likes.indexOf(user._id)
            post.likes.splice(findIndex, 1)
            await post.save()
        }else{
            post.likes.push(user._id)
            await post.save()
        }

        res.status(200).json({
            post
        })
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

postRouter.route('/comment/:id').post(protect, async (req, res) => {
    try {
        const post = await ModelPost.findById(req.params.id) // not req.user._id because the post should be any post, not just the users post

        if(!post){
            res.status(404)
            throw new Error('post no found')
        }
    
            post.comments.push({
                comment: req.body.comment,
                user: req.user._id,
            })

            await post.save()
            res.status(200).json({
                message: 'comment added',
                post
            })
        


    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

postRouter.route('/updatecomment/:id').put(protect, async(req, res) => {
    try {
        const post = await ModelPost.findById(req.params.id) // not req.user._id because the post should be any post, not just the users post

        if(!post){
            res.status(404)
            throw new Error('post no found')
        }

        let commentIndex = -1;

        post.comments.forEach((element, index) => {
            if(element.user.toString() === req.user._id.toString() && element._id.toString() === req.body.commentId){ //post.comments[index]._id
                commentIndex = index
            }
        })
        console.log(commentIndex)

        if(commentIndex !== -1){
            post.comments[commentIndex].comment = req.body.comment
            await post.save()

            res.status(200).json({
                message: 'comment updated',
                post
            })
        }
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

postRouter.route('/deletecomment/:id').delete(protect, async(req, res) => {
    try {
        const post = await ModelPost.findById(req.params.id)

        if(!post){
            res.status(404)
            throw new Error('post no found')
        }

//if i am the owner of the post i should be able to delete any comment without authenticating
        if(post.owner.toString() === req.user._id){
            post.comments.forEach((element, index) => {
                if(element._id.toString() === req.body.commentId){
                return  post.comments.splice(index, 1)
                }
            })

            await post.save()
            res.status(200).json({
                message: 'others comment deleted',
                post,
            })
        }else{ //if i am not the owner of the post i should be able to delete only my comment with authenticating
            post.comments.forEach((element, index) => {
                if(element.user.toString() === req.body.userId &&  element._id.toString() === req.body.commentId){ //req,body.
                    return post.comments.splice(index, 1)
                }
            })
            await post.save()
            res.status(200).json({
                message: 'my comment deleted',
                post,
            }) 
        }



    } catch (error) {
        res.status(500)
        throw new Error(error)  
    }
})

export default postRouter;