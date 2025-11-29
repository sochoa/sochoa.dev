#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PrimaryStack } from '../lib/primary_stack';

const app = new cdk.App();

// Get environment and region from context or environment variables
const environment = app.node.tryGetContext('environment') || process.env.CDK_ENVIRONMENT || 'dev';
const region = app.node.tryGetContext('region') || process.env.AWS_REGION || 'us-east-1';
const uiDomain = app.node.tryGetContext('uiDomain') || process.env.UI_DOMAIN || 'https://sochoa.dev';

new PrimaryStack(app, `sochoa-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: region,
  },
  description: `sochoa.dev infrastructure for ${environment} environment`,
  stackName: `sochoa-${environment}`,
});

app.synth();
