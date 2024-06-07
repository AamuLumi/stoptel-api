const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI ?? 'mongodb://stoptel:!stoptel-dev!@localhost:27017';

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function connect() {
	console.log('Trying to connect to MongoDB...');
	await client.connect();
	await client.db('admin').command({ ping: 1 });
	customClient.db = await client.db('stop-tel');
	customClient.phoneNumbers = await client.db('phoneNumbers').collection('phoneNumbers');
	customClient.phoneNumbersChanges = await client
		.db('phoneNumbers')
		.collection('phoneNumbersChanges');
	customClient.version = await client.db('phoneNumbers').collection('version');

	console.log('Connected to MongoDB');
}

const customClient = {
	client,
	db: null,
	phoneNumbers: null,
	phoneNumbersChanges: null,
	version: null,

	connect,
	disconnect: async () => client.close(),
};

module.exports = customClient;
