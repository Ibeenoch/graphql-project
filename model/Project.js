import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    }
},{
    timestamps: true
})

const ProjectModel = mongoose.model('ProjectModel', projectSchema);

export default ProjectModel