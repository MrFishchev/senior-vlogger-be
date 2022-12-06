import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlogApi } from './blog-api';

export class BlogStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new BlogApi(this, 'BlogServiceApi')
  }
}
