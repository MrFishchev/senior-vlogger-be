import { Handler } from 'aws-cdk-lib/aws-lambda'

const HELLO_FROM_STACK = process.env.HELLO_FROM_STACK

export const handler: Handler = async (event: any, context: any) => {
    console.log(`Lambda has got hello from ${HELLO_FROM_STACK}`)
    console.log(`event: ${event}`)
    console.log(`context: ${context}`)

    return {
        statusCode: 200,
        body: `Hello World! Stack: ${HELLO_FROM_STACK}`
    }
}