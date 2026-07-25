# Room-Bot Service

# Database Design Document

**Project:** Room-Bot Service (Hostel Service Management System)

**Document:** Database Design

**Document ID:** DBD-04

**Version:** 1.0

**Prepared By:** Development Team

**Status:** Approved

---

# Document Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Release | Database Design Document |

---

# Table of Contents

1. Introduction
2. Database Objectives
3. Technology Stack
4. Database Design Principles
5. High-Level Database Architecture
6. Entity Overview
7. Naming Conventions
8. Data Integrity Rules
9. Scalability Considerations
10. Future Enhancements

---

# 1. Introduction

This document defines the database architecture for the Room-Bot Service platform. It describes how application data is organized, stored, secured, and maintained to support the system's functional and non-functional requirements.

The database is designed to provide:

- Reliable data storage
- Efficient querying
- High data integrity
- Secure access
- Scalability
- Maintainability

This document serves as the primary reference for backend developers, database administrators, and software architects.

---

# 2. Database Objectives

The database shall:

- Store all application data securely.
- Maintain relationships between entities.
- Prevent duplicate or inconsistent data.
- Support concurrent users efficiently.
- Enable fast search and retrieval.
- Enforce referential integrity.
- Support future feature expansion.
- Minimize redundancy through normalization.

---

# 3. Technology Stack

The Room-Bot Service backend shall use the following database technologies.

### Database Management System

PostgreSQL

### ORM

Prisma ORM

### Database Access

Express.js API using Prisma Client

### Migration Tool

Prisma Migrate

### Backup Strategy

Daily automated backups (deployment environment)

### Character Encoding

UTF-8

---

# 4. Database Design Principles

The database design follows these principles:

- Simplicity
- Consistency
- Normalization
- Referential Integrity
- Performance
- Security
- Scalability
- Maintainability

All tables shall be designed to reduce redundancy while preserving query efficiency.

---

# 5. High-Level Database Architecture

```
Frontend (React)

        │

Express.js REST API

        │

Prisma ORM

        │

PostgreSQL Database
```

The frontend shall never communicate directly with the database. All database operations shall be performed through authenticated backend APIs.

---

# 6. Core Database Modules

The database shall contain entities for:

- Authentication
- Students
- Staff
- Administrators
- Hostel Blocks
- Service Categories
- Service Requests
- Complaint Categories
- Complaints
- OTP Verification
- Feedback
- Notifications (Future)
- Audit Logs
- User Sessions (Optional)

---

# 7. Entity Relationships (Overview)

The primary relationships include:

- One Hostel Block → Many Students
- One Hostel Block → Many Staff Members
- One Student → Many Service Requests
- One Student → Many Complaints
- One Staff Member → Many Assigned Requests
- One Request → One Feedback
- One Student → Many OTP Records
- One Staff → One Block
- One Service Category → Many Requests

A detailed Entity Relationship Diagram (ERD) will be defined in later sections.

---

# 8. Naming Conventions

The following standards shall be used throughout the database.

### Tables

- Singular names
- Lowercase
- Snake case

Examples:

```
student

staff

service_request

complaint

feedback
```

### Columns

Lowercase snake_case.

Examples:

```
student_id

created_at

updated_at

request_status
```

### Primary Keys

```
id
```

### Foreign Keys

```
student_id

staff_id

block_id
```

### Index Names

```
idx_student_email

idx_request_status
```

### Unique Constraints

```
uq_student_email

uq_staff_email
```

---

# 9. Data Integrity Rules

The database shall enforce:

- Primary Keys
- Foreign Keys
- Unique Constraints
- NOT NULL Constraints
- CHECK Constraints
- Cascading rules where appropriate

Business rules shall be enforced through both the application layer and database constraints.

---

# 10. Scalability Considerations

The database shall be designed to support:

- Increased number of students
- Additional hostel blocks
- More staff members
- New service categories
- New complaint categories
- Future notification system
- Additional analytics modules

The schema shall support future expansion without requiring major redesign.

---

# 11. Future Enhancements

Future database improvements may include:

- Database replication
- Read replicas
- Partitioning large tables
- Full-text search
- Materialized views
- Background job tables
- Notification queue
- Analytics warehouse integration

These enhancements shall remain compatible with the Version 1.0 schema.

---

# End of Part 1
# 12. Entity Relationship Model (ER Model)

## 12.1 Purpose

This chapter defines the conceptual Entity Relationship (ER) model for the Room-Bot Service platform.

The ER Model identifies the major entities, their relationships, and the cardinality between them. It provides the logical foundation for the physical database schema described in later chapters.

This chapter focuses on relationships rather than table implementation.

---

# 12.2 Core Entities

The Version 1.0 database consists of the following primary entities:

- Student
- Staff
- Administrator
- Hostel Block
- Service Category
- Service Request
- Complaint Category
- Complaint
- Feedback
- OTP Verification

Each entity represents a distinct business object within the system.

---

# 12.3 High-Level ER Diagram

```
                   Hostel Block
                  ┌────────────┐
                  │   Block    │
                  └─────┬──────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
     Student                     Staff
          │                           │
          │                    Assigned To
          │                           │
          │                     Service Request
          │                           │
          ├──────────────┬────────────┘
          │              │
          │              │
     Complaint       Feedback
          │
          │
 Complaint Category

Service Request
       │
       │
Service Category

Student
   │
   │
OTP Verification
```

The ER diagram illustrates the logical relationships among the primary entities.

---

# 12.4 Relationship Definitions

The following relationships exist within the system.

| Parent Entity | Child Entity | Relationship |
|---------------|-------------|--------------|
| Hostel Block | Student | One-to-Many |
| Hostel Block | Staff | One-to-Many |
| Student | Service Request | One-to-Many |
| Student | Complaint | One-to-Many |
| Student | OTP Verification | One-to-Many |
| Staff | Service Request | One-to-Many |
| Service Category | Service Request | One-to-Many |
| Complaint Category | Complaint | One-to-Many |
| Service Request | Feedback | One-to-One |

These relationships enforce the business rules defined in the Product Requirements Document.

---

# 12.5 Cardinality

### One Hostel Block → Many Students

One hostel block may contain multiple students.

Each student belongs to exactly one hostel block.

---

### One Hostel Block → Many Staff Members

A block may have multiple staff members assigned.

Each staff member is assigned to a single hostel block.

---

### One Student → Many Service Requests

A student may submit multiple service requests over time.

Each request belongs to one student.

---

### One Staff Member → Many Service Requests

A staff member may handle many requests.

Each request is assigned to one staff member at a time.

---

### One Service Category → Many Requests

Each request belongs to one service category.

Examples:

- Cleaning
- Electrical
- Plumbing
- Internet
- Other

---

### One Complaint Category → Many Complaints

Each complaint belongs to one complaint category.

Examples:

- Hostel Facility
- Food
- Hygiene
- Water Supply
- Other

---

### One Service Request → One Feedback

A completed request may receive one feedback record.

Feedback cannot exist without a corresponding completed request.

---

### One Student → Many OTP Records

A student may receive multiple OTPs during account verification or password reset.

Only the latest valid OTP shall be accepted.

---

# 12.6 Relationship Rules

The following business rules shall be enforced.

### Student

- Must belong to exactly one hostel block.
- May create multiple requests.
- May create multiple complaints.

---

### Staff

- Must belong to one hostel block.
- Can only receive requests from the same block.

---

### Service Request

- Must reference one student.
- Must reference one service category.
- May reference one assigned staff member.
- May have one feedback after completion.

---

### Complaint

