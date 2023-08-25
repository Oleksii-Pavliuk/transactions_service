import config from "./config/config.mjs";
import amqp from "amqplib";
import express from "express";
import { db } from "./db/postgres-connections.mjs.mjs";
import { register as registerConsul } from "./consul/consul-connection.mjs";
import {otelReg} from "./opentelemetry-tracing.mjs"

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

main("transactions").catch((err) => console.log(err));

/* ======
   ROUTES
========*/
app.get("/health", (_req, res) => {
	res.sendStatus(200);
});

/* ===========
   SUBSCRIBERS
=============*/
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
		await handleMessageConsume(ch, msg, { transaction: handleNewMessageEvent });
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

/* ================================
   INDIVIDUAL MESSAGE TYPE HANDLERS
==================================*/
export async function handleNewMessageEvent(messageContent) {
	console.log("Received new_message: ", messageContent);
	const msg = JSON.parse(messageContent);

	const destination = msg.destination;

	db(destination)
		.insert(msg.transaction)
		.then(() => {
			console.log("Success:");
			console.log(msg);
		})
		.catch((err) => {
			console.log("Error:");
			console.error(err);
		})
		.finally(() => {
			db.destroy(); //Should i close or not ?
		});
}

/* =================
   SERVER START
================== */
app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
	registerConsul();
});

export default app;
