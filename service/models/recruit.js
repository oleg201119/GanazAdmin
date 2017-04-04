var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RequestSchema = new Schema({
    job_ids: [String],
    broadcast: {
        type: Number
    },
    re_recruit_user_ids: [String]
});

var RecruitSchema = new Schema({
	request: {
		type: RequestSchema,
		required: true
	},
    received_user_ids: [String]
});

module.exports = mongoose.model('Recruit', RecruitSchema);