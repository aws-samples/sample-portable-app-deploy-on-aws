/**
 * End-to-End Test Runner
 * This file serves as the entry point for running E2E tests across different deployment types.
 * It handles command-line arguments, validates deployment types, and executes the appropriate tests.
 */

import { CliDeploymentType, convertCliType } from './get-endpoint';
import { main } from './run-tests';

// Valid deployment types that can be tested
const validTypes = ['zip', 'container', 'ecs', 'eks', 'local', 'web-adapter'];

/**
 * Get and validate deployment type from command line argument
 * @type {CliDeploymentType}
 */
const deploymentType = process.argv[2] as CliDeploymentType;

// Validate deployment type
if (!deploymentType || !validTypes.includes(deploymentType)) {
  console.error("\n❌ Please specify deployment type:");
  console.error("   npm run test:e2e [zip|container|web-adapter|ecs|eks|local]");
  console.error("\nExample:");
  console.error("   npm run test:e2e local");
  process.exit(1);
}

// Convert CLI argument to internal DeploymentType enum
const type = convertCliType(deploymentType);

// Log debug information
console.log('\n🔍 Debug Information:');
console.log('Deployment Type:', deploymentType);
console.log('Converted Type:', type);

/**
 * Execute the test suite
 * Handles various error scenarios and provides appropriate feedback
 */
main(type).catch(error => {
  // Log detailed error information for debugging
  console.log('\n🔍 Error Details:');
  console.log('Error Name:', error.name);
  console.log('Full Error Message:', error.message);
  console.log('Error Stack:', error.stack);

  // Handle specific error cases
  if (error.message.includes('Local server is not running')) {
    // Error message is already handled in run-tests.ts
    process.exit(1);
  } else if (
    error.message.includes('Stack with id') && error.message.includes('does not exist') ||
    error.message.includes('has not been deployed yet')
  ) {
    // Handle deployment not ready errors
    console.error(`\n❌ The ${type} deployment is not ready.`);
    
    // Provide deployment instructions based on type
    switch (type) {
      case 'lambda-zip':
        console.error('Run: npm run lambda:zip:all');
        break;
      case 'lambda-container':
        console.error('Run: npm run lambda:container:all');
        break;
      case 'ecs':
        console.error('Run: npm run container:ecs:deploy:all');
        break;
      case 'eks':
        console.error('Run: npm run container:eks:deploy:all');
        break;
      case 'lambda-web-adapter':
        console.error('Run: npm run lambda:web-adapter:all');
        break;
      case 'local':
        console.error('Run: npm run start');
        break;
    }
  } else {
    // Handle general test failures
    console.error("❌ Tests failed:", error);
  }
  process.exit(1);
});
