import convict from "convict";



const config = convict({
	env: {
		doc: "Environoment for application",
		format: ["development", "production", "test"],
		default: "test",
		env: "NODE_ENV",
	},
	port: {
		doc: "The port to bind.",
		format: "port",
		default: null,
		env: "PORT",
		arg: "port",
	},	
	origin: {
		doc: "Allowed CORS servers",
		format: String,
		default: "*",
		env: "ORIGIN",
		arg: "origin",
	},
	pguser: {
		doc: "The postgres user that the application will use",
		format: "*",
		default: null,
		env: "PGUSER",
		arg: "pguser",
	},
	pghost: {
		doc: "The host of the postgres server",
		format: "*",
		default: null,
		env: "PGHOST",
		arg: "pghost",
	},
	pgport: {
		doc: "The port on which the postgres database will be listening",
		format: "port",
		default: null,
		env: "PGPORT",
		arg: "pgport",
	},
	pgdatabase: {
		doc: "The name of the postgres databse",
		format: String,
		default: null,
		env: "PGDATABASE",
		arg: "pgdatabase",
	},
	pgpassword: {
		doc: "The password for the postgres database",
		format: String,
		default: null,
		env: "PGPASSWORD",
		arg: "pgpassword",
		sensitive: true,
	},
	ServiceName: {
		doc: "The name by which the service is registered in Consul. If not specified, the service is not registered",
		format: "*",
		default: "Transactions SERVICE",
		env: "SERVICE_NAME",
	},
	consulHost: {
		doc: "The host where the Consul server runs",
		format: String,
		default: "consul-client",
		env: "CONSUL_HOST",
		arg: "consulhost"
	},
	consulPort: {
		doc: "The port for the Consul client",
		format: "port",
		default: 8500,
		env: "CONSUL_PORT",
	},	
	jaegerHost: {
		doc: "The host where the Jaeger UI",
		format: String,
		default: "jaeger",
		env: "JAEGER_HOST",
		arg: "jaegerhost"
	},
	jaegerPort: {
		doc: "The port for Jaeger UI",
		format: "port",
		default: 4318,
		env: "JAEGER_PORT",
	},
	amqphost: {
		doc: "host for the amqp broker",
		format: String,
		default: null,
		env: "AMQPHOST",
		arg: "amqphost",
	},
	amqpport: {
		doc: "port for the amqp broker",
		format: "port",
		default: null,
		env: "AMQPPORT",
		arg: "amqpport",
	}
})

const env = config.get("env");
config.loadFile(`./config/${env}.json`);

config.validate({ allowed: "strict" });

export default config;
