import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

const TABLE_NAME = process.env.TABLE_NAME ?? ''

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

const dynamoDb = new DynamoDBClient({
    region: 'eu-west-1',
    endpoint: 'http://localhost:4566'
})

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return { statusCode: 400, body: 'Invalid request' }
    }

    const postToSave: Post = JSON.parse(event.body)
    postToSave.slug = postToSave.title.replace(/[\W_]/g, '-').toLowerCase()

    try {
        await dynamoDb.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(postToSave)
        }))

    } catch (err) {
        return { statusCode: 500, body: err as string };
    }

    return { statusCode: 201, body: ''}
}