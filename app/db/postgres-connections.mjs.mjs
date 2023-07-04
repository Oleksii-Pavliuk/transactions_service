
import Knex  from 'knex';
import config from "../config/config.mjs";

const pgUser = config.get("pguser");
const pgPassword = config.get("pgpassword");
const pgDatabase = config.get("pgdatabase");
const pgHost = config.get("pghost");
const pgPort = config.get("pgport");



export const  db = Knex({
  client: 'pg',
  connection: {
    user: pgUser,
    password: pgPassword,
    database: pgDatabase,
    host: pgHost,
    port: pgPort
  }
});


