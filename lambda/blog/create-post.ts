import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, PutItemCommand} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { uuid } from 'uuidv4'

type Post = {
    id: string
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

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('[EVENT]', event)
    let postFromDb: Post | null = null

    const dynamoDb = new DynamoDBClient({
        region: 'eu-west-1',
        endpoint: 'http://localhost:4566'
    })

    try {
        const postToSave: Post = JSON.parse(event.body!)
        postToSave.id = uuid()
        await dynamoDb.send(new PutItemCommand({
            TableName: 'posts',
            Item: marshall(postToSave)
        }))

    } catch (e) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ msg: e})
        }
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify({ msg: 'Post is created' })
    }
}