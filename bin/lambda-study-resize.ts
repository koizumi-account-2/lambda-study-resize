#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaStudyResizeStack } from '../lib/lambda-study-resize-stack';
import { LambdaStudyCloudfrontStack } from '../lib/lambda-study-cloudfront-stack';

const app = new cdk.App();
// new LambdaStudyResizeStack(app, 'LambdaStudyResizeStack', {});
new LambdaStudyCloudfrontStack(app, 'LambdaStudyCloudfrontStack', {});