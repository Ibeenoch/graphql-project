import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import postRouter from './route/postRoute.js'
import userRouter from './route/userRoute.js'
import errorhandler from './middleware/errormiddleware.js'
import connectDB from './config/db.js'
import profileRouter from './route/profileRoute.js'



dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded( { extended: false} ))
app.use(cors())

const __filename = fileURLToPath(import.meta.url)

const dirname = path.dirname(__filename)

//http://localhost:3030/user/delete
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(dirname, '../socialapp/build')))

  app.get('*', (req, res) => {
      res.sendFile(
        path.resolve(__dirname, '../', 'socialapp', 'build', 'index.html')
      )
  })
}else{
    app.get('/', (req, res) => {
    res.send('please set to production')
    })
}

connectDB()
const PORT = process.env.PORT || 3030

app.use(errorhandler)

app.use('/api', postRouter )
app.use('/user', userRouter )
app.use('/profile', profileRouter)

app.listen(PORT, () => { console.log(`app is running on port ${PORT}`) })