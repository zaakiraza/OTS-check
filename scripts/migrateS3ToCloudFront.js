/**
 * Script to find and update S3 URLs to CloudFront URLs in the database
 * 
 * This script finds all records with S3 URLs and creates a corresponding CloudFront URL
 * for each one, based on the requirement to change the base URL while keeping the path.
 */

require('dotenv').config();
const db = require('../models');
const fs = require('fs');
const path = require('path');

// Configuration
const S3_DOMAIN = 's3.ap-south-1.amazonaws.com';
const S3_BUCKET = 'ots-content-123';
const CLOUDFRONT_DOMAIN = 'https://d1anu2ld58f7nz.cloudfront.net';
const DRY_RUN = false; // Set to false to actually update the database

// Models and their URL field mappings that we've identified
const MODEL_URL_FIELDS = {
  'User': ['imageUrl'],
  'Subject': ['imageUrl'],
  'Chapter': ['imageUrl'],
  'Lesson': ['contentUrl', 'videoUrls'],
  'Course': ['certificateUrl'],
  'Testimonial': ['img_url', 'videoUrl']
};

/**
 * Convert S3 URL to CloudFront URL
 * @param {string} s3Url - The original S3 URL
 * @returns {string} - The CloudFront URL
 */
function convertS3UrlToCloudFront(s3Url) {
  if (!s3Url || typeof s3Url !== 'string') {
    return s3Url;
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
  } catch (error) {
    console.error('Error converting S3 URL:', error);
  }
  
  // If not an S3 URL or error occurs, return original
  return s3Url;
}

/**
 * Process records from a model and update S3 URLs to CloudFront URLs
 * @param {string} modelName - The name of the model
 * @param {Array} urlFields - Array of field names that might contain URLs
 * @returns {Object} - Statistics about the updates
 */
async function updateS3UrlsForModel(modelName, urlFields) {
  const stats = {
    recordsExamined: 0,
    recordsUpdated: 0,
    urlsConverted: 0,
  };
  
  try {
    const model = db[modelName];
    if (!model) {
      console.error(`Model ${modelName} not found`);
      return stats;
    }
    
    // Create a where clause to find records with non-empty URL fields
    const whereConditions = [];
    urlFields.forEach(field => {
      whereConditions.push({
        [field]: { [db.Sequelize.Op.not]: null }
      });
    });
    
    const whereClause = { [db.Sequelize.Op.or]: whereConditions };
    
    // Get records
    const records = await model.findAll({ where: whereClause });
    stats.recordsExamined = records.length;
    
    console.log(`Processing ${records.length} records in ${modelName}...`);
    
    // Process each record
    for (const record of records) {
      let recordUpdated = false;
      const updates = {};
      
      // Check each URL field
      for (const field of urlFields) {
        const originalValue = record[field];
        
        // Skip if field is empty
        if (!originalValue) continue;
        
        // Handle JSON fields (like videoUrls)
        if (typeof originalValue === 'object' || Array.isArray(originalValue)) {
          // Check if it's an array of URLs
          if (Array.isArray(originalValue)) {
            let arrayUpdated = false;
            const newArray = originalValue.map(url => {
              const newUrl = convertS3UrlToCloudFront(url);
              if (newUrl !== url) {
                stats.urlsConverted++;
                arrayUpdated = true;
                return newUrl;
              }
              return url;
            });
            
            if (arrayUpdated) {
              updates[field] = newArray;
              recordUpdated = true;
            }
          }
        } else if (typeof originalValue === 'string') {
          // Handle string URL fields
          const newValue = convertS3UrlToCloudFront(originalValue);
          if (newValue !== originalValue) {
            updates[field] = newValue;
            recordUpdated = true;
            stats.urlsConverted++;
          }
        }
      }
      
      // Update the record if needed
      if (recordUpdated && !DRY_RUN) {
        await record.update(updates);
        stats.recordsUpdated++;
      } else if (recordUpdated) {
        // In dry run mode, just log and count
        console.log(`Would update ${modelName} record #${record.id}:`, updates);
        stats.recordsUpdated++;
      }
    }
    
  } catch (error) {
    console.error(`Error updating URLs for ${modelName}:`, error);
  }
  
  return stats;
}

/**
 * Save a log of the URL changes
 * @param {Array} logs - Array of log entries
 */
function saveChangeLog(logs) {
  try {
    const logFilePath = path.join(__dirname, 'url_migration_log.json');
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    console.log(`Log saved to ${logFilePath}`);
  } catch (error) {
    console.error('Error saving log:', error);
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('Starting S3 to CloudFront URL migration...');
    if (DRY_RUN) {
      console.log('RUNNING IN DRY RUN MODE - No actual database updates will be made');
    }
    
    const allStats = {
      totalRecordsExamined: 0,
      totalRecordsUpdated: 0,
      totalUrlsConverted: 0,
      modelStats: {}
    };
    
    const logs = [];
    
    // Process each model
    for (const modelName in MODEL_URL_FIELDS) {
      const urlFields = MODEL_URL_FIELDS[modelName];
      
      console.log(`\nProcessing ${modelName} model with URL fields: ${urlFields.join(', ')}`);
      const stats = await updateS3UrlsForModel(modelName, urlFields);
      
      // Log the results
      console.log(`- Records examined: ${stats.recordsExamined}`);
      console.log(`- Records that would be updated: ${stats.recordsUpdated}`);
      console.log(`- URLs that would be converted: ${stats.urlsConverted}`);
      
      // Aggregate statistics
      allStats.totalRecordsExamined += stats.recordsExamined;
      allStats.totalRecordsUpdated += stats.recordsUpdated;
      allStats.totalUrlsConverted += stats.urlsConverted;
      allStats.modelStats[modelName] = stats;
      
      // Add to logs
      logs.push({
        timestamp: new Date().toISOString(),
        model: modelName,
        stats: stats
      });
    }
    
    // Output overall statistics
    console.log('\n======= SUMMARY =======');
    console.log(`Total records examined: ${allStats.totalRecordsExamined}`);
    console.log(`Total records updated: ${allStats.totalRecordsUpdated}`);
    console.log(`Total URLs converted: ${allStats.totalUrlsConverted}`);
    
    // Save the log
    saveChangeLog(logs);
    
    console.log('\nScript completed successfully!');
    if (DRY_RUN) {
      console.log('To perform actual updates, change DRY_RUN to false in the script.');
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    // Close database connection
    await db.sequelize.close();
  }
}

// Run the script
main();

// Export functions for testing or reuse
module.exports = {
  convertS3UrlToCloudFront,
  updateS3UrlsForModel
}; 