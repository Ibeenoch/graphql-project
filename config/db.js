import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const conn =  mongoose.connect(process.env.MONGO_URL).then((con) => {
            console.log(`mongoDB connected on : ${con.connection.host}`)
        })
        
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export default connectDB