- Must reference one student.
- Must reference one complaint category.
- Complaints are reviewed by administrators.

---

### Feedback

- Cannot exist before request completion.
- One request can have at most one feedback entry.

---

### OTP Verification

- Belongs to one student.
- Has an expiry time.
- Becomes invalid after successful verification or expiration.

---

# 12.7 Relationship Integrity

To maintain consistency, the database shall enforce:

- Mandatory foreign key relationships
- Referential integrity
- Controlled deletion rules
- Valid relationship cardinality
- Prevention of orphan records

These constraints will be implemented in the physical schema.

---

# 12.8 Design Decisions

The ER model has been designed to:

- Minimize data redundancy
- Clearly separate business entities
- Support future expansion
- Simplify querying
- Maintain data consistency

The model intentionally avoids many-to-many relationships in Version 1.0, reducing implementation complexity while satisfying all current business requirements.

---

# 12.9 ER Model Validation Checklist

The Entity Relationship Model shall be considered complete when:

✓ Every business entity is represented.

✓ Relationships reflect system requirements.

✓ Cardinality is clearly defined.

✓ Business rules are supported.

✓ Referential integrity can be enforced.

✓ The model supports future expansion.

---

# End of Part 2
# 13. Database Schema Overview

## 13.1 Purpose

This chapter provides an overview of the physical database schema for the Room-Bot Service platform.

Unlike the Entity Relationship Model, which focuses on conceptual relationships, this chapter defines the tables that will be implemented in PostgreSQL and explains their role within the database.

Detailed column definitions will be covered in subsequent chapters.

---

# 13.2 Schema Organization

The database schema is organized into the following functional modules:

| Module | Purpose |
|---------|---------|
| User Management | Student, Staff, Administrator information |
| Authentication | Login credentials and OTP verification |
| Hostel Management | Hostel block information |
| Service Management | Service categories and service requests |
| Complaint Management | Complaint categories and complaints |
| Feedback Management | Student ratings and feedback |
| Audit & Logging | Administrative activity logs |
| Future Extensions | Notifications and user sessions |

Each module groups related tables to improve maintainability and scalability.

---

# 13.3 Table Inventory

The Version 1.0 database contains the following primary tables.

| Table Name | Description |
|------------|-------------|
| administrator | Administrator accounts |
| student | Student information |
| staff | Staff information |
| hostel_block | Hostel block details |
| service_category | Available service categories |
| service_request | Student service requests |
| complaint_category | Complaint classification |
| complaint | Student complaints |
| feedback | Feedback submitted after service completion |
| otp_verification | OTP verification records |
| audit_log | Administrative activity log |

Future versions may introduce additional tables without affecting the existing schema.

---

# 13.4 Module Dependencies

The tables depend on one another as follows:

```
Hostel Block
     │
     ├──────── Student
     │             │
     │             ├──────── Service Request
     │             │               │
     │             │               └──────── Feedback
     │             │
     │             ├──────── Complaint
     │             │
     │             └──────── OTP Verification
     │
     └──────── Staff
                    │
                    └──────── Assigned Service Requests

Service Category
        │
        └──────── Service Request

Complaint Category
        │
        └──────── Complaint

Administrator
        │
        └──────── Audit Log
```

This modular structure minimizes coupling while maintaining clear relationships.

---

# 13.5 Primary Design Decisions

The physical schema follows these design decisions:

- Every table has a single primary key.
- Foreign keys enforce entity relationships.
- Frequently queried data is normalized.
- Lookup data is stored in dedicated tables.
- Audit information is separated from transactional data.
- Future modules can be added without redesigning existing tables.

---

# 13.6 Table Categories

The database tables can be classified into the following categories.

### Master Tables

These contain relatively static reference data.

- hostel_block
- service_category
- complaint_category

---

### Transaction Tables

These store operational data generated during daily system usage.

- service_request
- complaint
- feedback

---

### User Tables

These store user account information.

- student
- staff
- administrator

---

### Supporting Tables

These provide authentication and operational support.

- otp_verification
- audit_log

---

# 13.7 Data Flow Overview

The following sequence illustrates how data moves through the system.

```
Student Login
      │
OTP Verification
      │
Student Dashboard
      │
Create Service Request
      │
Staff Assignment
      │
Request Completion
      │
Student Feedback
```

Similarly,

```
Student Login
      │
Submit Complaint
      │
Administrator Review
      │
Complaint Resolution
```

These workflows demonstrate how multiple tables interact during normal application operations.

---

# 13.8 Schema Design Principles

The physical schema has been designed to:

- Minimize redundancy
- Support efficient joins
- Maintain referential integrity
- Simplify future migrations
- Improve query performance
- Support reporting and analytics

The schema balances normalization with practical application performance.

---

# 13.9 Version 1.0 Scope

The Version 1.0 schema includes support for:

- Student management
- Staff management
- Administrator management
- Hostel block management
- Service request lifecycle
- Complaint management
- Feedback collection
- OTP verification
- Audit logging

The following features are reserved for future versions:

- Notification system
- User session tracking
- Real-time messaging
- File attachments
- Advanced analytics

---

# 13.10 Schema Overview Success Criteria

The schema overview shall be considered complete when:

✓ All database tables are identified.

✓ Tables are grouped into logical modules.

✓ Table responsibilities are clearly defined.

✓ Module dependencies are documented.

✓ Database structure supports future expansion.

✓ No unnecessary duplication of entities exists.

---

# End of Part 3
# 14. User Management Tables

## 14.1 Purpose

This chapter defines the database tables responsible for managing users within the Room-Bot Service platform.

Version 1.0 supports three user roles:

- Student
- Staff
- Administrator

Hostel block information is also included because both students and staff are associated with hostel blocks.

Authentication-related tables are intentionally excluded from this chapter and are documented separately.

---

# 14.2 Hostel Block Table

## Table Name

```
hostel_block
```

## Purpose

Stores information about hostel blocks.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Unique block identifier |
| block_name | VARCHAR(20) | UNIQUE, NOT NULL | Block name (A Block, B Block) |
| description | VARCHAR(200) | NULL | Optional description |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

### Relationships

- One hostel block has many students.
- One hostel block has many staff members.

---

# 14.3 Student Table

## Table Name

```
student
```

## Purpose

Stores student profile information.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Student identifier |
| registration_number | VARCHAR(30) | UNIQUE, NOT NULL | University registration number |
| full_name | VARCHAR(100) | NOT NULL | Student name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | University email |
| room_number | VARCHAR(20) | NOT NULL | Hostel room number |
| block_id | INTEGER | Foreign Key, NOT NULL | Hostel block |
| is_blocked | BOOLEAN | DEFAULT FALSE | Account status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

### Relationships

- Belongs to one hostel block.
- Can create many service requests.
- Can submit many complaints.
- Can submit feedback.
- Can generate OTP records.

---

# 14.4 Staff Table

## Table Name

```
staff
```

## Purpose

Stores hostel staff information.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Staff identifier |
| full_name | VARCHAR(100) | NOT NULL | Staff name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Staff email |
| service_role | VARCHAR(50) | NOT NULL | Cleaning, Electrical, Plumbing, etc. |
| block_id | INTEGER | Foreign Key, NOT NULL | Assigned hostel block |
| is_active | BOOLEAN | DEFAULT TRUE | Employment status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

### Relationships

- Belongs to one hostel block.
- Can be assigned multiple service requests.

---

# 14.5 Administrator Table

## Table Name

```
administrator
```

## Purpose

Stores administrator account information.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Administrator identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| full_name | VARCHAR(100) | NOT NULL | Administrator name |
| email | VARCHAR(150) | UNIQUE | Contact email |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

