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
    
    order_details = json.loads(event['body'])
        
    item_dict = {
        "orderId":{"N": str(order_details["orderId"])},
        "userId":{"S": order_details["userId"]}, 
        "productId": {"N": str(order_details["productId"])}, 
        "quantity": {"N": str(order_details["quantity"])}, 
        "price": {"N": str(order_details["price"])}
    }
    
    payload = {
        "TableName": "order-dev",
        "Item": item_dict
    }
    
    operation = event['httpMethod']
    if operation == 'POST':
        return respond(None, dynamo.put_item(**payload))
    else:
        return respond(ValueError('Unsupported method "{}"'.format(operation)))