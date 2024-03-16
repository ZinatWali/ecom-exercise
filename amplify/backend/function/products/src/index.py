import boto3
import json

print('Loading function')
dynamo = boto3.client('dynamodb')


def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Content-Type': 'application/json',
        },
    }


def handler(event, context):
    '''Demonstrates a simple HTTP endpoint using API Gateway. You have full
    access to the request and response payload, including headers and
    status code.

    To scan a DynamoDB table, make a GET request with the TableName as a
    query string parameter. To put, update, or delete an item, make a POST,
    PUT, or DELETE request respectively, passing in the payload to the
    DynamoDB API as a JSON body.
    '''

    operation = event['httpMethod']
    if operation == "GET":
        payload = event['queryStringParameters'] if operation == 'GET' else json.loads(event['body'])
        items = dynamo.scan(TableName='Products-dev')["Items"]
        
        data = []
        for item in items:
            result_item = {}
            for col in item:
                result_item[col] = list(item[col].values())[0]
            data.append(result_item)
        
        return respond(None, data)
    else:
        return respond(ValueError('Unsupported method "{}"'.format(operation)))