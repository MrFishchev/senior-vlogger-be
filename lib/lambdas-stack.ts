import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path'
import { CfnOutput } from 'aws-cdk-lib';

export class LambdasStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloWorldLambda = new NodejsFunction(this, "HelloWorldHandler", {
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/hello-world.ts'),
      handler: 'handler',
      environment: {
        HELLO_FROM_STACK: 'lambdas-stack'
      }
    })

    const helloWorldLambdaUrl = helloWorldLambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*']
      }
    });

    new CfnOutput(this, 'HelloWorldLambdaUrl', {
      value: helloWorldLambdaUrl.url
    })
  }
}
