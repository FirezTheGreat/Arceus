const { Schema, model } = require('mongoose');

const MySchema = new Schema({
    ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    createdAt: {
        type: Date,
        required: true,
        default: 0
    },
    User_ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    Channel_ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    }
});

module.exports = model('ModMailList', MySchema, 'ModMailList');