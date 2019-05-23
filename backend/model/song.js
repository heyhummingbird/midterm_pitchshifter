const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

// Creating a schema, sort of like working with an ORM
const SongSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Name field is required.']
	},
	content: {
		type: String,
		required: [true, 'Content field is required.']
	}
})

// Creating a table within database with the defined schema
const Song = mongoose.model('song', SongSchema)

// Exporting table for querying and mutating
module.exports = Song