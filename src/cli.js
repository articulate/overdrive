#!/usr/bin/env node

const chalk = require('chalk')
const program = require('commander')

const { version } = require('../package')

program
  .version(version)
  .usage('[options]')
  .option('-q, --queue-url <url>', 'SQS queue url to redrive')
  .option('-t, --timeout <ms>', 'Time to wait for DLQ to empty', Number, 60000)
  .parse(process.argv)

const { queueUrl, timeout } = program

if (!queueUrl) {
  console.error(chalk.red('error: the following arguments are required: --queue-url'))
  process.exit(1)
}

if(!/^https:\/\//.test(queueUrl)) {
  console.error(chalk.red(`error: ${queueUrl} is not a valid --queue-url`))
  process.exit(1)
}

require('./overdrive')({ QueueUrl: queueUrl, timeout })
  .then(console.log, console.error)
