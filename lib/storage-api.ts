import { Cors, EndpointType, RestApi, IResource, LambdaIntegration, MockIntegration, PassthroughBehavior } from 'aws-cdk-lib/aws-apigateway'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { CfnOutput } from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib';

interface StorageConsumerProps extends cdk.StackProps {
    storageBucket: s3.IBucket
}

export class StorageApi extends Construct {
    private storageApi: IResource
    private readonly storageBucket: s3.IBucket

    constructor(scope: Construct, id: string, props: StorageConsumerProps) {
        super(scope, id)

        this.storageBucket = props.storageBucket
        const api = new RestApi(this, 'StorageServiceApi', {
            description: 'Storage Service Rest API',
            endpointTypes: [EndpointType.REGIONAL],
            defaultCorsPreflightOptions: {
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                  ],
                allowCredentials: true,
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        })

        this.storageApi = api.root.addResource('storage')

        const entry = './lambda/storage'

        this.addRoute('POST', 'SaveFileFn', `${entry}/save-file.ts`)

        new CfnOutput(this, 'StorageApiUrl', {
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
            entry: fnEntry,
            environment: {
                BUCKET_NAME: cdk.Fn.importValue('blog-storage-bucket')
            }
        })

        this.storageApi.addMethod(method, new LambdaIntegration(fn))
        this.storageBucket.grantReadWrite(fn)
    }
}