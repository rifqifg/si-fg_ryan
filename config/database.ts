/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | PostgreSQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for PostgreSQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i pg
    |
    */
    pg: {
      client: 'pg',
      connection: {
        // ssl: Env.get('PG_SSL'),
        host: Env.get('PG_HOST'),
        port: Env.get('PG_PORT'),
        user: Env.get('PG_USER'),
        password: Env.get('PG_PASSWORD', ''),
        database: Env.get('PG_DB_NAME'),
      },
      migrations: {
        naturalSort: false,
        paths: ['./database/migrations', './app/Modules/Academic/Database/Migrations', './app/Modules/Inventory/Database/Migrations']
      },
      seeders: {
        paths: ['./database/seeders/MainSeeder']
      },
      healthCheck: false,
      debug: false,
    },
    pg_dev: {
      client: 'pg',
      connection: {
        ssl: Env.get('PG_DEV_SSL'),
        host: Env.get('PG_DEV_HOST'),
        port: Env.get('PG_DEV_PORT'),
        user: Env.get('PG_DEV_USER'),
        password: Env.get('PG_DEV_PASSWORD', ''),
        database: Env.get('PG_DEV_DB_NAME'),
      },
      migrations: {
        naturalSort: true,
        paths: ['./database/migrations', './app/modules/academic/database/migrations', './app/modules/inventory/database/migrations']
      },
      seeders: {
        paths: ['./database/seeders/MainSeeder']
      },
      healthCheck: false,
      debug: false,
    },
  }
}

export default databaseConfig
