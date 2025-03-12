import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
export interface LambdaStudyCloudfrontStackProps extends cdk.StackProps {
  
}

const PREFIX = 'lambda-study';
const REPOSITORY_TOP = path.resolve(__dirname,"../");

export class LambdaStudyCloudfrontStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: LambdaStudyCloudfrontStackProps) {
    super(scope, id, props);


    const siteBucket = new s3.Bucket(this,`${PREFIX}-cloudfront-bucket`,{
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      bucketName: `${PREFIX}-cloudfront-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    })

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket)
      },
      defaultRootObject: 'index.html',
    });


    const invalidateLambda = new NodejsFunction(this,`${PREFIX}-invalidate-lambda`,{
      functionName: `${PREFIX}-invalidate-lambda`,
      entry: path.join(REPOSITORY_TOP,"lambdas/invalidate/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
      environment: {
        DISTRIBUTION_ID: distribution.distributionId,
      },
    })

    distribution.grantCreateInvalidation(invalidateLambda);

    siteBucket.addEventNotification(s3.EventType.OBJECT_CREATED,new s3n.LambdaDestination(invalidateLambda)) 

    new cdk.CfnOutput(this, 'Hosting URL', {
      value: 'https://' + distribution.distributionDomainName
    });
  }
}
