import { Cors, EndpointType, RestApi, IResource, LambdaIntegration, ResponseType } from 'aws-cdk-lib/aws-apigateway'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { CfnOutput } from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib';

interface StorageConsumerProps extends cdk.StackProps {
    storageBucket: s3.IBucket
}

// https://betterprogramming.pub/create-a-serverless-authentication-service-with-aws-cdk-cognito-and-api-gateway-ffbd8da6a659
export class BlogApi extends Construct {
    private blogApi: IResource
    private storageApi: IResource
    private readonly storageBucket: s3.IBucket
    
    constructor(scope: Construct, id: string, props: StorageConsumerProps) {
        super(scope, id)

        this.storageBucket = props.storageBucket
        const api = new RestApi(this, 'BlogServiceApi', {
            description: 'Blog Service Rest API',
            endpointTypes: [EndpointType.REGIONAL],
            defaultCorsPreflightOptions: {
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                  ],
                allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                allowCredentials: true,
                allowOrigins: Cors.ALL_ORIGINS
            },
            
        })

        api.addGatewayResponse('BadResponse', {
            type: ResponseType.DEFAULT_4XX,
            statusCode: '500',
            templates: { message: "$context.error.validationErrorString" }
        })

        const entry = './lambda/blog'
        this.blogApi = api.root.addResource('blog')
        this.storageApi = api.root.addResource('storage')

        this.addRoute(this.blogApi, 'GET', 'GetAllPostsFn', `${entry}/get-all-posts.ts`)
        this.addRoute(this.blogApi, 'POST', 'CreatePostFn', `${entry}/create-post.ts`)
        this.addRoute(this.storageApi, 'POST', 'SaveFileFn', `${entry}/save-file.ts`)
    }

    private addRoute(
        resource: IResource,
        method: string,
        fnName: string,
        fnEntry: string
    ): void {
        const commonFnProps = {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler'
        }

        const fn = new NodejsFunction(this, fnName, {
            ...commonFnProps,
            entry: fnEntry,
            environment: {
                BUCKET_NAME: cdk.Fn.importValue('blog-storage-bucket')
            }
        })

        resource.addMethod(method, new LambdaIntegration(fn))
    }
}