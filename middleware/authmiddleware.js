import jwt from 'jsonwebtoken'
import express from 'express'
import Person from '../model/personModel.js'

export const protect = async(req, res, next) => {
try {
   const token = req.headers.authorization.split(' ')[1]

   const decode = jwt.verify(token, process.env.JWT_SECRET)

   req.user = await Person.findById(decode._id)

   next()
} catch (error) {
   res.status(500).json({ message: error.message})
}
}