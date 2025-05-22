
// This script is used by the server-side API to execute update and restart operations
// It should only be executable by the server process

async function updateApplication() {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    // Execute the update script with appropriate permissions
    exec('/opt/visionhub/deploy/update-app.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('Update script execution failed:', error);
        console.error('STDERR:', stderr);
        reject(error);
        return;
      }
      
      console.log('Application update output:', stdout);
      resolve({
        success: true,
        output: stdout
      });
    });
  });
}

async function restartServer() {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    // Execute the restart command with appropriate permissions
    exec('systemctl restart visionhub.service', (error, stdout, stderr) => {
      if (error) {
        console.error('Server restart failed:', error);
        console.error('STDERR:', stderr);
        reject(error);
        return;
      }
      
      console.log('Server restart output:', stdout);
      resolve({
        success: true,
        output: stdout
      });
    });
  });
}

module.exports = {
  updateApplication,
  restartServer
};
