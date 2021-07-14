const { Schema, model } = require('mongoose');

const MySchema = new Schema({
    ID: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    temporary: {
        type: String,
        required: true,
        default: false
    },
    time: {
        type: Date,
        required: false,
        default: 0
    }
});

module.exports = model('BannedList', MySchema, 'BannedList');