Administrator accounts are created manually by the system owner and cannot be registered through the application.

---

# 14.6 Foreign Key Relationships

| Child Table | Foreign Key | Parent Table |
|-------------|-------------|--------------|
| student | block_id | hostel_block |
| staff | block_id | hostel_block |

Foreign key constraints shall prevent invalid block references.

---

# 14.7 Business Rules

### Hostel Block

- Block names must be unique.
- A block may contain multiple students.
- A block may contain multiple staff members.

---

### Student

- Registration number must be unique.
- Email address must be unique.
- Every student must belong to one hostel block.
- Students may be blocked by administrators.
- Blocked students cannot access the system.

---

### Staff

- Staff email must be unique.
- Every staff member belongs to one hostel block.
- A staff member performs one primary service role in Version 1.0.

---

### Administrator

- Username must be unique.
- Administrator accounts are managed outside the public registration process.
- Administrators have unrestricted access to administrative features.

---

# 14.8 Index Recommendations

The following indexes should be created.

| Table | Column | Reason |
|--------|--------|--------|
| student | registration_number | Fast student lookup |
| student | email | Login and search |
| staff | email | Login and search |
| administrator | username | Administrator login |
| hostel_block | block_name | Block lookup |

Indexes shall be created only on frequently queried columns.

---

# 14.9 Data Validation Rules

Student Email

- Must follow valid email format.
- Must be unique.

Room Number

- Cannot be empty.
- Maximum length: 20 characters.

Staff Role

- Must match a valid service role defined by the application.

Block Name

- Cannot be duplicated.
- Cannot be empty.

Validation shall be enforced through both the application layer and database constraints.

---

# 14.10 User Management Success Criteria

The User Management module shall be considered complete when:

✓ Hostel blocks are stored separately.

✓ Student records are uniquely identifiable.

✓ Staff records are uniquely identifiable.

✓ Administrator accounts are securely managed.

✓ Foreign key relationships are enforced.

✓ Unique constraints prevent duplicate records.

✓ Business rules are reflected in the schema.

---

# End of Part 4
# 15. Authentication & Account Security Tables

## 15.1 Purpose

This chapter defines the database tables and data structures used for authentication and account security.

The objectives are to:

- Store encrypted credentials securely
- Support email OTP verification
- Enable password reset
- Track account verification status
- Maintain authentication integrity

Authentication data is intentionally separated from user profile data to improve security, maintainability, and future extensibility.

---

# 15.2 Authentication Architecture

Authentication is implemented using the following components:

- Password Hashing (bcrypt)
- JWT Access Token
- Email OTP Verification
- Password Reset OTP

The database stores only the information required to validate authentication.

JWT access tokens are stateless and shall not be stored in the database in Version 1.0.

---

# 15.3 Account Credential Table

## Table Name

```
account_credentials
```

## Purpose

Stores login credentials for all user accounts.

Separating credentials from profile information reduces security risks and simplifies authentication management.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Credential identifier |
| user_type | VARCHAR(20) | NOT NULL | Student, Staff, Administrator |
| user_id | INTEGER | NOT NULL | Reference to the corresponding user record |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt password hash |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| last_password_change | TIMESTAMP | NULL | Last password update |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

---

# 15.4 OTP Verification Table

## Table Name

```
otp_verification
```

## Purpose

Stores One-Time Password (OTP) records used for:

- Account registration
- Password reset

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | OTP identifier |
| user_type | VARCHAR(20) | NOT NULL | Student or Staff |
| user_id | INTEGER | NOT NULL | Associated user |
| otp_code | VARCHAR(10) | NOT NULL | Generated OTP |
| purpose | VARCHAR(30) | NOT NULL | Registration or Password Reset |
| expires_at | TIMESTAMP | NOT NULL | Expiration time |
| verified_at | TIMESTAMP | NULL | Verification timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |

OTP records shall be deleted or archived periodically after expiration.

---

# 15.5 Password Security

Passwords shall never be stored in plain text.

Requirements:

- Hashing algorithm: bcrypt
- Minimum cost factor: 12
- Password hashes are irreversible.
- Plain passwords shall never be logged or stored.

Password validation shall occur only through bcrypt hash comparison.

---

# 15.6 Email Verification

Students and staff must verify their email before accessing the system.

Verification process:

1. User registers.
2. OTP is generated.
3. OTP is sent via email.
4. User submits OTP.
5. Account is marked as verified.
6. User can log in.

Administrator accounts are created directly by the system owner and do not require email verification.

---

# 15.7 Password Reset Flow

Password reset process:

1. User requests password reset.
2. System generates a new OTP.
3. OTP is emailed to the user.
4. User verifies the OTP.
5. User sets a new password.
6. Password hash is updated.
7. Previous OTP becomes invalid.

Only one active password reset OTP shall exist for a user at any given time.

---

# 15.8 Authentication Constraints

The database shall enforce:

- Unique email addresses
- Non-null password hashes
- Valid user types
- Valid OTP purposes
- Expiration timestamps for OTPs

The application layer shall enforce:

- Password complexity
- OTP attempt limits
- Account lock policies (future enhancement)

---

# 15.9 Index Recommendations

| Table | Column | Reason |
|--------|--------|--------|
| account_credentials | email | Login lookup |
| account_credentials | user_id | User association |
| otp_verification | user_id | OTP lookup |
| otp_verification | expires_at | Cleanup expired OTPs |

Indexes shall optimize authentication-related queries while minimizing storage overhead.

---

# 15.10 Security Considerations

Authentication tables shall comply with the following principles:

- Store only hashed passwords
- Never expose password hashes through APIs
- Expire OTPs automatically
- Prevent OTP reuse
- Minimize authentication data retention
- Restrict direct database access

Authentication tables contain sensitive information and require stricter access controls than general application data.

---

# 15.11 Authentication Module Success Criteria

The Authentication module shall be considered complete when:

✓ Passwords are stored only as bcrypt hashes.

✓ Login credentials are separated from profile data.

✓ Email verification is supported.

✓ Password reset is supported.

✓ OTP records include expiration information.

✓ Authentication indexes support efficient login operations.

✓ Sensitive authentication data is adequately protected.

---

# End of Part 5
# 16. Service Management Tables

## 16.1 Purpose

This chapter defines the database tables used for managing hostel service requests.

The Service Management module enables students to create requests, administrators to monitor them, and staff members to complete assigned work.

This chapter focuses only on service-related data structures.

---

# 16.2 Service Category Table

## Table Name

```
service_category
```

## Purpose

Stores all service categories supported by the system.

Examples:

- Cleaning
- Electrical
- Plumbing
- Carpentry
- Internet
- Other

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Category identifier |
| category_name | VARCHAR(50) | UNIQUE, NOT NULL | Service category name |
| description | VARCHAR(200) | NULL | Category description |
| is_active | BOOLEAN | DEFAULT TRUE | Availability status |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

---

# 16.3 Service Request Table

## Table Name

```
service_request
```

## Purpose

Stores every service request submitted by students.

Each request progresses through its lifecycle until completion or cancellation.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Request identifier |
| student_id | INTEGER | Foreign Key, NOT NULL | Student who created the request |
| category_id | INTEGER | Foreign Key, NOT NULL | Requested service category |
| assigned_staff_id | INTEGER | Foreign Key, NULL | Assigned staff member |
| title | VARCHAR(150) | NOT NULL | Short request title |
| description | TEXT | NOT NULL | Detailed problem description |
| room_number | VARCHAR(20) | NOT NULL | Student room number |
| request_status | VARCHAR(25) | NOT NULL | Current request status |
| priority | VARCHAR(15) | DEFAULT 'Normal' | Request priority |
| assigned_at | TIMESTAMP | NULL | Assignment timestamp |
| completed_at | TIMESTAMP | NULL | Completion timestamp |
| cancelled_at | TIMESTAMP | NULL | Cancellation timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

