# overdrive

Redrive dead-letter messages back into an SQS queue.

- [Usage](#usage)
- [Requirements](#requirements)
- [How it works](#how-it-works)

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

Then execute it with `npm sqs:redrive`.

## Requirements

To perform each of the following tasks, the box you run this on must have at minimum the corresponding IAM statements:

#### Draining the DLQ

```json
{
  "Effect": "Allow",
  "Action": [
    "sqs:ReceiveMessage",
    "sqs:DeleteMessage"
  ],
  "Resource": "${dead_letter_queue.arn}"
}
```

#### Reading from an encrypted DLQ

```json
{
  "Effect": "Allow",
  "Action": [
    "kms:Decrypt"
  ],
  "Resource": "${kms_key.arn}"
}
```

#### Redriving back to the main queue

```json
{
  "Effect": "Allow",
  "Action": [
    "sqs:SendMessage"
  ],
  "Resource": "${queue.arn}"
}
```

#### Writing to an encrypted main queue

```json
{
  "Effect": "Allow",
  "Action": [
    "kms:GenerateDataKey",
    "kms:Decrypt"
  ],
  "Resource": "${kms_key.arn}"
}
```

## How it works
