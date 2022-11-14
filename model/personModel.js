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
   profile:{
     type: [ {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Profile'
} ],
validate: [(val) => val.length <= 1, 'only one profile need'],
},
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
handle: {
    type: String,
    unique: true
},
bio: String,
profilepics:  {
    url: String,
    public_id: String,
},
coverphoto: {
    url: String,
    public_id: String,
},
},{
    timestamps: true,
})
const Person = mongoose.model('Person', personSchema)

export default Person;