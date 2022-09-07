import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Person from '../model/personModel.js'
import ModelPost from '../model/modelPost.js'
import jwt from 'jsonwebtoken'
import cookie from 'cookie-parser'
import Profile from '../model/profileModel.js'


export const registerUser = async (req, res) =>{
    try {
        const { name, email, password } = req.body

        if(!name || !email || !password){
            res.status(400).json({message:  'please add all fields'})
        }

        const userExist = await Person.findOne({ email })

        if(userExist){
            res.status(400).json({message:  'user already exist'})
        }

        const salt = await bcrypt.genSalt(10)

        const hashPassword = await bcrypt.hash(password, salt)

        

        const user = await Person.create({
            name, 
            email,
            password: hashPassword,
            
    
        })

     if(user){
        res.status(201).json({ 
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
         }) 
     }   
        
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
}

const generateToken = (_id) => {
return jwt.sign( {_id}, process.env.JWT_SECRET, {
    expiresIn: '5d'
})
}

export const login = async (req, res) => {
    try {
     const   { email, password } = req.body

        if(!email || !password){
            res.status(400)
            throw new Error('please include your email and password')
        }
        
        const userExist = await Person.findOne({ email })

        if(!userExist){
            res.status(400)
            throw new Error(' user does not exist')
        }

        const passwordMatch = await bcrypt.compare(password, userExist.password)

        if(!passwordMatch){
            res.status(400)
            throw new Error('password do not match')
        }

       const token = generateToken(userExist._id)

       res.status(200).cookie('token', token, {
           expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
       , httpOnly: true }).json({
           userExist, 
           token,
       })


    } catch (error) {
        res.status(500).json({ message: error.message})

    }
}

export const logout = async(req, res) => {
    try {
        res.status(200).cookie('token', null, {
            expires: new Date(Date.now()), httpOnly: true
        }).json({
            message: 'you have successfully logged out'
        })
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
}

export const deleteUser = async(req, res) => {
    try {
        const user = await Person.findById(req.user._id)

        const post = user.posts;

        for( let i=0; i<post.length; i++){
            const posts = await ModelPost.findById(post[i])
            await posts.remove()
        }
        
        const profile = await Profile.findOne({ owner: req.user._id })

       await profile.remove()

        await user.remove()

        res.status(200).json({
            message: 'user deleted'
        })


    } catch (error) {
        res.status(500)
        throw new Error(error)
        
    }
}

export const followAndUnfollowUser = async(req, res) => {
    try {

        const user = await Person.findById(req.user._id)

        if(req.params.id.toString() === req.user._id.toString()){
            res.status(405)
            throw new Error('not allowed')
        }

        const otheruser = await Person.findById(req.params.id) //user._id

        if(!otheruser){
            res.status(400)
            throw new Error('user not found')
        }

        if(user.following.includes(otheruser._id)){
            const findIndex = user.following.indexOf(otheruser._id)
            user.following.splice(findIndex, 1)
            await user.save()

          const otherIndex =  otheruser.followers.indexOf(user._id)

          otheruser.followers.splice(otherIndex, 1)
          await otheruser.save()

          res.status(200).json({
            message: 'user unfollowed',
            user,
            otheruser,
        })
        }else{
            user.following.push(otheruser._id)
            await user.save()
            
            otheruser.followers.push(user._id)
            await otheruser.save()

            res.status(200).json({
                message: 'user followed',
                user,
                otheruser,
            })
        }


       
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
}