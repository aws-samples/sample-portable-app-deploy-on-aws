import app from './app';

console.log('Starting local development server...');
console.log('Creating Express application instance');
console.log('Initializing Express application dependencies');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;
console.log(`Using port: ${PORT}`);

export const server = app.listen(PORT, () => {
  console.log(`
 _                              _ 
| |    __ _ _   _  ___ _ __ __| |
| |   / _\` | | | |/ _ \\ '__/ _\` |
| |__| (_| | |_| |  __/ | | (_| |
|_____\\__,_|\\__, |\\___|_|  \\__,_|
            |___/                 
`);
  console.log('🚀 Server successfully started!');
  console.log(`📡 Server running at http://localhost:${PORT}\n`);
  console.log('📍 Available endpoints:');
  console.log('  GET    /health    - Health check endpoint');
  console.log('  GET    /version   - Get architecture version');
  console.log('  POST   /users     - Create a new user');
  console.log('  GET    /users     - List all users');
  console.log('  GET    /users/:id - Get user by ID');
  console.log('  DELETE /users/:id - Delete user by ID');
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('Please try using a different port by setting the PORT environment variable');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});
