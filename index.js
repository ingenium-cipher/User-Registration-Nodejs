const app = require('./app');
const connectToDatabase = require('./db/mongoose');

const port = 3000;

app.listen(port, async () => {
	await connectToDatabase()
	console.log(`Server is up on port 3000`);
});
