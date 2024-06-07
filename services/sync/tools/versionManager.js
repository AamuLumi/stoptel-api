const db = require('../../../packages/db');

class VersionManager {
	#currentVersion;

	constructor() {}

	async init() {
		const versionEntry = await db.version.findOne({}, { sort: { version: -1 } });

		if (!versionEntry) {
			console.warn('No version found. Check if everything is correctly working');

			this.#currentVersion = 0;
		} else {
			this.#currentVersion = versionEntry.version;

			console.log(`Last version: ${this.#currentVersion}`);
		}
	}

	async increment() {
		this.#currentVersion++;

		await db.version.insertOne({
			version: this.#currentVersion,
			date: Date.now(),
		});

		return this.#currentVersion;
	}

	get CurrentVersion() {
		return this.#currentVersion;
	}
}

module.exports = new VersionManager();
