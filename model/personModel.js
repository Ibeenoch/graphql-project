import mongoose from 'mongoose'

const personSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    posts:[
           {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ModelPost'
       }
   ],
   followers: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    }
],
following: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    }
],
},{
    timestamps: true,
})
const Person = mongoose.model('Person', personSchema)

export default Person;