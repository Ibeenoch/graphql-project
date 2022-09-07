import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Person from './personModel.js'

const modelPostSchema = new mongoose.Schema({
message: String,
image: {
    url: String,
    public_id: String,
},
owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
},
likes: [
     {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
}
],
comments: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person'
        },    
        comment: {
            type: String,
            required: true
        },
    }
]
},{
    timestamps: true,
})

const ModelPost = mongoose.model('ModelPost', modelPostSchema)

export default ModelPost;