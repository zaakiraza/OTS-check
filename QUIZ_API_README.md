# Quiz API Documentation

## Overview

This is a comprehensive Quiz API system that provides complete CRUD operations, quiz delivery, and attempt/result management. The system follows clean architecture patterns and integrates seamlessly with the existing codebase.

## Features

- ✅ Complete Quiz CRUD operations
- ✅ Question and Option management
- ✅ Quiz attempt tracking and scoring
- ✅ Student-facing quiz delivery (without exposing correct answers)
- ✅ Teacher/Admin dashboard functionality
- ✅ Comprehensive validation with Joi
- ✅ Clean architecture with repositories and controllers
- ✅ Defensive programming with proper error handling
- ✅ Postman collection for testing

## Database Schema

### Tables Created

1. **Quizzes** - Main quiz entities
2. **Questions** - Quiz questions with points
3. **Options** - Multiple choice options for questions
4. **QuizAttempts** - Student attempt headers
5. **AttemptAnswers** - Individual question answers within attempts

### Key Features

- **Display Order**: All tables have `display_order` columns for future sorting, but they're never exposed in API requests
- **Cascade Deletes**: Proper foreign key relationships with cascade deletes
- **Scoring System**: Automatic scoring based on correct/incorrect answers
- **Validation**: Cannot delete options that are set as correct answers
- **Indexes**: Optimized database indexes for better performance

## Setup Instructions

### 1. Run Migrations

```bash
npm run migrate
```

This will create all the necessary database tables with proper relationships and indexes.

### 2. Test the APIs

Import the Postman collection from `postman/Quiz_API.postman_collection.json` and test all endpoints.

### 3. Environment Variables

Make sure your `.env` file has the proper database configuration.

## API Endpoints

### Quiz Management (Admin/Teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes` | Create new quiz |
| PUT | `/api/quizzes/:quizId` | Update quiz |
| DELETE | `/api/quizzes/:quizId` | Delete quiz (cascades) |
| PUT | `/api/quizzes/:quizId/publish` | Publish/unpublish quiz |
| GET | `/api/quizzes/:quizId/attempts` | List quiz attempts |
| GET | `/api/quizzes/:quizId/stats` | Get quiz statistics |

### Question Management (Admin/Teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/:quizId/questions` | Add question with options |
| PUT | `/api/quizzes/questions/:questionId` | Update question |
| PUT | `/api/quizzes/questions/:questionId/correct` | Set correct option |

### Option Management (Admin/Teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/questions/:questionId/options` | Add option |
| PUT | `/api/quizzes/options/:optionId` | Update option |
| DELETE | `/api/quizzes/options/:optionId` | Delete option |

### Student Quiz Taking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/:quizId/play` | Get quiz for playing |
| POST | `/api/quizzes/:quizId/attempts/start` | Start attempt |
| POST | `/api/quizzes/:quizId/attempts/:attemptId/submit` | Submit answers |

### Attempt Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/attempts/:attemptId` | Get attempt details |
| GET | `/api/quizzes/students/:studentId/attempts` | List student attempts |

## Request/Response Examples

### 1. Create Quiz

**Request:**
```json
POST /api/quizzes
{
  "title": "Math Quiz 1",
  "entity_type": "Lesson",
  "entity_id": 123,
  "time_limit_sec": 600,
  "is_active": true
}
```

**Response:**
```json
{
  "status": true,
  "message": "Quiz created successfully",
  "data": {
    "id": 1,
    "title": "Math Quiz 1",
    "entity_type": "Lesson",
    "entity_id": 123,
    "time_limit_sec": 600,
    "is_active": true
  }
}
```

### 2. Add Question with Options

**Request:**
```json
POST /api/quizzes/1/questions
{
  "text": "What is 2 + 2?",
  "points": 1,
  "options": [
    { "text": "3" },
    { "text": "4" },
    { "text": "5" }
  ],
  "correct_option_index": 1
}
```

**Response:**
```json
{
  "status": true,
  "message": "Question created successfully",
  "data": {
    "question_id": 100,
    "option_ids": [1001, 1002, 1003],
    "correct_option_id": 1002
  }
}
```

### 3. Get Quiz for Play

