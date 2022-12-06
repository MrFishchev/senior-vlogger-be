import { Cors, EndpointType, RestApi, IResource, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { CfnOutput } from 'aws-cdk-lib'

// https://betterprogramming.pub/create-a-serverless-authentication-service-with-aws-cdk-cognito-and-api-gateway-ffbd8da6a659
export class BlogApi extends Construct {
    private blogApi: IResource

    constructor(scope: Construct, id: string) {
        super(scope, id)

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
            }
        })

        this.blogApi = api.root.addResource('blog')

        const entry = './lambda/blog'

        this.addRoute('GET', 'GetAllPostsFn', `${entry}/get-all-posts.ts`)

        new CfnOutput(this, 'BlogApiUrl', {
            value: api.url
        })
    }

    private addRoute(
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
            entry: fnEntry
        })

        this.blogApi.addMethod(method, new LambdaIntegration(fn))
    }
}