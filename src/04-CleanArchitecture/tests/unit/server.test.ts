import { start, isMainModule, startIfMain } from '../../server';
import { runServer } from '../../infrastructure/local/server';

// Mock the local server module
jest.mock('../../infrastructure/local/server', () => ({
    runServer: jest.fn()
}));

describe('Server', () => {
    beforeEach(() => {
        // Clear mock calls between tests
        jest.clearAllMocks();
    });

    it('should export runServer as start', () => {
        // Verify that start is the same as runServer
        expect(start).toBe(runServer);
    });

    describe('startIfMain', () => {
        it('should start the server when run as main module', () => {
            // Mock isMainModule to return true
            jest.spyOn(require('../../server'), 'isMainModule').mockReturnValue(true);
            
            // Call startIfMain
            startIfMain();

            // Verify runServer was called
            expect(runServer).toHaveBeenCalled();
        });

        it('should not start the server when imported as a module', () => {
            // Mock isMainModule to return false
            jest.spyOn(require('../../server'), 'isMainModule').mockReturnValue(false);
            
            // Call startIfMain
            startIfMain();

            // Verify runServer was not called
            expect(runServer).not.toHaveBeenCalled();
        });
    });

    describe('isMainModule', () => {
        it('should check if the module is the main module', () => {
            // The actual value doesn't matter as much as the fact that it returns a boolean
            expect(typeof isMainModule()).toBe('boolean');
        });
    });
});
