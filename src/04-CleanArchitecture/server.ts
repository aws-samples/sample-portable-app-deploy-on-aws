// This file serves as the entry point for the application
// while maintaining clean architecture principles by delegating
// to the proper infrastructure layer

import { runServer } from './infrastructure/local/server';

// Re-export the server startup for programmatic usage
export { runServer as start };

// Helper function to check if this is the main module
export const isMainModule = () => require.main === module;

// Helper function to conditionally start the server
export const startIfMain = () => {
    if (isMainModule()) {
        runServer();
    }
};

// Start the server if this file is run directly
startIfMain();
