const fs = require('fs');
const path = require('path');

const db = require('../../../../packages/db');
const VersionManager = require('../versionManager');

function getFileVersionPath(version, toVersion = null) {
	return path.join(
		process.env.FILE_STORAGE_PATH || path.join(__dirname, 'fileStorageTmp'),
		`${version}-${toVersion ? toVersion : version + 1}.csv`,
	);
}

async function createAggregateDump(fromVersion, toVersion) {
	console.log('create agg', fromVersion, toVersion);
	const versionFile = fs.createWriteStream(getFileVersionPath(fromVersion, toVersion));
	let current = fromVersion;

	//TODO: Add an optimized way to remove duplicate entries in files
	// For example, V1 can have 0900000000, V2 too and V3 too, so
	// 	we should keep only V3, but we have to parse CSV to do that.

	await new Array(toVersion - fromVersion)
		.fill(0)
		.map((_, i) => fromVersion + i)
		.reduce(
			(p, v) =>
				p.then(
					() =>
						new Promise((resolve, reject) => {
							const readStr = fs.createReadStream(path.join(getFileVersionPath(v)));

							readStr.on('data', (chunk) => {
								versionFile.write(chunk.toString());
							});

							readStr.on('end', () => {
								resolve();
							});

							readStr.on('error', (err) => {
								reject(err);
							});
						}),
				),
			Promise.resolve(),
		);

	versionFile.close();
}

module.exports = {
	name: 'createSyncDumps',
	cronTime: '* 20 * * * *',

	execute: async () => {
		if ((await db.phoneNumbersChanges.countDocuments({})) === 0) {
			return;
		}

		const changes = db.phoneNumbersChanges.find({});

		if (
			!process.env.FILE_STORAGE_PATH &&
			!fs.existsSync(path.join(__dirname, 'fileStorageTmp'))
		) {
			fs.mkdirSync(path.join(__dirname, 'fileStorageTmp'));
		}

		const currentVersion = VersionManager.CurrentVersion;
		const versionFile = fs.createWriteStream(getFileVersionPath(currentVersion));

		for await (const doc of changes) {
			versionFile.write(`${doc.number}\t${JSON.stringify(doc.reports)}\n`);
		}

		versionFile.close();

		await db.phoneNumbersChanges.deleteMany({});

		if ((currentVersion + 1) % 10 === 0) {
			await createAggregateDump(currentVersion + 1 - 10, currentVersion + 1);
		}

		if ((currentVersion + 1) % 100 === 0) {
			await createAggregateDump(currentVersion + 1 - 100, currentVersion + 1);
		}

		if ((currentVersion + 1) % 1000 === 0) {
			await createAggregateDump(currentVersion + 1 - 1000, currentVersion + 1);
		}

		await VersionManager.increment();
	},
};
