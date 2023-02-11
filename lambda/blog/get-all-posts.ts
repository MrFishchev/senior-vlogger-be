import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, ScanCommand} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

type PostBase = {
    id: number
    title: string
    slug: string
    category: string
    tags: string[]
    imageUrl: string
    description: string
    publishDate: Date
  }

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('[EVENT]', event)

    const dynamoDb = new DynamoDBClient({
        region: 'eu-west-1',
        endpoint: 'http://localhost:4566'
    })

    try {
        const { Items } = await dynamoDb.send(new ScanCommand({
            TableName: 'posts'
        }))
        const posts: PostBase[] = Items?.map(x=> unmarshall(x) as PostBase) ?? []

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(posts)
        }
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
}