---

# 16.4 Request Status Lifecycle

The application shall support the following request statuses.

```
Pending

↓

Assigned

↓

In Progress

↓

Completed
```

A request may also move to:

```
Cancelled
```

Allowed transitions:

| Current Status | Next Status |
|----------------|-------------|
| Pending | Assigned |
| Pending | Cancelled |
| Assigned | In Progress |
| Assigned | Cancelled |
| In Progress | Completed |

Status changes outside these transitions shall be rejected by the application.

---

# 16.5 Request Assignment Rules

Assignment shall follow these rules.

- Only staff from the student's hostel block may be assigned.
- Staff must match the requested service role.
- One active request shall have at most one assigned staff member.
- Assignment timestamp shall be recorded.

The assignment algorithm is implemented in the backend application.

---

# 16.6 Foreign Key Relationships

| Child Table | Foreign Key | Parent Table |
|-------------|-------------|--------------|
| service_request | student_id | student |
| service_request | category_id | service_category |
| service_request | assigned_staff_id | staff |

These relationships ensure every request references valid records.

---

# 16.7 Business Rules

### Service Category

- Category names shall be unique.
- Categories may be activated or deactivated.
- Existing requests shall retain their category even if the category is later deactivated.

---

### Service Request

- Every request belongs to one student.
- Every request belongs to one service category.
- A request may remain unassigned initially.
- Completed requests cannot be edited.
- Cancelled requests cannot be reassigned.
- Completion requires staff confirmation through the application workflow.

---

# 16.8 Recommended Indexes

| Table | Column | Purpose |
|--------|--------|---------|
| service_request | student_id | Student history |
| service_request | assigned_staff_id | Staff dashboard |
| service_request | request_status | Status filtering |
| service_request | category_id | Category reports |
| service_request | created_at | Recent requests |
| service_category | category_name | Category lookup |

Indexes shall prioritize frequently executed queries.

---

# 16.9 Data Validation Rules

### Title

- Required
- Maximum length: 150 characters

### Description

- Required
- Cannot be empty

### Room Number

- Required
- Maximum length: 20 characters

### Status

Allowed values:

- Pending
- Assigned
- In Progress
- Completed
- Cancelled

### Priority

Allowed values:

- Low
- Normal
- High

Validation shall be enforced by both the application and database where appropriate.

---

# 16.10 Service Management Success Criteria

The Service Management module shall be considered complete when:

✓ Service categories are stored separately.

✓ Every request references a valid student.

✓ Every request references a valid service category.

✓ Staff assignment is optional until allocation.

✓ Request lifecycle is clearly defined.

✓ Foreign key constraints enforce relationships.

✓ Frequently queried columns are indexed.

✓ Business rules support the complete service workflow.

---

# End of Part 6
# 17. Complaint Management Tables

## 17.1 Purpose

This chapter defines the database tables used to manage student complaints.

The Complaint Management module allows students to report hostel-related issues that require administrative attention. Unlike service requests, complaints are reviewed and resolved by administrators rather than assigned to service staff.

This chapter focuses only on complaint-related database structures.

---

# 17.2 Complaint Category Table

## Table Name

```
complaint_category
```

## Purpose

Stores the categories used to classify complaints.

Examples:

- Hostel Facilities
- Food Quality
- Water Supply
- Electricity
- Hygiene
- Security
- Internet
- Other

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Category identifier |
| category_name | VARCHAR(50) | UNIQUE, NOT NULL | Complaint category |
| description | VARCHAR(200) | NULL | Category description |
| is_active | BOOLEAN | DEFAULT TRUE | Category availability |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

---

# 17.3 Complaint Table

## Table Name

```
complaint
```

## Purpose

Stores complaints submitted by students.

Each complaint progresses through a defined resolution lifecycle.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Complaint identifier |
| student_id | INTEGER | Foreign Key, NOT NULL | Complaint owner |
| category_id | INTEGER | Foreign Key, NOT NULL | Complaint category |
| title | VARCHAR(150) | NOT NULL | Complaint title |
| description | TEXT | NOT NULL | Complaint details |
| complaint_status | VARCHAR(25) | NOT NULL | Current complaint status |
| priority | VARCHAR(15) | DEFAULT 'Normal' | Complaint priority |
| resolved_by | INTEGER | Foreign Key, NULL | Administrator who resolved the complaint |
| resolution_notes | TEXT | NULL | Resolution summary |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |
| closed_at | TIMESTAMP | NULL | Closure timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Last modification |

---

# 17.4 Complaint Status Lifecycle

A complaint shall progress through the following states.

```
Submitted

↓

Under Review

↓

Resolved

↓

Closed
```

Allowed transitions:

| Current Status | Next Status |
|----------------|-------------|
| Submitted | Under Review |
| Under Review | Resolved |
| Resolved | Closed |

The application shall reject invalid status transitions.

---

# 17.5 Complaint Resolution Rules

The following business rules apply.

- Every complaint belongs to one student.
- Every complaint belongs to one complaint category.
- Only administrators may resolve complaints.
- Resolution notes are required before marking a complaint as resolved.
- Closed complaints become read-only.

Complaint reassignment is outside the scope of Version 1.0.

---

# 17.6 Foreign Key Relationships

| Child Table | Foreign Key | Parent Table |
|-------------|-------------|--------------|
| complaint | student_id | student |
| complaint | category_id | complaint_category |
| complaint | resolved_by | administrator |

These relationships ensure every complaint references valid records.

---

# 17.7 Recommended Indexes

| Table | Column | Purpose |
|--------|--------|---------|
| complaint | student_id | Student complaint history |
| complaint | complaint_status | Administrator dashboard |
| complaint | category_id | Category reports |
| complaint | resolved_by | Resolution history |
| complaint | created_at | Recent complaints |
| complaint_category | category_name | Category lookup |

Indexes shall support reporting and administrative operations.

---

# 17.8 Data Validation Rules

### Title

- Required
- Maximum length: 150 characters

### Description

- Required
- Cannot be empty

### Complaint Status

Allowed values:

- Submitted
- Under Review
- Resolved
- Closed

### Priority

Allowed values:

- Low
- Normal
- High

### Resolution Notes

- Required only when the complaint status is `Resolved`.

Validation shall be enforced by the application and supported by database constraints where applicable.

---

# 17.9 Complaint Data Retention

Complaint records shall not be physically deleted during normal system operation.

Instead:

- Complaints remain available for reporting.
- Historical complaint data supports future analytics.
- Any future archival process shall preserve referential integrity.

This approach ensures an auditable history of complaint handling.

---

# 17.10 Complaint Management Success Criteria

The Complaint Management module shall be considered complete when:

✓ Complaint categories are maintained separately.

✓ Every complaint references a valid student.

✓ Every complaint references a valid complaint category.

✓ Resolution responsibility is linked to an administrator.

✓ Complaint status follows the defined lifecycle.

✓ Resolution history is preserved.

✓ Foreign key relationships enforce data integrity.

✓ Appropriate indexes support efficient querying.

---

# End of Part 7
# 18. Feedback & Rating Tables

## 18.1 Purpose

This chapter defines the database structures used to collect and manage feedback for completed service requests.

