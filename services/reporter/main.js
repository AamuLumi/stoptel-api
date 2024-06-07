const Koa = require('koa');

const reportNumber = require('./routes/report_post');
const Formatters = require('./tools/formatters');
const db = require('../../packages/db');

const app = new Koa();

app.use(async (ctx, next) => {
	switch (ctx.method) {
		case 'POST':
			switch (ctx.path) {
				case '/report':
					console.log(ctx.query);
					if (!ctx.query?.number) {
						ctx.status = 400;
						ctx.body = `Missing parameter: number`;

						return;
					}

					const formattedPhoneNumber = Formatters.formatPhoneNumber(ctx.query.number);

					if (!formattedPhoneNumber) {
						ctx.status = 400;
						ctx.body = `Invalid parameter: number`;

						return;
					}

					if (!ctx.query.type) {
						ctx.status = 400;
						ctx.body = `Missing parameter: type`;

						return;
					}

					switch (ctx.query.type) {
						case 'spam':
						case 'sales':
						case 'malicious':
							break;
						default:
							ctx.status = 400;
							ctx.body = `Invalid parameter: type`;

							return;
					}

					await reportNumber(formattedPhoneNumber, ctx.query.type);

					ctx.status = 200;
					ctx.body = 'Report added';
			}
	}

	await next();
});

db.connect()
	.then(() => app.listen(process.env.PORT || 3000))
	.then(() => console.log(`Server started on http://localhost:${process.env.PORT || 3000}`))
	.catch((e) => console.error(e));
