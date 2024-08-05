const mongoose = require('mongoose');

const SecurityQuestionsSchema = new mongoose.Schema({
    q_num: {
        type: String,
        required: true,
        unique: true
    },
    question: {
        type: String,
        required: true,
        unique: true
    },
});

const SecurityQuestions = mongoose.model('SecurityQuestions', SecurityQuestionsSchema);

module.exports = SecurityQuestions;