/**
 * Script to extract all database records that contain URL fields
 * 
 * This script identifies models with URL fields and retrieves records that have those URLs.
 * It can be used to convert S3 URLs to CloudFront URLs or for other bulk URL operations.
 */

require('dotenv').config();
const db = require('../models');
const path = require('path');
const fs = require('fs');

// Define URL field patterns to look for
const URL_FIELD_PATTERNS = [
  'url',
  'Url',
  'URL',
  'link',
  'Link'
];

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
 * Checks if a field is likely to be a URL field based on its name
 * @param {string} fieldName - The name of the field to check
 * @returns {boolean} - True if the field name suggests it might contain a URL
 */
function isLikelyUrlField(fieldName) {
  return URL_FIELD_PATTERNS.some(pattern => fieldName.includes(pattern));
}

/**
 * Get all models that have URL fields
 * @returns {Array} - Array of model names with URL fields
 */
async function getModelsWithUrlFields() {
  const modelsWithUrls = [];
  
  // Get all model files
  const modelFiles = fs.readdirSync(path.join(__dirname, '../models'))
    .filter(file => file !== 'index.js' && file.endsWith('.js'));
  
  console.log('Analyzing models for URL fields...');
  
  // For each model already identified with URL fields
  for (const modelName in MODEL_URL_FIELDS) {
    const fields = MODEL_URL_FIELDS[modelName];
    console.log(`- ${modelName}: ${fields.join(', ')}`);
    modelsWithUrls.push(modelName);
  }
  
  return modelsWithUrls;
}

/**
 * Get records from a model that have non-empty URL fields
 * @param {string} modelName - The name of the model
 * @param {Array} urlFields - Array of field names that might contain URLs
 * @returns {Array} - Records with URL fields
 */
async function getRecordsWithUrls(modelName, urlFields) {
  try {
    const model = db[modelName];
    if (!model) {
      console.error(`Model ${modelName} not found`);
      return [];
    }
    
    // Create a where clause that checks if any URL field is not null
    const whereConditions = [];
    urlFields.forEach(field => {
      // For JSON fields like videoUrls, we need to check differently
      if (model.rawAttributes[field]?.type?.key === 'JSON') {
        whereConditions.push({
          [field]: { [db.Sequelize.Op.not]: null }
        });
      } else {
        whereConditions.push({
          [field]: { [db.Sequelize.Op.not]: null }
        });
      }
    });
    
    const whereClause = { [db.Sequelize.Op.or]: whereConditions };
    
    // Get records
    const records = await model.findAll({
      where: whereClause,
      raw: true
    });
    
    console.log(`Found ${records.length} records in ${modelName} with URL fields`);
    return records.map(record => {
      // Add metadata about which model this comes from
      return {
        ...record,
        _modelName: modelName
      };
    });
  } catch (error) {
    console.error(`Error getting records from ${modelName}:`, error);
    return [];
  }
}

/**
 * Process URLs in records to convert them or perform other operations
 * @param {Array} records - Records with URL fields
 * @param {Object} modelUrlFields - Mapping of models to their URL fields
 * @returns {Object} - Statistics about processed records
 */
function processUrls(records, modelUrlFields) {
  const stats = {
    total: records.length,
    withUrls: 0,
    s3UrlsFound: 0,
    processed: 0,
  };
  
  const processedRecords = [];
  
  records.forEach(record => {
    const modelName = record._modelName;
    const urlFields = modelUrlFields[modelName];
    let hasUrl = false;
    
    urlFields.forEach(field => {
      if (record[field]) {
        hasUrl = true;
        
        // Check if it's an S3 URL
        if (typeof record[field] === 'string' && 
            record[field].includes('s3.ap-south-1.amazonaws.com')) {
          stats.s3UrlsFound++;
          
          // Here you could transform the URL if needed
          // For example: record[field] = convertS3ToCloudFront(record[field]);
          stats.processed++;
        } 
        // Handle JSON field that might contain URLs (like videoUrls)
        else if (typeof record[field] === 'object' || 
                (typeof record[field] === 'string' && record[field].startsWith('['))) {
          try {
            const urlArray = typeof record[field] === 'object' 
              ? record[field] 
              : JSON.parse(record[field]);
              
            if (Array.isArray(urlArray)) {
              urlArray.forEach((url, index) => {
                if (url && url.includes('s3.ap-south-1.amazonaws.com')) {
                  stats.s3UrlsFound++;
                  
                  // Here you could transform the URL if needed
                  // urlArray[index] = convertS3ToCloudFront(url);
                  stats.processed++;
                }
              });
            }
          } catch (e) {
            console.error(`Error parsing JSON in ${modelName}.${field}:`, e);
          }
        }
      }
    });
    
    if (hasUrl) {
      stats.withUrls++;
      processedRecords.push(record);
    }
  });
  
  return { stats, processedRecords };
}

/**
 * Convert S3 URL to CloudFront URL
 * @param {string} s3Url - The S3 URL to convert
 * @returns {string} - The CloudFront URL
 */
function convertS3ToCloudFront(s3Url) {
  // Extract the file key from the S3 URL
  const urlParts = s3Url.split('/');
  const fileKey = urlParts[urlParts.length - 1];
  
  // Construct the CloudFront URL
  return `https://d1anu2ld58f7nz.cloudfront.net/${fileKey}`;
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('Starting URL entity extraction...');
    
    // Get models with URL fields
    const modelsWithUrls = await getModelsWithUrlFields();
    console.log(`Found ${modelsWithUrls.length} models with URL fields`, modelsWithUrls);

    return;
    
    // Get records from each model
    let allRecords = [];
    
    for (const modelName of modelsWithUrls) {
      const urlFields = MODEL_URL_FIELDS[modelName];
      const records = await getRecordsWithUrls(modelName, urlFields);
      allRecords = allRecords.concat(records);
    }
    
    // Process URLs
    const { stats, processedRecords } = processUrls(allRecords, MODEL_URL_FIELDS);
    
    console.log('\nURL Processing Results:');
    console.log(`- Total records examined: ${stats.total}`);
    console.log(`- Records with URLs: ${stats.withUrls}`);
    console.log(`- S3 URLs found: ${stats.s3UrlsFound}`);
    console.log(`- URLs processed: ${stats.processed}`);
    
    // Example output of the first few records with URLs
    if (processedRecords.length > 0) {
      console.log('\nSample Records:');
      processedRecords.slice(0, 3).forEach((record, i) => {
        console.log(`\nRecord ${i+1} (${record._modelName}):`);
        const urlFields = MODEL_URL_FIELDS[record._modelName];
        urlFields.forEach(field => {
          if (record[field]) {
            console.log(`- ${field}: ${typeof record[field] === 'object' ? JSON.stringify(record[field]) : record[field]}`);
          }
        });
      });
      console.log('\n...');
    }
    
    // If needed, you could save the results to a file
    // fs.writeFileSync('url_records.json', JSON.stringify(processedRecords, null, 2));
    
    console.log('\nScript completed successfully!');
    
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
  getModelsWithUrlFields,
  getRecordsWithUrls,
  processUrls,
  convertS3ToCloudFront
}; 