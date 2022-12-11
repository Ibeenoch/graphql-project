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

postRouter.route('/post/create').post( protect, uploadImage.single('img'), async (req, res) => {
  console.log(req.file)
  console.log(req.body)
  try {

    if(!req.file){
        const postz = await ModelPost.create({
            post: req.body.post,
            owner: req.user._id
        })
        console.log(postz)
 
     const user = await Person.findById(req.user._id)
 
     user.posts.push(postz._id)
     await user.save()
        res.status(201).json({
            postz
         })
    }
   
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path)
        const postz = await ModelPost.create({
                   post: req.body.post,
                   img: {
                       url: result.secure_url,
                       public_id: result.public_id
                   },
                   owner: req.user._id
               })
               console.log(postz)
        
            const user = await Person.findById(req.user._id)
        
            user.posts.push(postz._id)
            await user.save()
               res.status(201).json({
                   postz
                })   
    }
 
   } catch (error) {
       console.log({ message: error.message})
   }
} )

//update post
postRouter.route('/postupdate/:id').put(protect, uploadImage.single('img'), async (req, res, next) =>{
    try {
        console.log('Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores itaque illum odit temporibus labore dignissimos neque sint eaque culpa iste.')
       
        const oldId = await ModelPost.findById(req.params.id)
        console.log(oldId)
     if(req.file){   
        console.log(req.file)
         await cloudinary.uploader.destroy(oldId.img.public_id) 
        const result = await cloudinary.uploader.upload(req.file.path)
        const postData = {
            post: req.body.post || oldId.post ,
            img:  {
                url: result.url || oldId.img.url,
                public_id: result.public_id || oldId.img.public_id,
            },
            owner: req.user._id,
        }

        if(oldId.owner.toString() !== req.user._id.toString()){
            res.status(409)
            throw new Error('not authorized')
        }
       
        const updatedPost = await ModelPost.findByIdAndUpdate(req.params.id, postData, {new: true})
        console.log({updatedPost: updatedPost})
      
        res.status(200).json({updatedPost})
    }else{
      const result = oldId.img
       console.log(result)
       const postData = {
        post: req.body.post ,
        owner: req.user._id,
    }

    if(oldId.owner.toString() !== req.user._id.toString()){
        res.status(409)
        throw new Error('not authorized')
    }
   
    const updatedPost = await ModelPost.findByIdAndUpdate(req.params.id, postData, {new: true})
    console.log({updatedPost: updatedPost})
  
    res.status(200).json({updatedPost})
    } 

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
      
        res.status(200).json({
            message: 'post deleted',
             post
            })

    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})

//get my post and post of following 
postRouter.route('/allpost').get( protect, async (req, res) => {
    try {
        
        const user = await Person.findById(req.user._id)

        let ids = [...user.following, user._id]

          
          console.log(ids)
        const allPost = await  ModelPost.find({ owner: {
            $in: ids,
        } }).sort({ createdAt: -1 }).populate('owner').exec()

        res.status(200).json({
            allPost
        })
    } catch (error) {
        console.log(error.message)
    }

})

postRouter.route('/viewallpost').get( protect, async (req, res) => {
    try {
       
        const allPost = await  ModelPost.find({ }).sort({ createdAt: -1 }).populate('owner').exec()

        res.status(200).json({
            allPost
        })
    } catch (error) {
        console.log(error.message)
    }

})

//get each post of your 
postRouter.route('/post/:id').get( protect, async (req, res) => {
    try {
  
          
        const allPost = await  ModelPost.find({ owner: {
            $in: req.params.id,
        } }).sort({ createdAt: -1 }).populate('owner').exec()
         console.log(allPost)
        res.status(200).json({
            allPost
        })
    } catch (error) {
        console.log(error.message)
    }

})

//get my post 
postRouter.route('/mypost').get( protect, async (req, res) => {
    try {
  
          
        const allPost = await  ModelPost.find({ owner: {
            $in: req.user._id,
        } }).sort({ createdAt: -1 }).populate('owner').exec()
         console.log(allPost)
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
            const  liked = post.likes
            res.status(200).json({ post })
        }else{
            post.likes.push(user._id)
            await post.save()
             const  liked = post.likes
            res.status(200).json({ post })
        }

      
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

postRouter.route('/comment/:id').post(protect, async (req, res) => {
    try {
        console.log(req.body)
        console.log(req.params.id)
        const post = await ModelPost.findById(req.params.id) // not req.user._id because the post should be any post, not just the users post

        if(!post){
            res.status(404)
            throw new Error('post no found')
        }
    
            post.comments.push({
               user: req.user._id,
             comment: req.body.comment,
                
            })

            await post.save()
            console.log(post.comments)
            res.status(200).json({
                message: 'comment added',
               comments: post.comments,
            })
        


    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

postRouter.route('/getcomment/:id').get( protect, async (req, res) => {
    try {
       
        const allPost = await  ModelPost.find({ _id:req.params.id }).sort({ createdAt: -1 }).populate('comments').exec()
      const comments = allPost.comments
        res.status(200).json({
            allPost
        })
    } catch (error) {
        console.log(error.message)
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