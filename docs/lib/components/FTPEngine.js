import ftp from 'basic-ftp';
class FTPEngine {
  constructor(config) {
    this.client = new ftp.Client();
    this.config = config;
  }
  async connect() {
    try {
      await this.client.access({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        secure: this.config.secure
      });
      console.log("Connected to FTP server");
    } catch (error) {
      console.error("FTP connection error:", error);
    }
  }
  async uploadFile(localPath, remotePath) {
    try {
      await this.client.uploadFrom(localPath, remotePath);
      console.log("File uploaded successfully");
    } catch (error) {
      console.error("FTP upload error:", error);
    }
  }
  async disconnect() {
    await this.client.close();
  }
}
export default FTPEngine;