import mongoose from 'mongoose'
import Person from './personModel.js';
import ModelPost from './modelPost.js';


const profileSchema = mongoose.Schema({
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
    location: {
        type: String,
        default: 'the Earth'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
    },
}, {
    timestamps: true
})

const Profile = mongoose.model('Profile', profileSchema)

export default Profile;