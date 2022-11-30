import jwt from 'jsonwebtoken'
import express from 'express'
import Person from '../model/personModel.js'
import cookieParser from 'cookie-parser'

export const protect = async(req, res, next) => {
try {
   console.log(req.headers)
   console.log(req.headers.authorization)
   const token = req.headers.authorization.split(' ')[1]
console.log(token)
   const decode = jwt.verify(token, process.env.JWT_SECRET)
   console.log(decode)
   req.user = await Person.findById(decode._id).select('-password')
   console.log(req.user)
   next()
} catch (error) {
   res.status(500).json({ message: error.message})
}
}