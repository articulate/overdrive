# overdrive

Redrive messages from a dead-letter queue (DLQ) back onto an SQS queue.

- [Usage](#usage)
- [How it works](#how-it-works)
- [Requirements](#requirements)

## Usage

```
$ overdrive -h
Usage: overdrive [options]

Redrive dead-letter messages back into an SQS queue.

Options:
  -V, --version          output the version number
  -q, --queue-url <url>  SQS queue url to redrive (required)
  -t, --timeout <ms>     time to wait for DLQ to empty (default: 60000)
  -h, --help             output usage information
```

A common way to run commands like this is to include it as an `npm` script in your service's `package.json`.

```json
{
  "scripts": {
    "sqs:redrive": "overdrive --queue-url $MY_SQS_QUEUE_URL"
  }
}
```

Then execute it with `npm sqs:redrive`.  You should see animated output similar to the following:

```
Redriving 295 messages...
progress: ⣀ [========================] 100%
Done.
```

## How it works

1. When you specify the main queue, `overdrive` will first query the queue attributes to parse the redrive-policy and obtain the DLQ url.

1. Next it will drain the DLQ and push all of the dead-letter messages back onto the original queue.

1. It ensures both the `MessageBody` and `MessageAttributes` are resent.

## Requirements

When you do any work with SQS queues, you've got to have your `AWS_REGION` on hand, and that still applies here.

In addition, you'll need to get your IAM statements in order.  Specific requirements will vary on your use-case, but assuming you've got one queue with a DLQ and both are encrypted with KMS, then your IAM statements should look something like this:

```json
[{
  "Effect": "Allow",
  "Action": [
    "kms:Decrypt",
    "kms:GenerateDataKey"
  ],
  "Resource": "${kms_key.arn}"
}, {
  "Effect": "Allow",
  "Action": [
    "sqs:DeleteMessage",
    "sqs:GetQueueAttributes",
    "sqs:ReceiveMessage",
    "sqs:SendMessage"
  ],
  "Resource": "${queue.arn}"
}, {
  "Effect": "Allow",
  "Action": [
    "sqs:DeleteMessage",
    "sqs:GetQueueAttributes",
    "sqs:GetQueueUrl",
    "sqs:ReceiveMessage"
  ],
  "Resource": "${dead_letter_queue.arn}"
}]
```