The Feedback module enables students to rate the quality of service provided by staff and submit optional comments. These records support staff performance evaluation and service quality improvement.

Only completed service requests are eligible for feedback.

---

# 18.2 Feedback Table

## Table Name

```
feedback
```

## Purpose

Stores ratings and comments submitted by students after a service request has been completed.

Each feedback record is associated with exactly one completed service request.

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Feedback identifier |
| request_id | INTEGER | Foreign Key, UNIQUE, NOT NULL | Completed service request |
| student_id | INTEGER | Foreign Key, NOT NULL | Student submitting feedback |
| staff_id | INTEGER | Foreign Key, NOT NULL | Staff member receiving feedback |
| rating | SMALLINT | CHECK (rating BETWEEN 1 AND 5), NOT NULL | Rating score |
| comments | TEXT | NULL | Optional feedback comments |
| submitted_at | TIMESTAMP | NOT NULL | Submission timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation |

---

# 18.3 Relationships

| Child Table | Foreign Key | Parent Table |
|-------------|-------------|--------------|
| feedback | request_id | service_request |
| feedback | student_id | student |
| feedback | staff_id | staff |

These relationships ensure every feedback record references valid entities.

---

# 18.4 Business Rules

The following rules apply to feedback submission.

- Feedback may only be submitted after a request is completed.
- Each service request may receive only one feedback entry.
- Students may submit feedback only for their own requests.
- Feedback cannot be modified after submission in Version 1.0.
- Feedback cannot be deleted through the application.

These rules preserve fairness and data integrity.

---

# 18.5 Rating Scale

Version 1.0 uses a five-point rating scale.

| Rating | Meaning |
|---------|---------|
| 1 | Very Poor |
| 2 | Poor |
| 3 | Average |
| 4 | Good |
| 5 | Excellent |

Only whole-number ratings are permitted.

---

# 18.6 Staff Performance Metrics

Feedback records contribute to staff performance metrics.

Examples include:

- Average rating
- Total feedback received
- Number of completed requests
- Distribution of ratings

Performance values shall be calculated dynamically by the application rather than stored redundantly in the database.

---

# 18.7 Data Validation Rules

### Rating

- Required
- Integer value only
- Allowed range: 1–5

### Comments

- Optional
- Maximum length: 1000 characters

### Request Reference

- Must reference an existing completed service request.

Validation shall be enforced through both database constraints and application logic.

---

# 18.8 Recommended Indexes

| Table | Column | Purpose |
|--------|--------|---------|
| feedback | request_id | Request lookup |
| feedback | staff_id | Staff performance reports |
| feedback | student_id | Student history |
| feedback | submitted_at | Recent feedback |

These indexes optimize reporting and dashboard queries.

---

# 18.9 Reporting Considerations

The Feedback module supports reporting such as:

- Average rating per staff member
- Highest-rated staff
- Lowest-rated staff
- Monthly feedback trends
- Total feedback submissions
- Rating distribution

These reports shall be generated using SQL aggregation queries without storing derived values.

---

# 18.10 Feedback Module Success Criteria

The Feedback module shall be considered complete when:

✓ Every feedback record references a valid completed service request.

✓ Students can submit only one feedback per request.

✓ Ratings are restricted to values between 1 and 5.

✓ Staff performance can be calculated from feedback records.

✓ Foreign key relationships are enforced.

✓ Appropriate indexes support efficient reporting.

✓ Historical feedback records remain available for analysis.

---

# End of Part 8
# 19. Master Data & Audit Tables

## 19.1 Purpose

This chapter defines the supporting tables that provide reference data and system auditing.

These tables do not store transactional business data but are essential for maintaining system consistency, traceability, and future scalability.

This chapter includes:

- Master (Reference) Tables
- Audit Log Table

---

# 19.2 Master Data

Master data consists of relatively static information that changes infrequently.

Characteristics:

- Shared across multiple modules
- Referenced using foreign keys
- Small number of records
- Managed by administrators

Version 1.0 master tables include:

- hostel_block
- service_category
- complaint_category

Future versions may introduce additional master tables without affecting existing relationships.

---

# 19.3 Master Data Management Rules

The following rules apply to all master tables.

- Names shall be unique.
- Records should not be physically deleted if referenced.
- Inactive records may be disabled using an active status flag.
- Existing transactions shall continue referencing historical master records.

This approach preserves referential integrity and historical accuracy.

---

# 19.4 Audit Log Table

## Table Name

```
audit_log
```

## Purpose

Stores important administrative actions performed within the system.

Audit records improve accountability, troubleshooting, and future compliance requirements.

---

### Columns

| Column | Data Type | Constraints | Description |
|---------|-----------|------------|-------------|
| id | SERIAL | Primary Key | Audit log identifier |
| administrator_id | INTEGER | Foreign Key, NOT NULL | Administrator performing the action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| target_table | VARCHAR(50) | NOT NULL | Affected table |
| target_record_id | INTEGER | NULL | Related record identifier |
| description | TEXT | NULL | Additional action details |
| ip_address | VARCHAR(45) | NULL | Client IP address |
| created_at | TIMESTAMP | NOT NULL | Action timestamp |

---

# 19.5 Audited Events

Version 1.0 shall record events such as:

- Student blocked
- Student unblocked
- Staff created
- Staff updated
- Staff removed
- Service category updated
- Complaint category updated
- Administrator login
- Administrator password change

Additional events may be introduced in future versions.

---

# 19.6 Audit Log Relationships

| Child Table | Foreign Key | Parent Table |
|-------------|-------------|--------------|
| audit_log | administrator_id | administrator |

Every audit record shall reference the administrator responsible for the action.

---

# 19.7 Audit Data Retention

Audit records shall:

- Remain immutable after creation.
- Never be modified through the application.
- Not be deleted during normal system operation.
- Be available for administrative review.

Future archival mechanisms may move older records to long-term storage while preserving integrity.

---

# 19.8 Recommended Indexes

| Table | Column | Purpose |
|--------|--------|---------|
| audit_log | administrator_id | Activity history |
| audit_log | action | Event filtering |
| audit_log | target_table | Module reports |
| audit_log | created_at | Chronological reports |

Indexes shall optimize administrative reporting without significantly impacting write performance.

---

# 19.9 Future Supporting Tables

The following supporting tables are planned for future releases:

| Table | Purpose |
|--------|---------|
| notification | System notifications |
| user_session | Session tracking |
| refresh_token | Secure session management |
| file_attachment | Request and complaint attachments |
| system_configuration | Application configuration |

These tables are outside the scope of Version 1.0 but have been considered during schema planning.

---

# 19.10 Master Data & Audit Module Success Criteria

The supporting database module shall be considered complete when:

✓ Master data is normalized.

✓ Reference records are reusable across modules.

✓ Administrative actions are recorded.

✓ Audit records remain immutable.

✓ Foreign key relationships are enforced.

✓ Historical records remain available.

✓ Future supporting tables can be added without restructuring the existing schema.

---

# End of Part 9
# 20. Database Constraints & Integrity Rules

## 20.1 Purpose

This chapter defines the database constraints used to maintain data accuracy, consistency, and reliability.

Constraints are enforced at the database level to prevent invalid or inconsistent data, regardless of the application accessing the database.

---

# 20.2 Primary Key Constraints

Every table shall have a single primary key.

### Standard

- Column Name: `id`
- Data Type: `SERIAL`
- Properties:
  - Unique
  - Not Null
  - Auto Increment

### Tables with Primary Keys

