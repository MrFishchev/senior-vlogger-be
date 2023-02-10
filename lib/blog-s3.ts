import { Construct } from 'constructs'
import { CfnOutput } from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Cors } from 'aws-cdk-lib/aws-apigateway'

export class BlogS3 extends Construct {
    public readonly StorageBucket: s3.Bucket

    constructor(scope: Construct, id: string) {
        super(scope, id)

        const storageBucket = new s3.Bucket(this, 'BlogStorageS3', {
            objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
            bucketName: 'senior-vlogger-s3-storage',
            publicReadAccess: true,
            cors: [
               {
                allowedMethods: [
                    s3.HttpMethods.GET,
                    s3.HttpMethods.POST,
                    s3.HttpMethods.PUT,
                  ],
                allowedOrigins: Cors.ALL_ORIGINS,
                allowedHeaders: Cors.ALL_METHODS,
               }
            ]
        });
        this.StorageBucket = storageBucket

        new CfnOutput(this, 'BlogStorageName', {
            value: storageBucket.bucketName,
            exportName: 'blog-storage-bucket'
        })

        storageBucket.addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:*'],
            resources: ['*'],
            principals: [new iam.AnyPrincipal()]
        }))
        storageBucket.grantReadWrite(new iam.AccountRootPrincipal);
    }
}