const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const Projects = require('./project');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    emails: {
        type: String,
        required: true,
        unique: true
    },
    college: {
        type: String,
        required: true,
    },
    dept: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image:
    {
        data: Buffer,
        contentType: String
    },
    pro_id:{
        type :Array,
    },
    // emailVerified: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // }
});


module.exports = mongoose.model('User', userSchema);
