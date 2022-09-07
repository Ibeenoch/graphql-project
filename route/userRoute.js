import express from 'express'
import { deleteUser, followAndUnfollowUser, login, logout, registerUser } from '../controller/userController.js';
import { protect } from '../middleware/authmiddleware.js';

const userRouter = express.Router()

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(login)
userRouter.route('/delete').delete(protect, deleteUser)
userRouter.route('/:id').put(protect, followAndUnfollowUser)

userRouter.route('/logout').get(logout)

export default userRouter;