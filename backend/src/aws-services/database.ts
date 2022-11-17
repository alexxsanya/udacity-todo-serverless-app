import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export const createDynamoDBClient = () => {
  return new XAWS.DynamoDB.DocumentClient()
}