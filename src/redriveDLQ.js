const { Consumer } = require('sqs-consumer')
const { green, yellow } = require('chalk')
const progress = require('@articulate/progress')()
const { promisify, rename } = require('@articulate/funky')

const {
  assoc, evolve, map, omit, pick, pipe, pipeP
} = require('ramda')

const sqs = require('./sqs')

const redriveDLQ = opts => dlq =>
  new Promise((resolve, reject) => {
    const {
      QueueUrl: qUrl,
      timeout
    } = opts

    const {
      ApproximateNumberOfMessages,
      QueueUrl: dlqUrl
    } = dlq

    let curr = 0
    const total = Number(ApproximateNumberOfMessages)

    if (total) {
      console.log(yellow(`\nRedriving ${total} messages...`))
    } else {
      return resolve(green('\nDLQ is already empty.\n'))
    }

    const cleanAttributes =
      map(omit(['BinaryListValues', 'StringListValues']))

    const finish = err => {
      consumer.stop()
      clearTimeout(timer)
      err ? reject(err) : resolve(green('\nDone.\n'))
    }

    const increment = () => {
      curr += 1
      progress(curr / total)
    }

    const handleMessage =
      pipe(
        rename('Body', 'MessageBody'),
        pick(['MessageBody', 'MessageAttributes']),
        evolve({ MessageAttributes: cleanAttributes }),
        assoc('QueueUrl', qUrl),
        pipeP(
          promisify(sqs.sendMessage, sqs),
          increment
        )
      )

    const tookTooLong = () => {
      finish(new Error('timeout waiting for DLQ to empty'))
    }

    const consumer =
      Consumer.create({
        batchSize: 10,
        handleMessage,
        handleMessageTimeout: 10000,
        messageAttributeNames: ['All'],
        queueUrl: dlqUrl,
        waitTimeSeconds: 2
      }).on('empty', finish)
        .on('error', finish)
        .on('processing_error', finish)
        .on('timeout_error', finish)

    consumer.start()

    const timer = setTimeout(tookTooLong, timeout)
  })

module.exports = redriveDLQ
