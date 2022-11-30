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

        console.log({ email, password, name })
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

        console.log(user)
        const token = generateToken(user._id)
 
         res.status(201).json({
            user, 
            token,
        })
        
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
}

const generateToken = (_id) => {
return jwt.sign( {_id}, process.env.JWT_SECRET)
}

export const login = async (req, res) => {
    try {
     const   { email, password } = req.body
     console.log({ email, password })

        if(!email || !password){
            res.status(400)
            throw new Error('please include your email and password')
        }
        
        const user = await Person.findOne({ email })

        if(!user){
            res.status(400)
            throw new Error(' user does not exist')
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch){
            res.status(400)
            throw new Error('password do not match')
        }

       const token = generateToken(user._id)
       console.log(user)
       console.log(token)
       res.status(200).cookie('token', token, { expires: new Date(Date.now() + 3*60*60*1000), httpOnly: true }).json({
           user, 
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
console.log('deleted user')

    try {
        const user = await Person.findById(req.user._id).select('-password')

        const post = user.posts;
        
        for( let i=0; i<post.length; i++){
            console.log(post)
            await ModelPost.findById(post[i]).remove()
        

        }
        console.log('Post deleted')
        const profile = await Profile.findOne({ owner: req.user._id })

       await profile.remove()
       console.log('profile deleted')
       
        await user.remove()
        console.log('user deleted')


        res.status(200).json({
            message: 'user deleted'
        })


    } catch (error) {
        res.status(500)
        throw new Error(error)
        
    }
}

export const allUser = async(req, res) => {
    try {
       const allusers = await Person.find().select('-password').populate('profile').exec()
console.log(allusers)
       res.status(200).json(allusers)
    } catch (error) {
        res.status(500)
        throw new Error(error) 
    }
}

export const findFollowing = async(req, res) => {
    try {
       const user = await Person.find({ _id: req.user._id }).select('-password').populate('following').exec()
console.log(user)
       res.status(200).json(user)
    } catch (error) {
        res.status(500)
        throw new Error(error) 
    }
}

export const findFollowers = async(req, res) => {
    try {
       const user = await Person.find({ _id: req.user._id }).select('-password').populate('followers').exec()
console.log(user)
       res.status(200).json(user)
    } catch (error) {
        res.status(500)
        throw new Error(error) 
    }
}

export const findAUser = async(req, res) => {
    try {
       const user = await Person.find({ _id: req.params.id }).select('-password').exec()
console.log(user)
       res.status(200).json(user)
    } catch (error) {
        res.status(500)
        throw new Error(error) 
    }
}

export const followAndUnfollowUser = async(req, res) => {
    try {

        const user = await Person.findById(req.user._id).select('-password')

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
 console.log({user, otheruser})
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
           console.log({user, otheruser})
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

