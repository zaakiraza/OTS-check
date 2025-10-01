1. Users Table
1. id (Primary Key)     2. firstName     3. lastName     4.username     5. email (Unique)     6. phone (Unique)     7. password     8. roleId (Foreign Key → Roles)     
9. dob     10. gender     11. imageUrl     12. qualification (Matric, Inter, O-level, etc.)     13. designation (For Professionals)     14. youAre (Student, Professional, Other)     
15. rememberToken (For "Remember Me" functionality)     16. resetToken (For "Forgot Password" functionality)     17. resetTokenExpiresAt     18. createdAt     19. updatedAt

2. Roles Table
1. id (Primary Key)     2. name (Super Admin, Admin, Instructor, Student)

Relationships:
Users (roleId) → Roles (id)

3. EducationalInfo Table
1. id (Primary Key)     2. userId (Foreign Key → Users)     3. className (10th, 12th, Bachelor's, etc.)     4. institutionType (Private, Government, Home School)     
5. institutionName     6. boardSystem (Matric Board, Inter Board, Cambridge, etc.)     7. passingYear     8. isCurrentEducation (Boolean - Whether it is the current education)

Relationships:
EducationalInfo (userId) → Users (id)

4. Courses Table (For LinkedIn-style education history)
1. id (Primary Key)     2. userId (Foreign Key → Users)     3. courseName (Web Development, Data Science, etc.)     4. institutionName (Udemy, Coursera, University, etc.)     5. startDate     6. endDate     7. certificateUrl (If any)     8. isCompleted (Boolean)

Relationships:
Courses (userId) → Users (id)

5. Categories Table
1. id (Primary Key)     2. name(Academic/Skill Based)     3. createdAt     4. updatedAt

6. SubCategories Table
1. id (Primary Key)     2. name(Coding, Marketing etc)     3. categoryId     4. createdAt     5. updatedAt

Relationships:
SubCategories (categoryId) → Categories (id)

7. Subjects/Courses Table
1. id (Primary Key)     2. name(math, phy, web development etc)     3. subcategoryId     4. instructorId     5. description     6. rating     7. createdAt     8. updatedAt

Relationships:
Subjects (subcategoryId) → SubCategories (id)
Subjects (instructorId) → Users (id)

7.1 chapter
1. id (Primary Key)     2. title(Chapter 01 Scalar & Vector)     3. subjectId     4. description     5. duration     
6. createdAt     7. updatedAt


8. Lessons Table
1. id (Primary Key)     2. title     3. description     4. duration     5. videoUrl     6. chapterId     7. subjectId     8. ImageUrl     9. contentUrl     10. createdAt     11. updatedAt

Relationships:
Lessons (courseId) → Courses (id) (For skill-based)
Lessons (subjectId) → Subjects (id) (For academic)


8.1 Enrollment
1. id (Primary Key)     2. studentId     3. subcategoryId

8.2 Progress
1.  id (Primary Key)     2. enrollmentId     3. subcategoryId     4. progress (json)


9. Topics Table
1. id (Primary Key)     2. title     3. content     4. duration     5. videoUrl     6. lessonId     7. ImageUrl     8. createdAt     9. updatedAt

Relationships:
Topics (lessonId) → Lessons (id)


10. Quizzes Table
1. id (Primary Key)     2. question     3. optionA     4. optionB     5. optionC     6. optionD     7. correctAnswer     8. duration     9. lessonId     10. createdAt     11. updatedAt

Relationships:
Quizzes (lessonId) → Lessons (id)