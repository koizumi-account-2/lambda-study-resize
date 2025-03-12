import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
export interface LambdaStudyResizeStackProps extends cdk.StackProps {
  
}

const PREFIX = 'lambda-study';
const REPOSITORY_TOP = path.resolve(__dirname,"../");

export class LambdaStudyResizeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStudyResizeStackProps) {
    super(scope, id, props);


    const s3Bucket = new s3.Bucket(this,`${PREFIX}-s3-bucket`,{
      bucketName: `${PREFIX}-s3-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })
    
    const resizeLambda = new NodejsFunction(this,`${PREFIX}-lambda-resize`,{
      functionName: `${PREFIX}-resize`,
      entry: path.join(REPOSITORY_TOP,"lambdas/resize/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30)
    })

    s3Bucket.grantReadWrite(resizeLambda);
    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED,new s3n.LambdaDestination(resizeLambda),
      {
        prefix: "original/",
        suffix: ".png"
      }
    ) 
  }
}
