import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    }
},{
    timestamps: true
})

const ClientModel = mongoose.model('ClientModel', clientSchema);

export default ClientModel;