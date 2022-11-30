import express from 'express'
import { allUser, deleteUser, followAndUnfollowUser, login, logout, registerUser, findFollowing, findFollowers, findAUser } from '../controller/userController.js';
import { protect } from '../middleware/authmiddleware.js';

const userRouter = express.Router()

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(login)
userRouter.route('/').get(protect, allUser)
userRouter.route('/delete').delete(protect, deleteUser)
userRouter.route('/follow/:id').put(protect, followAndUnfollowUser)
userRouter.route('/following').get(protect, findFollowing)
userRouter.route('/followers').get(protect, findFollowers)
userRouter.route('/logout').get(protect, logout)
userRouter.route('/findperson/:id').get(protect, findAUser)



export default userRouter;