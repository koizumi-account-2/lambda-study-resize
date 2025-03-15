import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
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
    
    /** ResizeLambda 定義*/
    const resizeLambda = new NodejsFunction(this,`${PREFIX}-lambda-resize`,{
      functionName: `${PREFIX}-resize`,
      entry: path.join(REPOSITORY_TOP,"lambdas/resize/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30)
    })
    
    // ResizeLambda用のDLQ
    const resizeDlq = new Queue(this,`${PREFIX}-queue-resize-dlq`,{
      queueName: `${PREFIX}-queue-resize-dlq`
    })
    // ResizeLambda用のSQS
    const resizeQueue = new Queue(this,`${PREFIX}-queue-resize`,{
      queueName: `${PREFIX}-queue-resize`,
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: resizeDlq,
        maxReceiveCount: 1
      }
    })

    /** InvertLambda 定義*/
    const invertLambda = new NodejsFunction(this,`${PREFIX}-lambda-invert`,{
      functionName: `${PREFIX}-invert`,
      entry: path.join(REPOSITORY_TOP,"lambdas/invert/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30)
    })
    // InvertLambda用のDLQ
    const invertDlq = new Queue(this,`${PREFIX}-queue-invert-dlq`,{
      queueName: `${PREFIX}-queue-invert-dlq`
    })
    // InvertLambda用のSQS
    const invertQueue = new Queue(this,`${PREFIX}-queue-invert`,{
      queueName: `${PREFIX}-queue-invert`,
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: invertDlq,
        maxReceiveCount: 1
      }
    })

    /** SNS 定義*/
    const snsTopic = new sns.Topic(this,`${PREFIX}-sns-topic`,{
      topicName: `${PREFIX}-sns-topic`,
      displayName: `${PREFIX}-sns-topic`
    })
    // SNS -> ResizeLambda用のSQS
    snsTopic.addSubscription(new SqsSubscription(resizeQueue,{
      rawMessageDelivery: true
    }))
    // SNS -> InvertLambda用のSQS
    snsTopic.addSubscription(new SqsSubscription(invertQueue,{
      rawMessageDelivery: true
    }))

    /** ResizeLambda */
    // SQS -> ResizeLambda allow
    resizeQueue.grantSendMessages(resizeLambda);
    // SQS -> ResizeLambda
    resizeLambda.addEventSource(new SqsEventSource(resizeQueue));
    // ResizeLambda -> S3 allow
    s3Bucket.grantReadWrite(resizeLambda);

    /** InvertLambda */
    // SQS -> InvertLambda allow
    invertQueue.grantSendMessages(invertLambda);
    // SQS -> InvertLambda
    invertLambda.addEventSource(new SqsEventSource(invertQueue));
    // InvertLambda -> S3 allow
    s3Bucket.grantReadWrite(invertLambda);

    // S3 -> SNS
    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED,new s3n.SnsDestination(snsTopic),
      {
        prefix: "original/",
        suffix: ".png"
      }
    ) 
  }
}
