import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlogApi } from './blog-api';
import { StorageApi } from './storage-api';
import { BlogS3 } from './blog-s3';

export class BlogStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const blogStorageS3 = new BlogS3(this, 'BlogStorageS3')

    new BlogApi(this, 'BlogServiceApi')
    new StorageApi(this, 'StorageServiceApi', { storageBucket: blogStorageS3.StorageBucket })
  }
}