| Table | Primary Key |
|---------|-------------|
| hostel_block | id |
| student | id |
| staff | id |
| administrator | id |
| account_credentials | id |
| otp_verification | id |
| service_category | id |
| service_request | id |
| complaint_category | id |
| complaint | id |
| feedback | id |
| audit_log | id |

---

# 20.3 Foreign Key Constraints

Foreign keys maintain relationships between related tables.

The database shall reject any record that references a non-existent parent record.

### Foreign Key Summary

| Child Table | Foreign Key | Parent Table |
|--------------|-------------|--------------|
| student | block_id | hostel_block |
| staff | block_id | hostel_block |
| service_request | student_id | student |
| service_request | category_id | service_category |
| service_request | assigned_staff_id | staff |
| complaint | student_id | student |
| complaint | category_id | complaint_category |
| complaint | resolved_by | administrator |
| feedback | request_id | service_request |
| feedback | student_id | student |
| feedback | staff_id | staff |
| audit_log | administrator_id | administrator |

---

# 20.4 Unique Constraints

Unique constraints prevent duplicate values where uniqueness is required.

### Unique Columns

| Table | Column |
|---------|--------|
| hostel_block | block_name |
| student | registration_number |
| student | email |
| staff | email |
| administrator | username |
| account_credentials | email |
| service_category | category_name |
| complaint_category | category_name |
| feedback | request_id |

The database shall reject duplicate values for these fields.

---

# 20.5 NOT NULL Constraints

Mandatory fields shall use the `NOT NULL` constraint.

Examples include:

- Student name
- Registration number
- Email
- Password hash
- Category name
- Request title
- Complaint title
- Rating
- Status fields
- Creation timestamps

Optional fields such as comments or resolution notes may remain nullable.

---

# 20.6 CHECK Constraints

CHECK constraints ensure values remain within acceptable limits.

### Rating

```
rating BETWEEN 1 AND 5
```

### Priority

Allowed values:

- Low
- Normal
- High

### Request Status

Allowed values:

- Pending
- Assigned
- In Progress
- Completed
- Cancelled

### Complaint Status

Allowed values:

- Submitted
- Under Review
- Resolved
- Closed

The database shall reject records violating these rules.

---

# 20.7 Referential Integrity Rules

The following referential actions are recommended.

| Relationship | ON UPDATE | ON DELETE |
|--------------|-----------|-----------|
| Master → Transaction | CASCADE | RESTRICT |
| Student → Service Request | CASCADE | RESTRICT |
| Student → Complaint | CASCADE | RESTRICT |
| Staff → Service Request | CASCADE | SET NULL |
| Service Request → Feedback | CASCADE | RESTRICT |
| Administrator → Audit Log | CASCADE | RESTRICT |

These rules prevent orphan records while preserving historical data.

---

# 20.8 Default Values

Frequently used defaults improve consistency.

| Column | Default Value |
|---------|---------------|
| is_active | TRUE |
| is_blocked | FALSE |
| email_verified | FALSE |
| priority | Normal |
| request_status | Pending |
| complaint_status | Submitted |
| created_at | CURRENT_TIMESTAMP |

Defaults reduce unnecessary application logic.

---

# 20.9 Integrity Validation Strategy

Data integrity shall be enforced at multiple levels.

### Database Layer

- Primary Keys
- Foreign Keys
- Unique Constraints
- CHECK Constraints
- NOT NULL Constraints

### Application Layer

- Business rule validation
- Input sanitization
- Authorization
- Workflow validation

Using both layers provides defense against invalid data entry.

---

# 20.10 Database Constraint Success Criteria

The database integrity model shall be considered complete when:

✓ Every table has a primary key.

✓ All relationships use foreign keys.

✓ Duplicate records are prevented where required.

✓ Mandatory fields cannot be left empty.

✓ Invalid status values are rejected.

✓ Rating values remain within the allowed range.

✓ Referential integrity prevents orphan records.

✓ Default values simplify record creation.

---

# End of Part 10
# 21. Database Indexing & Performance Optimization

## 21.1 Purpose

This chapter defines the indexing strategy and performance optimization techniques used in the Room-Bot Service database.

The objectives are to:

- Improve query execution speed
- Reduce database response time
- Optimize search and filtering operations
- Support dashboard reporting
- Ensure scalability as the application grows

This chapter focuses on database performance and does not introduce new business entities.

---

# 21.2 Indexing Strategy

Indexes shall be created only on columns that are frequently used for:

- Login
- Searching
- Filtering
- Sorting
- Joining
- Reporting

Over-indexing shall be avoided because excessive indexes increase storage usage and slow INSERT, UPDATE, and DELETE operations.

---

# 21.3 Primary Indexes

Every table automatically contains a clustered primary key index.

| Table | Indexed Column |
|---------|---------------|
| hostel_block | id |
| student | id |
| staff | id |
| administrator | id |
| account_credentials | id |
| otp_verification | id |
| service_category | id |
| service_request | id |
| complaint_category | id |
| complaint | id |
| feedback | id |
| audit_log | id |

Primary key indexes support fast record retrieval by identifier.

---

# 21.4 Secondary Indexes

Secondary indexes improve the performance of frequently executed queries.

| Table | Indexed Column | Purpose |
|---------|---------------|---------|
| student | email | Student login |
| student | registration_number | Student search |
| staff | email | Staff login |
| administrator | username | Administrator login |
| account_credentials | email | Authentication |
| hostel_block | block_name | Block lookup |
| service_category | category_name | Service lookup |
| complaint_category | category_name | Complaint lookup |

These indexes support high-frequency lookup operations.

---

# 21.5 Transactional Indexes

Transactional tables require additional indexes to optimize dashboard operations.

### Service Request

| Column | Purpose |
|---------|---------|
| student_id | Student history |
| assigned_staff_id | Staff dashboard |
| request_status | Status filtering |
| category_id | Category reports |
| created_at | Recent requests |

### Complaint

| Column | Purpose |
|---------|---------|
| student_id | Student complaint history |
| complaint_status | Admin dashboard |
| category_id | Complaint analytics |
| created_at | Recent complaints |

### Feedback

| Column | Purpose |
|---------|---------|
| request_id | Request lookup |
| staff_id | Staff performance |
| submitted_at | Recent feedback |

---

# 21.6 Query Optimization Guidelines

Database queries shall follow these practices.

- Retrieve only required columns.
- Avoid `SELECT *` in production queries.
- Use indexed columns in WHERE clauses.
- Limit returned rows using pagination.
- Prefer joins over repeated database queries.
- Avoid unnecessary nested subqueries.

These practices reduce execution time and database load.

---

# 21.7 Pagination Strategy

Large datasets shall be displayed using pagination.

Recommended page sizes:

| Module | Records per Page |
|---------|------------------|
| Students | 20 |
| Staff | 20 |
| Service Requests | 20 |
| Complaints | 20 |
| Feedback | 20 |
| Audit Logs | 50 |

Pagination improves user experience and reduces memory consumption.

---

# 21.8 Reporting Performance

Administrative reports shall use optimized SQL queries.

Examples include:

- Requests by status
- Complaints by category
- Staff performance
- Student request history
- Monthly service statistics
- Feedback summaries

Whenever possible, reports should leverage indexed columns and aggregate functions.

---

# 21.9 Scalability Considerations

The indexing strategy shall support future system growth.

Future enhancements may include:

- Composite indexes for complex queries
- Partial indexes for filtered datasets
- Table partitioning for large transaction tables
- Read replicas for reporting workloads
- Materialized views for analytics

These enhancements are outside the scope of Version 1.0 but are considered during database planning.

---

