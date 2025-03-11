import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export interface LambdaStudyResizeStackProps extends cdk.StackProps {
  
}

const PREFIX = 'lambda-study';
const REPOSITORY_TOP = path.resolve(__dirname,"../");

export class LambdaStudyResizeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStudyResizeStackProps) {
    super(scope, id, props);
    const resizeLambda = new NodejsFunction(this,`${PREFIX}-lambda-test`,{
      functionName: `${PREFIX}-test`,
      entry: path.join(REPOSITORY_TOP,"lambdas/test/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30)
    })
  }
}
