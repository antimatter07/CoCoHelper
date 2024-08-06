const mongoose = require('mongoose');

const UserSecuritySchema = new mongoose.Schema({
    pnumber: {
        type: Number,
        required: true,
        unique: true
    },
    security_questions: [{
        type: String,
        required: true

    }],
    security_answers: [{
        type: String,
        required: true

    }],
    previous_password: {
        type: String,
        required: false
    },
    new_password_age: {
        type: Date,
        required: true
    },
    last_login_attempt: {
        type: Date,
        required: true
    },
});

// UserSecuritySchema.virtual('last_login').get(function() {
//     return this.last_login_attempt ? this.last_login_attempt.toString() : '';
// });

const UserSecurity = mongoose.model('UserSecurity', UserSecuritySchema);

module.exports = UserSecurity;