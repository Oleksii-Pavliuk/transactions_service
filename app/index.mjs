import config from "./config/config.mjs";
import amqp from "amqplib";
import express from "express";
import { register as registerConsul } from "./consul/consul-connection.mjs";
import { otelReg } from "./opentelemetry-tracing.mjs"
import { handleNewTransactionEvent } from "./handlers/handle-new-transaction.mjs"

/* =================
   SERVER SETUP
================== */
otelReg();
const app = express();
const PORT = config.get("port");
const AMQPHOST = config.get("amqphost");
const AMQPPORT = config.get("amqpport");

// Queue names

app.use(express.json());

// Run consuming function

main("transactions").catch((err) => console.log(err));

async function main(queueName) {
	/* ======================
     START RABBIT CONSUMER
  =========================*/
	const conn = await amqp.connect(`amqp://${AMQPHOST}:${AMQPPORT}`);

	const ch = await conn.createChannel();
	await ch.assertQueue(queueName);

	/* ======================
     START HANDLE MESSAGES
  =========================*/
	ch.consume(queueName, async (msg) => {
		await handleMessageConsume(ch, msg, { transaction: handleNewTransactionEvent });
	});
}


export async function handleMessageConsume(channel, msg, handlers) {
	if (msg !== null) {
		const handler = handlers[msg.properties.type]; //When sending new message specify type "transaction"

		if (handler) {
			await handler(msg.content.toString());
		} else {
			console.log(
				`Message with unhandled \`type\` received: ${msg.properties.type}. Ignoring...`
			);
		}

		channel.ack(msg);
	} else {
		console.log("Consumer cancelled by server");
	}
}


/* ======
   ROUTES
========*/
app.get("/health", (_req, res) => {
	res.sendStatus(200);
});

/* =================
   SERVER START
================== */
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
	registerConsul();
});

export default app;
