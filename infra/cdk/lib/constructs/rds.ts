import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface RdsConstructProps {
  vpc: ec2.Vpc;
  masterUserPassword: secretsmanager.Secret;
  environment: string;
}

export class RdsConstruct extends Construct {
  public readonly database: rds.DatabaseInstance;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RdsConstructProps) {
    super(scope, id);

    // Security group for RDS - only allow from Lambda/API Gateway
    this.securityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for RDS PostgreSQL database',
      allowAllOutbound: true,
    });

    // Allow PostgreSQL port 5432 from VPC CIDR (Lambda will be here)
    this.securityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from VPC'
    );

    // Create the database instance
    this.database = new rds.DatabaseInstance(this, 'PostgresDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G, // Graviton: better performance, lower cost
        ec2.InstanceSize.MICRO
      ),
      allocatedStorage: 20,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      credentials: rds.Credentials.fromSecret(props.masterUserPassword),
      databaseName: 'sochoa',
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [this.securityGroup],
      backupRetention: cdk.Duration.days(30),
      deletionProtection: true, // Prevent accidental deletion
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT, // Keep snapshots on deletion
      cloudwatchLogsExports: ['postgresql'],
      iamAuthentication: true, // IAM-based access (more secure than passwords)
      multiAz: false, // Single AZ for dev/small workloads (upgrade for production)
      autoMinorVersionUpgrade: true,
      preferredBackupWindow: '03:00-04:00', // UTC - adjust as needed
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
    });

    // Outputs
    new cdk.CfnOutput(this, 'DbEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      exportName: 'DbEndpoint',
    });

    new cdk.CfnOutput(this, 'DbPort', {
      value: this.database.dbInstanceEndpointPort,
      exportName: 'DbPort',
    });

    new cdk.CfnOutput(this, 'DbName', {
      value: 'sochoa',
      exportName: 'DbName',
    });

    new cdk.CfnOutput(this, 'DbSecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      exportName: 'DbSecurityGroupId',
    });
  }
}
