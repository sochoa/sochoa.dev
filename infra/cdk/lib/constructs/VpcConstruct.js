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
exports.VpcConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const constructs_1 = require("constructs");
class VpcConstruct extends constructs_1.Construct {
    vpc;
    constructor(scope, id, props) {
        super(scope, id);
        this.vpc = new ec2.Vpc(this, 'Vpc', {
            cidr: props?.cidr || '10.0.0.0/16',
            maxAzs: props?.maxAzs || 2,
            natGateways: 1, // Cost-effective for low-traffic apps
            subnetConfiguration: [
                {
                    subnetType: ec2.SubnetType.PUBLIC,
                    name: 'Public',
                    cidrMask: 24,
                },
                {
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    name: 'Private',
                    cidrMask: 24,
                },
            ],
        });
        // Export VPC ID for reference
        new cdk.CfnOutput(this, 'VpcId', {
            value: this.vpc.vpcId,
            exportName: 'VpcId',
        });
    }
}
exports.VpcConstruct = VpcConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVnBjQ29uc3RydWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVnBjQ29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx5REFBMkM7QUFDM0MsMkNBQXVDO0FBT3ZDLE1BQWEsWUFBYSxTQUFRLHNCQUFTO0lBQ3pCLEdBQUcsQ0FBVTtJQUU3QixZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXlCO1FBQ2pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUNsQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksSUFBSSxhQUFhO1lBQ2xDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7WUFDMUIsV0FBVyxFQUFFLENBQUMsRUFBRSxzQ0FBc0M7WUFDdEQsbUJBQW1CLEVBQUU7Z0JBQ25CO29CQUNFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07b0JBQ2pDLElBQUksRUFBRSxRQUFRO29CQUNkLFFBQVEsRUFBRSxFQUFFO2lCQUNiO2dCQUNEO29CQUNFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQjtvQkFDOUMsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILDhCQUE4QjtRQUM5QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMvQixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLO1lBQ3JCLFVBQVUsRUFBRSxPQUFPO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTlCRCxvQ0E4QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVnBjQ29uc3RydWN0UHJvcHMge1xuICBjaWRyPzogc3RyaW5nO1xuICBtYXhBenM/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBWcGNDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgdnBjOiBlYzIuVnBjO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogVnBjQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgdGhpcy52cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnVnBjJywge1xuICAgICAgY2lkcjogcHJvcHM/LmNpZHIgfHwgJzEwLjAuMC4wLzE2JyxcbiAgICAgIG1heEF6czogcHJvcHM/Lm1heEF6cyB8fCAyLFxuICAgICAgbmF0R2F0ZXdheXM6IDEsIC8vIENvc3QtZWZmZWN0aXZlIGZvciBsb3ctdHJhZmZpYyBhcHBzXG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgICAgbmFtZTogJ1B1YmxpYycsXG4gICAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgICAgICBuYW1lOiAnUHJpdmF0ZScsXG4gICAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIEV4cG9ydCBWUEMgSUQgZm9yIHJlZmVyZW5jZVxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdWcGNJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnZwYy52cGNJZCxcbiAgICAgIGV4cG9ydE5hbWU6ICdWcGNJZCcsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==