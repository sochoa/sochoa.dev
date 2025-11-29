"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdsConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const rds = __importStar(require("aws-cdk-lib/aws-rds"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const constructs_1 = require("constructs");
class RdsConstruct extends constructs_1.Construct {
    database;
    securityGroup;
    constructor(scope, id, props) {
        super(scope, id);
        // Security group for RDS - only allow from Lambda/API Gateway
        this.securityGroup = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
            vpc: props.vpc,
            description: 'Security group for RDS PostgreSQL database',
            allowAllOutbound: true,
        });
        // Allow PostgreSQL port 5432 from VPC CIDR (Lambda will be here)
        this.securityGroup.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(5432), 'Allow PostgreSQL from VPC');
        // Create the database instance
        this.database = new rds.DatabaseInstance(this, 'PostgresDb', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_16_4,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, // Graviton: better performance, lower cost
            ec2.InstanceSize.MICRO),
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
exports.RdsConstruct = RdsConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmRzQ29uc3RydWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUmRzQ29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx5REFBMkM7QUFDM0MseURBQTJDO0FBRTNDLDJDQUF1QztBQVF2QyxNQUFhLFlBQWEsU0FBUSxzQkFBUztJQUN6QixRQUFRLENBQXVCO0lBQy9CLGFBQWEsQ0FBb0I7SUFFakQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDbkUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxnQkFBZ0IsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztRQUVILGlFQUFpRTtRQUNqRSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFDckMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ2xCLDJCQUEyQixDQUM1QixDQUFDO1FBRUYsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUMzRCxNQUFNLEVBQUUsR0FBRyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQztnQkFDMUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRO2FBQzVDLENBQUM7WUFDRixZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQy9CLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLDJDQUEyQztZQUNsRSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FDdkI7WUFDRCxnQkFBZ0IsRUFBRSxFQUFFO1lBQ3BCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUc7WUFDaEMsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1lBQ2pFLFlBQVksRUFBRSxRQUFRO1lBQ3RCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztZQUNkLFVBQVUsRUFBRTtnQkFDVixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUI7YUFDL0M7WUFDRCxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3BDLGVBQWUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdEMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLDhCQUE4QjtZQUN4RCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsNkJBQTZCO1lBQ3hFLHFCQUFxQixFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ3JDLGlCQUFpQixFQUFFLElBQUksRUFBRSxnREFBZ0Q7WUFDekUsT0FBTyxFQUFFLEtBQUssRUFBRSw2REFBNkQ7WUFDN0UsdUJBQXVCLEVBQUUsSUFBSTtZQUM3QixxQkFBcUIsRUFBRSxhQUFhLEVBQUUseUJBQXlCO1lBQy9ELDBCQUEwQixFQUFFLHFCQUFxQjtTQUNsRCxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDcEMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMseUJBQXlCO1lBQzlDLFVBQVUsRUFBRSxZQUFZO1NBQ3pCLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQjtZQUMzQyxVQUFVLEVBQUUsUUFBUTtTQUNyQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNoQyxLQUFLLEVBQUUsUUFBUTtZQUNmLFVBQVUsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZTtZQUN6QyxVQUFVLEVBQUUsbUJBQW1CO1NBQ2hDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXhFRCxvQ0F3RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgcmRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yZHMnO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgc2VjcmV0c21hbmFnZXIgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNlY3JldHNtYW5hZ2VyJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJkc0NvbnN0cnVjdFByb3BzIHtcbiAgdnBjOiBlYzIuVnBjO1xuICBtYXN0ZXJVc2VyUGFzc3dvcmQ6IHNlY3JldHNtYW5hZ2VyLlNlY3JldDtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFJkc0NvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBkYXRhYmFzZTogcmRzLkRhdGFiYXNlSW5zdGFuY2U7XG4gIHB1YmxpYyByZWFkb25seSBzZWN1cml0eUdyb3VwOiBlYzIuU2VjdXJpdHlHcm91cDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogUmRzQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgLy8gU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUyAtIG9ubHkgYWxsb3cgZnJvbSBMYW1iZGEvQVBJIEdhdGV3YXlcbiAgICB0aGlzLnNlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ1Jkc1NlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIFJEUyBQb3N0Z3JlU1FMIGRhdGFiYXNlJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyBQb3N0Z3JlU1FMIHBvcnQgNTQzMiBmcm9tIFZQQyBDSURSIChMYW1iZGEgd2lsbCBiZSBoZXJlKVxuICAgIHRoaXMuc2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLmlwdjQocHJvcHMudnBjLnZwY0NpZHJCbG9jayksXG4gICAgICBlYzIuUG9ydC50Y3AoNTQzMiksXG4gICAgICAnQWxsb3cgUG9zdGdyZVNRTCBmcm9tIFZQQydcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBkYXRhYmFzZSBpbnN0YW5jZVxuICAgIHRoaXMuZGF0YWJhc2UgPSBuZXcgcmRzLkRhdGFiYXNlSW5zdGFuY2UodGhpcywgJ1Bvc3RncmVzRGInLCB7XG4gICAgICBlbmdpbmU6IHJkcy5EYXRhYmFzZUluc3RhbmNlRW5naW5lLnBvc3RncmVzKHtcbiAgICAgICAgdmVyc2lvbjogcmRzLlBvc3RncmVzRW5naW5lVmVyc2lvbi5WRVJfMTZfNCxcbiAgICAgIH0pLFxuICAgICAgaW5zdGFuY2VUeXBlOiBlYzIuSW5zdGFuY2VUeXBlLm9mKFxuICAgICAgICBlYzIuSW5zdGFuY2VDbGFzcy5UNEcsIC8vIEdyYXZpdG9uOiBiZXR0ZXIgcGVyZm9ybWFuY2UsIGxvd2VyIGNvc3RcbiAgICAgICAgZWMyLkluc3RhbmNlU2l6ZS5NSUNST1xuICAgICAgKSxcbiAgICAgIGFsbG9jYXRlZFN0b3JhZ2U6IDIwLFxuICAgICAgc3RvcmFnZVR5cGU6IHJkcy5TdG9yYWdlVHlwZS5HUDMsXG4gICAgICBzdG9yYWdlRW5jcnlwdGVkOiB0cnVlLFxuICAgICAgY3JlZGVudGlhbHM6IHJkcy5DcmVkZW50aWFscy5mcm9tU2VjcmV0KHByb3BzLm1hc3RlclVzZXJQYXNzd29yZCksXG4gICAgICBkYXRhYmFzZU5hbWU6ICdzb2Nob2EnLFxuICAgICAgdnBjOiBwcm9wcy52cGMsXG4gICAgICB2cGNTdWJuZXRzOiB7XG4gICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICB9LFxuICAgICAgc2VjdXJpdHlHcm91cHM6IFt0aGlzLnNlY3VyaXR5R3JvdXBdLFxuICAgICAgYmFja3VwUmV0ZW50aW9uOiBjZGsuRHVyYXRpb24uZGF5cygzMCksXG4gICAgICBkZWxldGlvblByb3RlY3Rpb246IHRydWUsIC8vIFByZXZlbnQgYWNjaWRlbnRhbCBkZWxldGlvblxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuU05BUFNIT1QsIC8vIEtlZXAgc25hcHNob3RzIG9uIGRlbGV0aW9uXG4gICAgICBjbG91ZHdhdGNoTG9nc0V4cG9ydHM6IFsncG9zdGdyZXNxbCddLFxuICAgICAgaWFtQXV0aGVudGljYXRpb246IHRydWUsIC8vIElBTS1iYXNlZCBhY2Nlc3MgKG1vcmUgc2VjdXJlIHRoYW4gcGFzc3dvcmRzKVxuICAgICAgbXVsdGlBejogZmFsc2UsIC8vIFNpbmdsZSBBWiBmb3IgZGV2L3NtYWxsIHdvcmtsb2FkcyAodXBncmFkZSBmb3IgcHJvZHVjdGlvbilcbiAgICAgIGF1dG9NaW5vclZlcnNpb25VcGdyYWRlOiB0cnVlLFxuICAgICAgcHJlZmVycmVkQmFja3VwV2luZG93OiAnMDM6MDAtMDQ6MDAnLCAvLyBVVEMgLSBhZGp1c3QgYXMgbmVlZGVkXG4gICAgICBwcmVmZXJyZWRNYWludGVuYW5jZVdpbmRvdzogJ3N1bjowNDowMC1zdW46MDU6MDAnLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYkVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2UuZGJJbnN0YW5jZUVuZHBvaW50QWRkcmVzcyxcbiAgICAgIGV4cG9ydE5hbWU6ICdEYkVuZHBvaW50JyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEYlBvcnQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYXRhYmFzZS5kYkluc3RhbmNlRW5kcG9pbnRQb3J0LFxuICAgICAgZXhwb3J0TmFtZTogJ0RiUG9ydCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGJOYW1lJywge1xuICAgICAgdmFsdWU6ICdzb2Nob2EnLFxuICAgICAgZXhwb3J0TmFtZTogJ0RiTmFtZScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRGJTZWN1cml0eUdyb3VwSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5zZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCxcbiAgICAgIGV4cG9ydE5hbWU6ICdEYlNlY3VyaXR5R3JvdXBJZCcsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==