**Request:**
```json
GET /api/quizzes/1/play
```

**Response:**
```json
{
  "status": true,
  "message": "Quiz retrieved successfully",
  "data": {
    "id": 1,
    "title": "Math Quiz 1",
    "entity_type": "Lesson",
    "entity_id": 123,
    "time_limit_sec": 600,
    "questions": [
      {
        "id": 100,
        "text": "What is 2 + 2?",
        "points": 1,
        "options": [
          { "id": 1001, "text": "3" },
          { "id": 1002, "text": "4" },
          { "id": 1003, "text": "5" }
        ]
      }
    ]
  }
}
```

### 4. Submit Attempt

**Request:**
```json
POST /api/quizzes/1/attempts/900/submit
{
  "student_id": 55,
  "answers": [
    { "question_id": 100, "selected_option_id": 1002 }
  ]
}
```

**Response:**
```json
{
  "status": true,
  "message": "Quiz attempt submitted successfully",
  "data": {
    "attempt_id": 900,
    "quiz_id": 1,
    "student_id": 55,
    "score": 1,
    "submitted_at": "2025-09-21T10:05:50Z",
    "duration_sec": 350,
    "answers": [
      {
        "question_id": 100,
        "selected_option_id": 1002,
        "is_correct": true,
        "points_awarded": 1
      }
    ]
  }
}
```

## Validation Rules

### Quiz Creation
- `entity_id`: Required integer
- `entity_type`: Optional, must be "Lesson" or "Chapter"
- `title`: Optional string (1-255 chars)
- `time_limit_sec`: Optional positive integer
- `is_active`: Optional boolean (default: true)

### Question Creation
- `text`: Required string
- `points`: Optional positive number (default: 1)
- `options`: Required array with minimum 2 options
- `correct_option_index`: Required zero-based index

### Answer Submission
- `student_id`: Required positive integer
- `answers`: Required array with question_id and optional selected_option_id

## Security & Validation

- All endpoints require authentication (`authenticateToken` middleware)
- Admin/Teacher endpoints require admin privileges (`isAdmin` middleware)
- Comprehensive input validation with Joi schemas
- Defensive checks prevent:
  - Submitting to inactive quizzes
  - Deleting options that are set as correct answers
  - Invalid option selections
  - Duplicate submissions (upsert logic)

## Architecture

The system follows clean architecture principles:

- **Models**: Sequelize models with proper associations
- **Repositories**: Data access layer with business logic
- **Controllers**: HTTP request handling and response formatting
- **Validators**: Input validation with Joi schemas
- **Routes**: Express route definitions with middleware

## File Structure

```
├── migrations/
│   ├── 20250921000000-create-quizzes.js
│   ├── 20250921000001-create-questions.js
│   ├── 20250921000002-create-options.js
│   ├── 20250921000003-create-quiz-attempts.js
│   ├── 20250921000004-create-attempt-answers.js
│   └── 20250921000005-add-correct-option-fk.js
├── models/
│   ├── Quiz.js
│   ├── Question.js
│   ├── Option.js
│   ├── QuizAttempt.js
│   └── AttemptAnswer.js
├── repos/
│   ├── QuizRepo.js
│   ├── QuestionRepo.js
│   ├── OptionRepo.js
│   ├── QuizAttemptRepo.js
│   └── AttemptAnswerRepo.js
├── controllers/
│   └── QuizController.js
├── validators/
│   └── QuizValidator.js
├── router/
│   └── quiz.route.js
└── postman/
    └── Quiz_API.postman_collection.json
```

## Testing

Use the provided Postman collection to test all endpoints. The collection includes:

- Individual endpoint tests
- Complete quiz flow test scenario
- Proper variable management for chaining requests
- Response validation tests

## Notes

- **Display Order**: The `display_order` columns exist in the database but are never exposed in API requests as per requirements
- **Camel Case**: All API responses use camelCase notation consistent with existing codebase
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Transactions**: Database transactions ensure data consistency during complex operations
- **Pagination**: All list endpoints support pagination with `page` and `limit` parameters

This implementation provides a production-ready quiz system that can handle complex quiz scenarios while maintaining data integrity and security.
