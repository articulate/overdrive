const { combineP, promisify } = require('@articulate/funky')

const {
  assoc, last, objOf, pick, pipe, pipeP, prop, split
} = require('ramda')

const redriveDLQ = require('./redriveDLQ')
const sqs = require('./sqs')

const getQAttributes =
  pipe(
    pick(['QueueUrl']),
    assoc('AttributeNames', ['All']),
    pipeP(
      promisify(sqs.getQueueAttributes, sqs),
      prop('Attributes')
    )
  )

const getQUrl =
  promisify(sqs.getQueueUrl, sqs)

const parseDLQName =
  pipe(
    prop('RedrivePolicy'),
    JSON.parse,
    prop('deadLetterTargetArn'),
    split(':'),
    last,
    objOf('QueueName')
  )

const overdrive = opts =>
  pipeP(
    getQAttributes,
    parseDLQName,
    getQUrl,
    combineP(getQAttributes),
    redriveDLQ(opts)
  )(opts)

module.exports = overdrive
