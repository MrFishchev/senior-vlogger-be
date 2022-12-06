#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdasStack } from '../lib/lambdas-stack';
import { BlogStack } from '../lib/blog-stack';

const app = new cdk.App();
new LambdasStack(app, 'LambdasStack', {
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new BlogStack(app, 'BlogStack')