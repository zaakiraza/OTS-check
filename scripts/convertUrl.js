#!/usr/bin/env node

/**
 * Simple command-line tool to convert S3 URLs to CloudFront URLs
 * 
 * Usage:
 * node convertUrl.js "https://ots-content-123.s3.ap-south-1.amazonaws.com/file.pdf"
 */

// Configuration
const S3_DOMAIN = 's3.ap-south-1.amazonaws.com';
const S3_BUCKET = 'ots-content-123';
const CLOUDFRONT_DOMAIN = 'https://d1anu2ld58f7nz.cloudfront.net';

/**
 * Convert S3 URL to CloudFront URL
 * @param {string} s3Url - The original S3 URL
 * @returns {string} - The CloudFront URL
 */
function convertS3UrlToCloudFront(s3Url) {
  if (!s3Url || typeof s3Url !== 'string') {
    return 'Invalid URL provided';
  }
  
  try {
    // Check if it's an S3 URL
    if (s3Url.includes(S3_DOMAIN) && s3Url.includes(S3_BUCKET)) {
      // Extract the file path (everything after the bucket name)
      let filePath;
      
      // Parse URL to extract file path
      if (s3Url.includes(`/${S3_BUCKET}/`)) {
        // URL format: https://s3.ap-south-1.amazonaws.com/ots-content-123/file.pdf
        filePath = s3Url.split(`/${S3_BUCKET}/`)[1];
      } else if (s3Url.includes(`${S3_BUCKET}.s3.ap-south-1.amazonaws.com`)) {
        // URL format: https://ots-content-123.s3.ap-south-1.amazonaws.com/file.pdf
        filePath = s3Url.split('.amazonaws.com/')[1];
      }
      
      if (filePath) {
        // Create CloudFront URL with the same file path
        return `${CLOUDFRONT_DOMAIN}/${filePath}`;
      }
    }
    
    return 'Not a valid S3 URL for the specified bucket';
  } catch (error) {
    console.error('Error converting S3 URL:', error);
    return 'Error processing URL';
  }
}
