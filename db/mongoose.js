const mongoose = require('mongoose');

const connectToDatabase = async () => {
	mongoose.set('strictQuery', true)
	mongoose.connect(
		'mongodb://localhost:27017',
		{
			useNewUrlParser: true
		}
	)
}

module.exports = connectToDatabase
