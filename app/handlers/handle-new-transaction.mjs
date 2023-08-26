
import { db } from "../db/postgres-connections.mjs.mjs";

/* ================================
   INDIVIDUAL MESSAGE TYPE HANDLERS
==================================*/
export async function handleNewTransactionEvent(messageContent) {
	console.log("Received new_message: ", messageContent);
	const msg = JSON.parse(messageContent);

	const destination = msg.destination;

    console.log(destination);
	// db(destination)
	// 	.insert(msg.transaction)
	// 	.then(() => {
	// 		console.log("Success:");
	// 		console.log(msg);
	// 	})
	// 	.catch((err) => {
	// 		console.log("Error:");
	// 		console.error(err);
	// 	})
	// 	.finally(() => {
	// 		db.destroy(); //Should i close or not ?
	// 	});
}