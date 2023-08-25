import ip from "ip";
import Consul from "consul";
import { v4 as uuidv4 } from "uuid";

import config from "../config/config.mjs";

const CONSUL_HOST = config.get("consulHost") 
const CONSUL_PORT= config.get("consulPort") 
const SERVICE_HOST= ip.address();
const SERVICE_PORT= config.get("port");
const HEALTH_CHECK_URL = `http://${SERVICE_HOST}:${SERVICE_PORT}/health`;
const CONSUL_ID = uuidv4();
const CONSUL_SERVICE_NAME= config.get("ServiceName");

let consul;
if (CONSUL_SERVICE_NAME) {
	consul = new Consul({
		host: CONSUL_HOST,
		port: CONSUL_PORT,
	});
}

const serviceDefinition = {
	name: CONSUL_SERVICE_NAME ?? "",
	address: SERVICE_HOST,
	port: SERVICE_PORT,
	id: CONSUL_ID,
	check: {
		http: HEALTH_CHECK_URL,
		interval: "15s",
	},
};

const doGracefulShutdown = async () => {
	if (!consul) return;
	await consul.agent.service.deregister({ id: CONSUL_ID });
};

export const register = async () => {
	if (!consul) return;
	await consul.agent.service.register(serviceDefinition);
	console.log("Registred with Consul")
	process.on("SIGTERM", doGracefulShutdown);
	process.on("SIGINT", doGracefulShutdown);
};
