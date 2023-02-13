import { RestApi, IResource, LambdaIntegration, ResponseType, MockIntegration, PassthroughBehavior } from 'aws-cdk-lib/aws-apigateway'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'

interface StorageConsumerProps extends cdk.StackProps {
    storageBucket: s3.IBucket
}

const nodeJsFunctionProps: NodejsFunctionProps = {
    bundling: {
      externalModules: [
        'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
      ],
    },
    depsLockFilePath: '../package-lock.json',
    environment: {
      TABLE_NAME: 'posts'
    },
    runtime: Runtime.NODEJS_18_X
  }

// https://betterprogramming.pub/create-a-serverless-authentication-service-with-aws-cdk-cognito-and-api-gateway-ffbd8da6a659
export class BlogApi extends Construct {
    private readonly storageBucket: s3.IBucket
    
    constructor(scope: Construct, id: string, props: StorageConsumerProps) {
        super(scope, id)
        this.storageBucket = props.storageBucket

        // Lambdas for CRUD operations with a post
        const entry = './lambda/blog'

        const getAllLambda = new NodejsFunction(this, 'getAllPostsFn', {
            entry: `${entry}/get-all-posts.ts`,
            ...nodeJsFunctionProps
        })

        const getOneLambda = new NodejsFunction(this, 'getOnePostFn', {
            entry: `${entry}/get-post.ts`,
            ...nodeJsFunctionProps
        })

        const createOneLambda = new NodejsFunction(this, 'createOnePostFn', {
            entry: `${entry}/create-post.ts`,
            ...nodeJsFunctionProps
        })

        const saveFileProps = { ...nodeJsFunctionProps }
        saveFileProps.environment = {
            BUCKET_NAME: cdk.Fn.importValue('blog-storage-bucket')
        }

        const saveFileLambda = new NodejsFunction(this, 'saveFileFn', {
            entry: `${entry}/save-file.ts`,
            ...saveFileProps
        })

        // Grant the lambdas needed access
        this.storageBucket.grantReadWrite(saveFileLambda)

        const api = new RestApi(this, 'blogApi', {
            restApiName: 'Blog Service',
        })

        api.addGatewayResponse('BadResponse', {
            type: ResponseType.DEFAULT_4XX,
            statusCode: '500',
            templates: { message: "$context.error.validationErrorString" }
        })

        const blog = api.root.addResource('blog')
        blog.addMethod('GET', new LambdaIntegration(getAllLambda))
        blog.addMethod('POST', new LambdaIntegration(createOneLambda))
        addCorsOptions(blog)

        const singlePost = blog.addResource('{slug}')
        singlePost.addMethod('GET', new LambdaIntegration(getOneLambda))
        addCorsOptions(singlePost)

        const storage = api.root.addResource('storage')
        storage.addMethod('POST', new LambdaIntegration(saveFileLambda))
        addCorsOptions(storage)
    }
}

export function addCorsOptions(apiResource: IResource) {
    apiResource.addMethod('OPTIONS', new MockIntegration({
        integrationResponses: [{
            statusCode: '200',
            responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
                'method.response.header.Access-Control-Allow-Credentials': "'false'",
                'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
            }
        }],
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: {
            "application/json": "{\"statusCode\": 200}"
        }
    }), {
        methodResponses: [{
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
              'method.response.header.Access-Control-Allow-Origin': true,
            }
        }]
    })
}