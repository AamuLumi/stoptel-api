const db = require('../../../packages/db');

module.exports = async function reportNumber(number, type) {
	await db.phoneNumbers.updateOne(
		{
			number,
		},
		{
			$setOnInsert: {
				number,
			},
			$inc: {
				[`reports.${type}`]: 1,
			},
		},
		{
			upsert: true,
		},
	);

	const result = await db.phoneNumbers.findOne({ number });

	await db.phoneNumbersChanges.updateOne(
		{ number: result.number },
		{
			$set: result,
		},
		{ upsert: true },
	);
};
