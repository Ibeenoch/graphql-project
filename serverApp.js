import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import postRouter from './route/postRoute.js'
import userRouter from './route/userRoute.js'
import errorhandler from './middleware/errormiddleware.js'
import connectDB from './config/db.js'
import profileRouter from './route/profileRoute.js'



dotenv.config()

connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded( { extended: false} ))
app.use(cors())

app.use('/public', express.static('public'))

const PORT = process.env.PORT || 5000

app.use(errorhandler)

app.use('/api', postRouter )
app.use('/user', userRouter )
app.use('/profile', profileRouter)


app.post('/img', (req, res) => {
    console.log(req.files)
    res.json({ meassage: 'great'})
})


app.listen(PORT, () => { console.log(`app is running on port ${PORT}`) })