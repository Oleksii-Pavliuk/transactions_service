import config from "./config/config.mjs";
import amqp from "amqplib";
import express from "express";
import { query } from "./db/index.mjs";

/* =================
   SERVER SETUP
================== */
const app = express();
const PORT = config.get("port");
const AMQPHOST  = config.get("amqphost");
const AMQPPORT = config.get("amqpport"); 

// Queue names
const producers = [
  "FiatTransactions",
  "ETHTransactions",
  "FiatWithdraws",
  "ETHWithdraws",
  "FiatDeposits",
  "ETHDeposits"
]

app.use(express.json());

for (let producer of producers){
  main(producer).catch((err) => console.log(err));
}

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
  const conn = await amqp.connect(
    `amqp://${AMQPHOST}:${AMQPPORT}`
  );

  const chFiatTransactions = await conn.createChannel(queueName);
  await chFiatTransactions.assertQueue(queueName);

  /* ======================
     START HANDLE MESSAGES
  =========================*/
  chFiatTransactions.consume(queueName, async (msg) => {
    await handleMessageConsume(queueName, msg, handlers = {
      [queueName] : handleNewMessageEvent,
    });
  });
}

export async function handleMessageConsume(channel, msg, handlers) {
  if (msg !== null) {
    const handler = handlers[msg.properties.type];

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

}





/* =================
   SERVER START
================== */
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

export default app;
