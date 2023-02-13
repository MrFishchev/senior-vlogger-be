import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, GetItemCommand} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

type Post = {
    title: string
    slug: string
    category: string
    tags: string[]
    imageUrl: string
    description: string
    publishDate: Date
    content: string
    isSentToSubscribers: boolean
    isScratch: boolean
  }

const TABLE_NAME = process.env.TABLE_NAME ?? ''

const dynamoDb = new DynamoDBClient({
    region: 'eu-west-1',
    endpoint: 'http://localhost:4566'
})

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const requestedSlug = event.pathParameters?.slug
    if (!requestedSlug) {
      return { statusCode: 400, body: 'Error: Missing parameter slug' }
    }

    try {
        const { Item } = await dynamoDb.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: marshall({slug: requestedSlug})
        }))

        if(!Item) {
            return { statusCode: 404, body: ''}
        }

        return {
            statusCode: 200,
            body: JSON.stringify(unmarshall(Item))
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: e})
        }
    }
}