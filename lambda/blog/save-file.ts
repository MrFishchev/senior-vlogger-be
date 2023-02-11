import { Handler } from 'aws-cdk-lib/aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { uuid } from 'uuidv4'

type FileToSave = {
    content: string
}

const BUCKET_NAME = process.env.BUCKET_NAME

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const s3 = new S3Client({
        credentials: {
            accessKeyId: 'dummy',
            secretAccessKey: 'dummy',
            sessionToken: 'dummy'
        },
        region: 'eu-west-1',
        endpoint: 'http://localhost:4566',
        forcePathStyle: true
    })

    const fileKey = `${uuid()}.jpg`
    try {
        const fileToSave: FileToSave = JSON.parse(event.body!)
        const buffer = Buffer.from(fileToSave.content.replace(/^data:image\/\w+;base64,/, ""), 'base64')


        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${fileKey}`,
            Body: buffer,
            ContentType: 'image/jpeg'
        }))

    } catch(e) {
        console.log(`Failed to upload file to S3 bucket`, e)
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers" : "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*"
            },
            body: `Failed to upload file to S3 bucket (${BUCKET_NAME}) ${e}`
        }
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify({ objectKey: fileKey })
    }
}