# 21.10 Database Performance Success Criteria

The database performance model shall be considered complete when:

✓ Frequently searched columns are indexed.

✓ Dashboard queries use optimized indexes.

✓ Pagination is supported for large datasets.

✓ Reporting queries are optimized.

✓ Indexes balance read and write performance.

✓ Future scaling strategies are identified.

✓ Query optimization guidelines are documented.

---

# End of Part 11
# 22. Transaction Management & Concurrency Control

## 22.1 Purpose

This chapter defines the transaction management strategy used by the Room-Bot Service database.

The objectives are to:

- Ensure data consistency
- Prevent partial updates
- Support concurrent users
- Maintain data integrity during failures
- Handle simultaneous database operations safely

This chapter focuses on how database operations are executed rather than how data is stored.

---

# 22.2 Transaction Principles

The application shall use database transactions for operations involving multiple related SQL statements.

Every transaction shall satisfy the ACID properties.

| Property | Description |
|----------|-------------|
| Atomicity | All operations succeed or all operations are rolled back. |
| Consistency | Transactions preserve database integrity. |
| Isolation | Concurrent transactions do not interfere with one another. |
| Durability | Committed transactions remain permanent even after system failure. |

---

# 22.3 Transaction Boundaries

The following operations shall execute within a single database transaction.

| Operation | Tables Involved |
|-----------|-----------------|
| Student Registration | student, account_credentials, otp_verification |
| Staff Registration | staff, account_credentials, otp_verification |
| Password Reset | account_credentials, otp_verification |
| Service Request Creation | service_request |
| Staff Assignment | service_request |
| Service Completion & Feedback Eligibility | service_request |
| Complaint Resolution | complaint |
| Administrator Actions | audit_log and affected table |

If any step fails, the complete transaction shall be rolled back.

---

# 22.4 Rollback Strategy

A rollback shall occur whenever a transaction cannot be completed successfully.

Examples include:

- Foreign key constraint violation
- Duplicate unique value
- Invalid status transition
- Database connection failure
- Unexpected server error

Rollback ensures that no partial or inconsistent data remains in the database.

---

# 22.5 Concurrency Control

The database shall support multiple users performing operations simultaneously.

Typical concurrent users include:

- Students submitting requests
- Staff updating assigned requests
- Administrators reviewing complaints

PostgreSQL's Multi-Version Concurrency Control (MVCC) shall be used to allow concurrent reads and writes while maintaining data consistency.

---

# 22.6 Transaction Isolation Level

The default transaction isolation level for Version 1.0 shall be:

```
READ COMMITTED
```

This level provides a balance between:

- Performance
- Data consistency
- Concurrency

Higher isolation levels may be introduced for future reporting or financial-style operations if required.

---

# 22.7 Deadlock Prevention

To minimize deadlocks, the application shall follow these practices.

- Access tables in a consistent order.
- Keep transactions as short as possible.
- Avoid unnecessary locks.
- Commit transactions immediately after successful completion.
- Roll back failed transactions promptly.

These practices reduce contention and improve throughput.

---

# 22.8 Error Handling Strategy

If a transaction fails:

1. Roll back the transaction.
2. Log the error in the application logs.
3. Return an appropriate error response to the client.
4. Allow the user to retry the operation where appropriate.

Sensitive database details shall not be exposed to end users.

---

# 22.9 Long-Running Transactions

Long-running transactions can negatively affect database performance.

To prevent this:

- Complete transactions quickly.
- Avoid waiting for user input inside a transaction.
- Perform email sending after the transaction commits when possible.
- Separate heavy reporting queries from transactional operations.

These practices improve scalability and reduce lock contention.

---

# 22.10 Transaction Management Success Criteria

The transaction management strategy shall be considered complete when:

✓ Multi-step operations execute atomically.

✓ Failed operations are rolled back completely.

✓ ACID principles are maintained.

✓ Concurrent users can safely access the database.

✓ Deadlock risks are minimized.

✓ Errors are handled consistently.

✓ Transaction isolation supports production workloads.

---

# End of Part 12
# 23. Database Security, Backup & Recovery

## 23.1 Purpose

This chapter defines the security measures, backup strategy, and recovery procedures for the Room-Bot Service database.

The objectives are to:

- Protect sensitive data
- Prevent unauthorized database access
- Ensure data availability
- Enable disaster recovery
- Maintain business continuity

This chapter focuses on operational security rather than application-level authentication.

---

# 23.2 Database Security Principles

The database shall follow the principle of least privilege.

Core principles include:

- Grant only required permissions.
- Restrict direct database access.
- Encrypt sensitive communication.
- Protect confidential information.
- Regularly review database access.

Security controls shall be implemented at both the database and infrastructure levels.

---

# 23.3 Database Access Control

Access shall be divided into separate roles.

| Role | Permissions |
|------|-------------|
| Database Administrator | Full administrative privileges |
| Application User | Read and write application data |
| Read-Only User | Reporting and analytics only |
| Backup User | Backup and restore operations |

Application users shall not receive database administration privileges.

---

# 23.4 Sensitive Data Protection

The following information is considered sensitive.

- Password hashes
- Email addresses
- OTP codes
- Administrator credentials
- Audit records

Sensitive data shall be protected using:

- bcrypt password hashing
- Secure database connections (SSL/TLS)
- Restricted access permissions
- Secure environment variable management

Plain-text passwords shall never be stored.

---

# 23.5 Backup Strategy

The database shall be backed up regularly to minimize data loss.

Recommended backup schedule:

| Backup Type | Frequency |
|-------------|-----------|
| Full Backup | Weekly |
| Incremental Backup | Daily |
| Transaction Log Backup | Every 1 Hour (Production) |

Backup frequency may be adjusted according to operational requirements.

---

# 23.6 Backup Storage Policy

Database backups shall follow these guidelines.

- Store backups in multiple locations.
- Encrypt backup files.
- Restrict backup access.
- Verify backup integrity after creation.
- Maintain backup version history.

Production backups should not be stored on the same server as the primary database.

---

# 23.7 Recovery Strategy

The recovery process shall include the following steps.

1. Identify the failure.
2. Restore the latest full backup.
3. Apply incremental backups.
4. Apply transaction logs if available.
5. Verify database integrity.
6. Resume application services.

Recovery procedures shall be documented and periodically tested.

---

# 23.8 Disaster Recovery Considerations

Potential failure scenarios include:

- Hardware failure
- Database corruption
- Accidental data deletion
- Operating system failure
- Cloud infrastructure outage

The recovery plan shall minimize downtime and data loss.

Future versions may include standby databases and automated failover.

---

# 23.9 Security Monitoring

Database activity should be monitored continuously.

Recommended monitoring includes:

- Failed login attempts
- Unusual query activity
- Privilege changes
- Backup failures
- Storage utilization
- Slow query detection

Critical events should be forwarded to the application's monitoring system.

---

# 23.10 Database Security & Recovery Success Criteria

The database security model shall be considered complete when:

✓ Sensitive data is protected.

✓ Database roles follow least-privilege principles.

✓ Passwords are stored only as hashes.

✓ Backups are created regularly.

✓ Recovery procedures are documented.

✓ Backup integrity is verified.

✓ Database activity is monitored.

✓ Disaster recovery procedures support business continuity.

---

# End of Part 13
# 24. Database Migration, Version Control & Deployment

## 24.1 Purpose

This chapter defines the migration, version control, and deployment strategy for the Room-Bot Service database.

The objectives are to:

- Manage schema changes safely
- Maintain consistency across development environments
- Support collaborative development
- Enable controlled production deployments
- Preserve database integrity during upgrades

