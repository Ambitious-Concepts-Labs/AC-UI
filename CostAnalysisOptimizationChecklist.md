# AWS Cost Analysis & Optimization Checklist

## 1. Account & Billing Setup
- [ ] Activate AWS Cost Explorer
- [ ] Set up AWS Budgets and alerts
- [ ] Enable detailed billing reports to S3
- [ ] Implement resource tagging strategy for cost allocation
- [ ] Consolidate accounts with AWS Organizations
- [ ] Review IAM roles and access to billing information
- [ ] Enable AWS Trusted Advisor cost optimization checks
- [ ] Set up anomaly detection for unusual spending patterns

## 2. Compute Services Optimization
### EC2
- [ ] Identify and terminate unused or idle instances
- [ ] Right-size over-provisioned instances
- [ ] Implement auto-scaling for variable workloads
- [ ] Use Spot Instances for non-critical, interruptible workloads
- [ ] Purchase Reserved Instances or Savings Plans for predictable workloads
- [ ] Evaluate Graviton ARM-based instances for better price/performance
- [ ] Optimize EBS volumes (size, type, and unused volumes)
- [ ] Remove unattached EBS volumes and unused snapshots
- [ ] Implement lifecycle policies for EBS snapshots

### Lambda
- [ ] Optimize memory allocation for Lambda functions
- [ ] Analyze function timeout settings and execution durations
- [ ] Review and optimize trigger frequencies
- [ ] Check for recursive invocation patterns
- [ ] Monitor cold starts and implement provisioned concurrency if needed

## 3. Storage Optimization
### S3
- [ ] Implement S3 lifecycle policies for proper tiering
- [ ] Move infrequently accessed data to S3 Standard-IA
- [ ] Move archival data to Glacier or Glacier Deep Archive
- [ ] Enable S3 analytics to identify optimization opportunities
- [ ] Review and delete unneeded objects/buckets
- [ ] Optimize S3 request costs (batch operations vs. individual requests)
- [ ] Review S3 replication needs and costs

### EBS & EFS
- [ ] Audit EBS volumes for appropriate type (gp2, gp3, io1, etc.)
- [ ] Convert from gp2 to gp3 where appropriate for cost savings
- [ ] Delete unattached volumes and unnecessary snapshots
- [ ] Implement EBS lifecycle management
- [ ] Review EFS storage class and lifecycle policies

## 4. Database Services
- [ ] Right-size RDS instances
- [ ] Convert to Aurora if workload is suitable
- [ ] Review and adjust provisioned IOPS
- [ ] Implement RDS reserved instances for steady workloads
- [ ] Assess if read replicas are necessary
- [ ] Evaluate multi-AZ deployment necessity
- [ ] Review DynamoDB provisioned capacity vs. on-demand pricing
- [ ] Implement DynamoDB auto-scaling
- [ ] Use DynamoDB Accelerator (DAX) only when necessary
- [ ] Review ElastiCache instance sizes and types

## 5. Networking
- [ ] Audit and remove unused Elastic IPs
- [ ] Review and optimize NAT Gateway usage
- [ ] Analyze data transfer costs between services and regions
- [ ] Implement VPC Endpoints for AWS service access to reduce NAT costs
- [ ] Consolidate workloads in fewer regions when possible
- [ ] Optimize CloudFront usage and distribution settings
- [ ] Review Route 53 query volumes and zones

## 6. Application & Container Services
- [ ] Optimize ECS/EKS cluster sizes
- [ ] Use Fargate Spot for non-critical workloads
- [ ] Review and adjust App Runner service sizes
- [ ] Audit container image sizes to reduce storage costs
- [ ] Optimize container resource allocations (CPU/memory)

## 7. Analytics & Big Data
- [ ] Review EMR cluster types and sizes
- [ ] Use spot instances for EMR processing tasks
- [ ] Implement autoscaling for variable workloads
- [ ] Audit Redshift node types and cluster sizes
- [ ] Evaluate Redshift Reserved Nodes for steady workloads
- [ ] Review Kinesis shard counts and provisioning
- [ ] Optimize Glue DPU usage and job concurrency

## 8. Machine Learning & AI Services
- [ ] Audit SageMaker instance types and usage
- [ ] Review inference endpoint sizing and scaling policies
- [ ] Use spot instances for training when possible
- [ ] Implement model compression techniques
- [ ] Evaluate pay-per-use AI services vs. custom models

## 9. Monitoring & Management
- [ ] Review CloudWatch log retention periods
- [ ] Audit CloudWatch metrics and custom metrics usage
- [ ] Optimize X-Ray sampling rates
- [ ] Review AWS Config recording settings
- [ ] Evaluate CloudTrail trail configurations

## 10. Advanced Optimization Strategies
- [ ] Implement Infrastructure as Code for consistent deployments
- [ ] Review architectural patterns for cost efficiency
- [ ] Evaluate multi-account strategy effectiveness
- [ ] Consider AWS Enterprise Discount Program (EDP) for large deployments
- [ ] Implement FinOps practices and team structure
- [ ] Schedule non-production environments for automatic shutdown
- [ ] Evaluate third-party cost optimization tools

## 11. Regular Review Process
- [ ] Schedule weekly cost anomaly reviews
- [ ] Conduct monthly service-specific optimization reviews
- [ ] Perform quarterly comprehensive cost analysis
- [ ] Review AWS pricing changes and new service offerings
- [ ] Update internal chargeback/showback model
- [ ] Track and celebrate cost optimization wins

## Additional Resources
- AWS Pricing Calculator: https://calculator.aws/
- AWS Well-Architected Framework (Cost Optimization Pillar): https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html
- AWS Cost Management tools: https://aws.amazon.com/aws-cost-management/