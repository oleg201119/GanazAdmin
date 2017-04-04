var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	job_id: {
		type: String,
		required: true
	},
    type: {
        type: String
    },
    sender_user_id: {
        type: String,
        required: true
    },
    receivers: [String], // receivers' user_id list.
    message: {
        type: String
    },
    message_translated: {
        type: String
    },
    auto_translate: {
        type: Boolean
    },
    datetime: {
        type: Date
    }
});

module.exports = mongoose.model('Message', MessageSchema);