import express from 'express'
import { getallMusic } from '../controller/musicController.js';

const musicRouter = express.Router()


musicRouter.route('/').get(getallMusic)

export default musicRouter;