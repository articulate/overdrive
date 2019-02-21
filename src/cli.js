#!/usr/bin/env node

const program = require('commander')
const { red } = require('chalk')

const { version } = require('../package')

program
  .version(version)
  .usage('[options]')
  .option('-q, --queue-url <url>', 'SQS queue url to redrive')
  .option('-t, --timeout <ms>', 'Time to wait for DLQ to empty', Number, 60000)
  .parse(process.argv)

const { queueUrl, timeout } = program

if (!queueUrl) {
  console.error(red('error: the following argument is required: --queue-url'))
  process.exit(1)
}

if(!/^https:\/\//.test(queueUrl)) {
  console.error(red(`error: ${queueUrl} is not a valid --queue-url`))
  process.exit(1)
}

require('./overdrive')({ QueueUrl: queueUrl, timeout })
  .then(console.log, console.error)
