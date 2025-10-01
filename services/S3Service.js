const AWS = require("aws-sdk");

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_BUCKET_REGION,
      signatureVersion: "v4",
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    // Add CloudFront domain
    this.cloudfrontDomain = "https://d1anu2ld58f7nz.cloudfront.net";
  }

  /**
   * Generate a signed URL for uploading a file to S3
   * @param {string} fileType - The MIME type of the file (e.g., 'image/jpeg')
   * @param {string} fileName - The name of the file
   * @returns {Promise<string>} The signed URL for uploading
   */
  async generateUploadUrl(fileType, fileName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName, // Use the fileName as provided by the frontend
        Expires: 300, // URL expires in 5 minutes
        ContentType: fileType,
      };

      

      const uploadUrl = await this.s3.getSignedUrlPromise("putObject", params);
      // Construct CloudFront URL using the same file path
      console.log(uploadUrl);
      const cloudfrontUploadUrl = `${this.cloudfrontDomain}/${fileName}`;

      return {
        status: true,
        data: {
          uploadUrl: uploadUrl,
          fileName: fileName,
          fileType: fileType,
          cloudfrontUploadUrl: cloudfrontUploadUrl
        },
        message: "Signed URL generated successfully",
      };
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return {
        status: false,
        data: null,
        message: "Failed to generate signed URL",
      };
    }
  }

  /**
   * Generate a signed URL for downloading/reading a file from S3
   * @param {string} fileName - The name of the file in S3
   * @param {number} expiresIn - Time in seconds until URL expires (default: 300)
   * @returns {Promise<string>} The signed URL for downloading
   */
  async generateDownloadUrl(fileName, expiresIn = 300) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Expires: expiresIn,
      };

      const downloadURL = await this.s3.getSignedUrlPromise(
        "getObject",
        params
      );
      
      // Add CloudFront URL for download
      const cloudfrontUrl = `${this.cloudfrontDomain}/${fileName}`;

      return {
        status: true,
        data: {
          downloadUrl: downloadURL,
          fileName: fileName,
          // Add CloudFront URL
          cloudfrontUrl: cloudfrontUrl
        },
        message: "Download URL generated successfully",
      };
    } catch (error) {
      console.error("Error generating download URL:", error);
      return {
        status: false,
        data: null,
        message: "Failed to generate download URL",
      };
    }
  }
}

module.exports = new S3Service();
