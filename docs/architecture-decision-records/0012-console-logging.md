# 12. Console-Based Logging Strategy

Date: 2024-02-20

## Status

Accepted

## Context

In a learning-focused project that demonstrates various architectural patterns and deployment strategies, the choice of logging approach can impact both the learning experience and operational visibility. While production systems typically require sophisticated logging solutions, this project prioritizes simplicity and educational value.

## Decision

Implement logging using Node.js built-in console methods (console.log, console.error, console.debug) while acknowledging this as a learning-focused decision rather than a production-grade solution.

### Implementation Strategy

1. **Basic Console Usage**
   ```typescript
   // Example logging implementations
   console.log('Info message');
   console.error('Error message');
   console.debug('Debug message');
   console.warn('Warning message');
   ```

2. **Log Levels**
   - ERROR: Critical issues (console.error)
   - WARN: Warning conditions (console.warn)
   - INFO: General information (console.log)
   - DEBUG: Debug information (console.debug)

3. **AWS Integration**
   - Lambda logs automatically go to CloudWatch
   - Container logs captured by ECS/EKS logging drivers
   - Local development shows logs in terminal

## Consequences

### Positive
- Simple and familiar approach
- No additional dependencies
- Easy to understand for learners
- Native integration with AWS CloudWatch
- Minimal setup required
- Direct terminal output for local development
- Suitable for learning and demonstration

### Negative
- Limited structured logging capabilities
- No built-in log levels management
- Basic formatting options
- Limited querying capabilities
- Not suitable for production use

## Implementation Notes

### Current Usage
```typescript
// Example in application code
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
}
```

### Production Recommendations

For production environments, consider replacing console logging with:

1. **Structured Logging**
   - Winston or Bunyan for Node.js
   - JSON formatted logs
   - Proper log levels
   - Metadata support

2. **AWS CloudWatch Integration**
   ```typescript
   // Example structured logging for production
   const logger = winston.createLogger({
     format: winston.format.json(),
     transports: [
       new winston.transports.CloudWatch({
         logGroupName: '/aws/lambda/my-function',
         logStreamName: 'my-stream'
       })
     ]
   });
   ```

3. **Advanced Features**
   - Log aggregation
   - Search capabilities
   - Metrics extraction
   - Alert configuration
   - Retention policies

## Learning Focus

This project intentionally uses console logging to:
1. Keep the focus on architectural patterns
2. Minimize cognitive load for learners
3. Demonstrate basic operational visibility
4. Show AWS service integration

### Important Note

While console logging is sufficient for learning and demonstration purposes, it's crucial to understand that production systems should implement more robust logging solutions:

- Use structured logging frameworks
- Implement proper log levels
- Configure log aggregation
- Set up log retention policies
- Enable log analysis and alerting
- Consider compliance requirements

## Compliance

- Use appropriate console methods for log levels
- Include relevant context in log messages
- Document logging approach in code
- Consider GDPR/privacy in log content
- Understand AWS CloudWatch integration
