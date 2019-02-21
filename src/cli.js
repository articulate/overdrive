#!/usr/bin/env node

const program = require('commander')
const { red } = require('chalk')

const { description, name, version } = require('../package')

program
  .name(name)
  .description(description)
  .version(version)
  .usage('[options]')
  .option('-q, --queue-url <url>', 'SQS queue url to redrive (required)')
  .option('-t, --timeout <ms>', 'time to wait for DLQ to empty', Number, 60000)
  .parse(process.argv)

const { queueUrl, timeout } = program

if (!queueUrl) {
  console.error(red('\nerror: the following argument is required: --queue-url\n'))
  process.exit(1)
}

if(!/^https:\/\//.test(queueUrl)) {
  console.error(red(`\nerror: "${queueUrl}" is not a valid --queue-url\n`))
  process.exit(1)
}

require('./overdrive')({ QueueUrl: queueUrl, timeout })
  .then(console.log, console.error)
