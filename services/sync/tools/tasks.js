const cron = require('node-cron');

const createSyncDumps = require('./tasks/createSyncDumps');

const Tasks = [createSyncDumps];

class TaskManager {
	constructor() {
		this.tasks = {};
	}

	init() {
		createSyncDumps.execute();
		cron.schedule(createSyncDumps.cronTime, createSyncDumps.execute);
	}
}

const instance = new TaskManager();

module.exports = new TaskManager();
