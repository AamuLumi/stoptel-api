const Koa = require('koa');

const TaskManager = require('./tools/tasks');
const VersionManager = require('./tools/versionManager');
const db = require('../../packages/db');

const app = new Koa();
const VERSIONS_UPDATES_THRESHOLD = [1000, 100, 10, 1];

app.use(async (ctx, next) => {
	switch (ctx.method) {
		case 'GET':
			switch (ctx.path) {
				case '/updateRoutes':
					if (!ctx.query?.currentVersion) {
						ctx.status = 400;
						ctx.body = `Missing parameter: currentVersion`;

						return;
					}

					const currentVersion = parseInt(ctx.query.currentVersion);

					if (isNaN(currentVersion)) {
						ctx.status = 400;
						ctx.body = `Invalid parameter: currentVersion`;

						return;
					}

					const lastVersion = VersionManager.CurrentVersion;
					let tmpVersion = currentVersion;
					let versionDiff = lastVersion - currentVersion;
					const versionsToLoad = [];

					while (versionDiff > 0) {
						for (let i = 0; i < VERSIONS_UPDATES_THRESHOLD.length; i++) {
							const versionThreshold = VERSIONS_UPDATES_THRESHOLD[i];

							if (
								tmpVersion % versionThreshold === 0 &&
								versionDiff >= versionThreshold
							) {
								versionsToLoad.push([tmpVersion, tmpVersion + versionThreshold]);
								tmpVersion += versionThreshold;
								versionDiff -= versionThreshold;

								break;
							}
						}
					}

					ctx.status = 200;
					ctx.body = versionsToLoad;
			}
	}

	await next();
});

db.connect()
	.then(() => VersionManager.init())
	.then(() => TaskManager.init())
	.then(() => app.listen(process.env.PORT || 3001))
	.then(() => console.log(`Server started on http://localhost:${process.env.PORT || 3001}`))
	.catch((e) => console.error(e));
