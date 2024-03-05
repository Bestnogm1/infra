import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origin from "aws-cdk-lib/aws-cloudfront-origins";

// https://aws-cdk.com/deploying-a-static-website-using-s3-and-cloudfront
export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //create S3
    const bucket = new s3.Bucket(this, 'testwebsites3', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    // deployed Website inside of the s3
    new s3Deployment.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3Deployment.Source.asset("../frontend")],
      destinationBucket: bucket,
      destinationKeyPrefix: 'web/static'
    })

    //granted read access to an S3 bucket (bucket) using the grantRead method.
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    bucket.grantRead(originAccessIdentity);

    //A new CloudFront distribution is created with the name 'Distribution'. It's configured with the following options:
    new cloudfront.Distribution(this, "distro", {
      defaultBehavior: {
        origin: new origin.S3Origin(bucket, { originAccessIdentity }),
      }
    })
  }
}