This chapter focuses on schema evolution rather than database design.

---

# 24.2 Migration Strategy

Database schema changes shall be managed using migration files instead of manual SQL execution.

Migration files shall include:

- Table creation
- Table modification
- Column addition
- Column removal
- Constraint updates
- Index creation
- Seed data (where applicable)

Every migration shall be version-controlled and executable in sequence.

---

# 24.3 Migration Tool

The project shall use **Prisma Migrate** as the primary migration framework.

Responsibilities include:

- Generating migration files
- Applying schema changes
- Tracking migration history
- Supporting rollback through corrective migrations
- Synchronizing Prisma schema with PostgreSQL

All schema updates shall be performed through Prisma Migrate.

---

# 24.4 Version Control

Database schema files shall be maintained within the project's Git repository.

The following files shall be version controlled:

- Prisma schema (`schema.prisma`)
- Migration files
- Seed scripts
- Database documentation

Generated database files and local development databases shall not be committed to version control.

---

# 24.5 Migration Workflow

The recommended migration workflow is:

1. Update the Prisma schema.
2. Generate a migration.
3. Review the generated SQL.
4. Test the migration in the development environment.
5. Commit the migration to Git.
6. Deploy the migration to staging.
7. Validate application functionality.
8. Apply the migration to production.

No schema changes shall be applied directly to the production database.

---

# 24.6 Environment Consistency

Separate database environments shall be maintained for each deployment stage.

| Environment | Purpose |
|-------------|---------|
| Development | Feature development and testing |
| Testing | Automated and integration testing |
| Staging | Pre-production validation |
| Production | Live application |

Each environment shall use its own database instance and configuration.

---

# 24.7 Seed Data Strategy

Seed data provides initial records required by the application.

Examples include:

- Hostel blocks
- Service categories
- Complaint categories
- Default administrator account

Seed scripts shall be idempotent wherever possible, allowing safe repeated execution.

---

# 24.8 Deployment Guidelines

Before applying a migration:

- Verify recent database backups.
- Review migration scripts.
- Validate compatibility with the application version.
- Confirm adequate database storage.
- Notify stakeholders of planned maintenance if downtime is expected.

After deployment:

- Verify migration success.
- Run application health checks.
- Monitor database logs for errors.

---

# 24.9 Rollback Strategy

If a deployment fails:

1. Stop further deployment steps.
2. Restore the latest verified backup if necessary.
3. Apply corrective migrations where appropriate.
4. Validate data integrity.
5. Resume application services after successful verification.

Rollback procedures shall be tested periodically in non-production environments.

---

# 24.10 Database Migration Success Criteria

The migration strategy shall be considered complete when:

✓ All schema changes are tracked through migration files.

✓ Database schema is version controlled.

✓ Separate environments are maintained.

✓ Seed data is reproducible.

✓ Production deployments follow a defined workflow.

✓ Rollback procedures are documented.

✓ Database upgrades remain consistent across environments.

---

# End of Part 14
# 25. Database Standards, Maintenance & Governance

## 25.1 Purpose

This chapter defines the standards, operational guidelines, and governance policies for managing the Room-Bot Service database throughout its lifecycle.

The objectives are to:

- Maintain consistency across the database
- Establish development standards
- Ensure long-term maintainability
- Support operational monitoring
- Define governance responsibilities

This chapter serves as the operational guideline for future database development and maintenance.

---

# 25.2 Database Naming Standards

The following naming conventions shall be followed consistently.

| Database Object | Convention | Example |
|-----------------|------------|---------|
| Tables | snake_case (singular) | student |
| Columns | snake_case | registration_number |
| Primary Keys | id | id |
| Foreign Keys | referenced_table_id | student_id |
| Indexes | idx_table_column | idx_student_email |
| Unique Constraints | uq_table_column | uq_staff_email |
| Migration Files | Timestamp + Description | 202607230945_create_student_table |

Consistent naming improves readability and maintainability.

---

# 25.3 Documentation Standards

Every schema change shall be documented.

Documentation should include:

- Purpose of the change
- Tables affected
- Columns added or modified
- Constraints introduced
- Migration reference
- Backward compatibility considerations

The database design document shall remain synchronized with the production schema.

---

# 25.4 Database Maintenance Plan

Routine maintenance activities shall be performed regularly.

| Activity | Recommended Frequency |
|----------|------------------------|
| Backup verification | Weekly |
| Index health review | Monthly |
| Database statistics update | Weekly |
| Slow query analysis | Monthly |
| Storage utilization review | Monthly |
| Security access review | Quarterly |
| Disaster recovery testing | Twice per year |

Maintenance schedules may be adjusted based on production usage.

---

# 25.5 Database Monitoring

The database should be continuously monitored for operational health.

Recommended monitoring metrics include:

- Database availability
- Query execution time
- Active connections
- CPU utilization
- Memory utilization
- Disk usage
- Lock contention
- Failed queries
- Replication status (future)

Monitoring enables early detection of operational issues.

---

# 25.6 Change Management Policy

All database modifications shall follow a controlled approval process.

Recommended workflow:

1. Requirement identification
2. Schema design review
3. Migration preparation
4. Development testing
5. Code review
6. Staging validation
7. Production deployment
8. Post-deployment verification

Emergency changes shall be documented after implementation.

---

# 25.7 Database Governance Principles

The database shall follow the following governance principles.

- Maintain normalized schema.
- Avoid duplicate data.
- Preserve referential integrity.
- Document all structural changes.
- Protect sensitive information.
- Follow secure development practices.
- Regularly review database performance.
- Maintain operational audit trails.

These principles ensure long-term sustainability of the database.

---

# 25.8 Future Improvement Roadmap

The database architecture supports future enhancements such as:

- Multi-hostel support
- Multi-campus deployment
- Notification management
- File attachment storage
- Real-time analytics
- Read replicas
- Table partitioning
- Automated archival
- Advanced reporting dashboards
- High-availability clustering

These enhancements can be introduced without significant redesign due to the normalized database structure.

---

# 25.9 Database Review Checklist

Before each production release, verify the following.

### Schema

- All migrations applied successfully.
- Foreign key relationships validated.
- Constraints verified.
- Indexes created correctly.

### Security

- Password hashing verified.
- Database credentials secured.
- Access permissions reviewed.

### Performance

- Slow queries reviewed.
- Index usage analyzed.
- Resource utilization acceptable.

### Recovery

- Recent backup available.
- Restore procedure validated.

Completing this checklist reduces deployment risks.

---

# 25.10 Database Governance Success Criteria

The database governance model shall be considered complete when:

✓ Naming standards are consistently applied.

✓ Schema documentation remains up to date.

✓ Maintenance activities are scheduled.

✓ Database health is continuously monitored.

✓ Schema changes follow an approval process.

✓ Governance principles guide future development.

✓ Review checklists are completed before production deployments.

✓ The database remains maintainable, secure, and scalable throughout its lifecycle.

---

# End of Part 15

---

# Database Design Document Summary

This document provides the complete database design for the **Room-Bot Service** project, covering:

- Database architecture and design principles
- Entity relationship model
- Physical schema design
- User management
- Authentication and security
- Service management
- Complaint management
- Feedback management
- Master data and audit logging
- Constraints and integrity rules
- Performance optimization
- Transaction management
- Backup and recovery
- Migration and deployment
- Standards, maintenance, and governance

The design follows normalization principles, PostgreSQL best practices, Prisma ORM conventions, and enterprise software engineering standards to support a secure, scalable, and maintainable production environment.