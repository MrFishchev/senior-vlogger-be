import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient, ScanCommand} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

type PostBase = {
    slug: string
    title: string
    category: string
    tags: string[]
    imageUrl: string
    description: string
    publishDate: Date
  }

const dynamoDb = new DynamoDBClient({
    region: 'eu-west-1',
    endpoint: 'http://localhost:4566'
})

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { Items } = await dynamoDb.send(new ScanCommand({
            TableName: 'posts'
        }))
        const posts: PostBase[] = Items?.map(x=> unmarshall(x) as PostBase) ?? []

        return {
            statusCode: 200,
            body: JSON.stringify(posts)
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: e})
        }
    }
}