const BaseRepository = require("./BaseRepo");
const db = require("../models/index.js");
const NodeCache = require("node-cache");

// Cache with 5 minute TTL - store only IDs and simple data, not complex objects
const enrollmentCache = new NodeCache({ stdTTL: 300 });

class EnrollmentRepo extends BaseRepository {
  model;
  constructor() {
    super(db.Enrollment);
    this.model = db.Enrollment;
  }

  async createEnrollment(enrollment, options = {}) {
    const result = await this.create(enrollment, options);
    // Invalidate any cache entries that might be related to this enrollment
    if (enrollment.studentId) enrollmentCache.del(`student:${enrollment.studentId}`);
    if (enrollment.subcategoryId) enrollmentCache.del(`subcategory:${enrollment.subcategoryId}`);
    return result;
  }

  async findEnrollments(customQuery = null) {
    // Do not cache complex query results to avoid TCP cloning issues
    return this.findAll(customQuery);
  }

  async findEnrollment(customQuery) {
    // Only cache IDs, not complex objects
    if (customQuery && 
        customQuery.where && 
        Object.keys(customQuery.where).length === 1 &&
        customQuery.where.id &&
        !customQuery.include) {
      const cacheKey = `enrollment_exists:${customQuery.where.id}`;
      const cachedId = enrollmentCache.get(cacheKey);
      
      if (cachedId === false) {
        return null;
      }
      
      if (cachedId) {
        return this.findOne(customQuery);
      }
      
      const result = await this.findOne(customQuery);
      
      enrollmentCache.set(cacheKey, result ? result.id : false);
      
      return result;
    }
    
    // For composite key query (studentId + subcategoryId) just check existence
    if (customQuery && 
        customQuery.where && 
        customQuery.where.studentId && 
        customQuery.where.subcategoryId &&
        !customQuery.include) {
      const cacheKey = `enrollment_exists:${customQuery.where.studentId}:${customQuery.where.subcategoryId}`;
      const exists = enrollmentCache.get(cacheKey);
      
      if (exists === false) {
        return null;
      }
      
      if (exists === true) {
        return this.findOne(customQuery);
      }
      
      const result = await this.findOne(customQuery);
      
      enrollmentCache.set(cacheKey, result ? true : false);
      
      return result;
    }
    
    // For all other queries, don't use cache
    return this.findOne(customQuery);
  }

  async updateEnrollment(data, query) {
    const result = await this.update(data, query);
    
    // If updating a specific enrollment, invalidate its cache
    if (query && query.where && query.where.id) {
      enrollmentCache.del(`enrollment_exists:${query.where.id}`);
      
      // Try to get the enrollment to invalidate related caches
      try {
        const enrollment = await this.findOne({ 
          where: { id: query.where.id },
          attributes: ['studentId', 'subcategoryId'],
          raw: true
        });
        
        if (enrollment) {
          if (enrollment.studentId) {
            enrollmentCache.del(`student:${enrollment.studentId}`);
            enrollmentCache.del(`enrollment_exists:${enrollment.studentId}:${enrollment.subcategoryId}`);
          }
          if (enrollment.subcategoryId) {
            enrollmentCache.del(`subcategory:${enrollment.subcategoryId}`);
          }
        }
      } catch (err) {
        console.error("Error invalidating cache:", err);
        // Continue even if cache invalidation fails
      }
    }
    
    return result;
  }

  async deleteEnrollment(query, options = {}) {
    // Try to get the enrollment first to invalidate caches after deletion
    let enrollmentToDelete;
    
    if (query && query.where && query.where.id) {
      try {
        enrollmentToDelete = await this.findOne({ 
          where: { id: query.where.id },
          attributes: ['studentId', 'subcategoryId'],
          raw: true
        });
      } catch (err) {
        console.error("Error finding enrollment for cache invalidation:", err);
        // Continue with deletion even if lookup fails
      }
    }
    
    const result = await this.delete(query, options);
    
    // Invalidate relevant caches
    if (enrollmentToDelete) {
      enrollmentCache.del(`enrollment_exists:${query.where.id}`);
      if (enrollmentToDelete.studentId) {
        enrollmentCache.del(`student:${enrollmentToDelete.studentId}`);
        if (enrollmentToDelete.subcategoryId) {
          enrollmentCache.del(`enrollment_exists:${enrollmentToDelete.studentId}:${enrollmentToDelete.subcategoryId}`);
        }
      }
      if (enrollmentToDelete.subcategoryId) {
        enrollmentCache.del(`subcategory:${enrollmentToDelete.subcategoryId}`);
      }
    }
    
    return result;
  }

  async count(whereClause = {}) {
    // Optimize count by using the indexed fields when possible
    if (Object.keys(whereClause).length === 1) {
      const key = Object.keys(whereClause)[0];
      const cacheKey = `count:${key}:${whereClause[key]}`;
      
      const cachedCount = enrollmentCache.get(cacheKey);
      if (cachedCount !== undefined) {
        return cachedCount;
      }
      
      const count = await this.model.count({ where: whereClause });
      
      // Cache count results for a shorter period (1 minute)
      enrollmentCache.set(cacheKey, count, 60); 
      
      return count;
    }
    
    return this.model.count({ where: whereClause });
  }

  async getEnrollmentsByStudent(studentId, options = {}) {
    // Don't cache complex objects, just execute the query
    const query = {
      where: { studentId },
      ...options
    };
    
    return this.findAll(query);
  }

  async getEnrollmentsBySubcategory(subcategoryId, options = {}) {
    // Don't cache complex objects, just execute the query
    const query = {
      where: { subcategoryId },
      ...options
    };
    
    return this.findAll(query);
  }
}

module.exports = new EnrollmentRepo(); 