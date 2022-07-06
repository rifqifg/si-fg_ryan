/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/
import { createServer } from "https";
import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'

import path from 'path';
import fs from 'fs'

sourceMapSupport.install({ handleUncaughtExceptions: false })
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs/server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/server.crt'))
}
new Ignitor(__dirname).httpServer().start((handle) => {
  return createServer(
    options,
    handle
  );
});
