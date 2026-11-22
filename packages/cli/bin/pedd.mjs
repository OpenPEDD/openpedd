#!/usr/bin/env node
// pedd: the OpenPEDD command line. What is built is listed in `pedd help`; every command reads the
// spec through @openpedd/reader (DEC-26).
import { main } from '../src/cli.mjs';

process.exitCode = await main(process.argv.slice(2), { cwd: process.cwd(), out: console.log, err: console.error });
