const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    
    desc: {
        type: String,
        required: true,
    },
    technology: {
        type: String,
        required: true
    },
    image:
    {
        data: Buffer,
        contentType: String
    },
    
});

module.exports = mongoose.model('project', projectSchema);