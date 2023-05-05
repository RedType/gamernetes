import { S3Event, SNSMessage, SQSEvent } from 'aws-lambda';

const referralS3EventRecord: S3Event = {
  Records: [{
    eventVersion: '2.1',
    eventSource: 'aws:s3',
    awsRegion: 'us-east-1',
    eventTime: '2023-03-31T01:27:32.469Z',
    eventName: 'ObjectCreated:Put',
    userIdentity: {
      principalId:
        'AWS:AROA2X5FV2K5R4CQCMUXI:fc06d600adcd461c9a3e6299c1d89cf6',
    },
    requestParameters: {
      sourceIPAddress: '10.0.28.83',
    },
    responseElements: {
      'x-amz-request-id': '05EV0A52HY0GTB61',
      'x-amz-id-2': [
        'RJ8x6WsXsGi4sIHr2WYssY9XShKHKW0ZHYEi7S9pU9YRmMGEJvnwGrrTrDFbryR8i8jt',
        'Gyz+QunNlNmkJlXy7z/yPuIfoGM0',
      ].join(''),
    },
    s3: {
      s3SchemaVersion: '1.0',
      configurationId: 'ZDUwYThlYmEtMTQxOS00ZTQxLTk2M2YtZTZkZTc1MmIwZGI5',
      bucket: {
        name: 'edge-emailstackackreceiptbucket3d4b9ed5fb401a57955e',
        ownerIdentity: {
          principalId: 'A1B9LL9P8Z0KYQ',
        },
        arn: 'arn:aws:s3:::edge-emailstackackreceiptbucket3d4b9ed5fb401a57955e',
      },
      object: {
        key: '/referrals/d2rlc27ajgbr1sa7f89p9fuo92kh5r51qj1l2ro1',
        size: 69585,
        eTag: 'b6bd3c01a0ab482a73f91cebac6d8e34',
        sequencer: '0064263704436D97DE',
      },
    },
  }],
};

const referralNotification: SNSMessage = {
  Type: 'Notification',
  MessageId: 'deb0349b-b840-53b1-abba-683b81054ac7',
  TopicArn: [
    'arn:aws:sns:us-east-1:496956001673:edge-emailstackeceipteventtopicfac473',
    'ba7049686cf26b',
  ].join(''),
  Subject: 'Amazon S3 Notification',
  Message: JSON.stringify(referralS3EventRecord),
  Timestamp: '2023-03-31T01:27:33.456Z',
  SignatureVersion: '1',
  Signature: [
    'y2kjxEbqxvn9bli56wH7yQj7kqfW17GY77P/rXXncKBQ4gc9X2C9AtSfmOJd9s1hVHyV28/Z',
    '456Hl2A0Sgx6oVSi2zEI2BTQfVrLZHQ46MEIRhZhKtE22AXcfNUF0PmKAIE4SIValWhdmWr2',
    'Cxl40FEsH9uPzGxeyC+4nT/QbAWH5lHV73KLa9XTu4HVyTvBCayE+0wlqDYY93So7Xsy8xYF',
    'qBBEtkjP/VvgeoDI+GnRpGEexRt6JRW5BWu7owcnYpKBZJFqcMhRAym+pbeLi/2o4oQ0+sYu',
    'mHDmGTG26r1C3eD41vlF1CdlS35qMiY5h36IxjhzVY6vzSuvi/R4cA==',
  ].join(''),
  // @ts-ignore
  // the type def is wrong: it thinks the name is SigningCertUrl
  SigningCertURL: [
    'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-56e67fcb41',
    'f6fec09b0196692625d385.pem',
  ].join(''),
  UnsubscribeURL: [
    'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=',
    'arn:aws:sns:us-east-1:496956001673:edge-emailstackeceipteventtopicfac473',
    'ba7049686cf26b:36674af2-f735-43b6-ae87-021cb54b045e',
  ].join(''),
};

export const referralEvent: SQSEvent = {
  Records: [{
    messageId: 'c0151e1a-4a13-4f01-95e3-4eb8235b4d01',
    receiptHandle: [
      'AQEBSlfSNn+S3rzldPx8RHIM65rGBOoW/dMDxxYZLV1s5KCc/H5QOAFznEsbVEwV4MJASD',
      'nQmLsvXAVUh5jW+TlSScQuOBPI3FINWayTB0g1sJIEmrRXCha0+E0BJcj2SUDP5gEnBIza',
      '7f6tY8JLsR1IcQGg4D7hggqTlbvQtN4Unp0kohXyrgwHFxSRYJSW3Ty+r52+bS29plse1E',
      'X7CtEPmTHBLIEHOycoYDmg3P9TYk91fgg7B3HVH9SExHSIs1LEmaE5agP2C91SSgBeemsQ',
      'rbL+vuAX2ScKen66uRZA/EXoJrBaiaK5BZGdvxT7GijuKI1RpsF9A8KEbPRUTLrFW47zjP',
      'buJ9PGbZ9Un8QKiaU+3YeXgDZruhyUWo//Y1yx9IYklur8DYmfAxn/thWgT/Q8UoqnzbNV',
      'hs9ijPDvZQHS4/0878SRnnQg7zcFwSp6U119D8RMaBbKCxauQR4Oag==',
    ].join(''),
    body: JSON.stringify(referralNotification),
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: '1680226053502',
      SenderId: 'AIDAIT2UOQQY3AUEKVGXU',
      ApproximateFirstReceiveTimestamp: '1680226053508',
    },
    messageAttributes: {},
    md5OfBody: '972e8a3385e8fef3a47d3f271d22faff',
    eventSource: 'aws:sqs',
    eventSourceARN: [
    ].join(''),
    awsRegion: 'us-east-2',
  }],
};

