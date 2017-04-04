var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MyWorkerSchema = new Schema({
	company_user_id: {
		type: String,
		required: true
	},
	worker_user_id: {
		type: String
	}
});

module.exports = mongoose.model('MyWorker', MyWorkerSchema);