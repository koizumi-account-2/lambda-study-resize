#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaStudyResizeStack } from '../lib/lambda-study-resize-stack';

const app = new cdk.App();
new LambdaStudyResizeStack(app, 'LambdaStudyResizeStack', {});