# Room-Bot Service

# Product Requirements Document (PRD)

---

# Document Information

| Property | Details |
|----------|---------|
| Project Name | Room-Bot Service |
| Document Name | Product Requirements Document (PRD) |
| Document ID | RBS-DOC-002 |
| Version | 1.0 |
| Status | Approved |
| Prepared By | Meet (Project Owner) & ChatGPT (Software Architect) |
| Related Documents | RBS-DOC-001 Project Overview |

---

# Version History

| Version | Date | Description | Author |
|----------|------|-------------|--------|
| 1.0 | Initial Release | First official Product Requirements Document | Meet & ChatGPT |

---

# Table of Contents

1. Purpose
2. Product Overview
3. Business Goals
4. Project Objectives
5. Product Vision
6. Target Users
7. User Roles
8. Functional Overview
9. Non-Functional Overview
10. Product Principles

---

# 1. Purpose

The purpose of this Product Requirements Document (PRD) is to define the complete functional and business requirements for the Room-Bot Service platform.

This document acts as the single source of truth for everyone involved in the project, including:

- Developers
- UI/UX Designers
- Database Designers
- QA Engineers
- Future Contributors
- AI Coding Assistants (Codex)

Unlike the Project Overview document, which explains *why* the project exists, this PRD explains *what* the system must do.

Every screen, feature, workflow, business rule, validation, and interaction described in this document represents an official project requirement.

No feature should be implemented unless it is documented here or approved in a future revision.

---

# 2. Product Overview

Room-Bot Service is a web-based Hostel Service Management Platform designed to automate and simplify hostel maintenance operations.

The platform connects three major stakeholders:

- Students
- Staff Members
- Administrators

through a centralized, secure, and role-based application.

The system eliminates manual request handling by providing digital workflows for service requests, complaints, task assignment, completion verification, and performance evaluation.

The application focuses on operational efficiency while maintaining transparency and accountability throughout the service lifecycle.

---

# 3. Business Goals

The primary business goals of Room-Bot Service are:

## 3.1 Digital Transformation

Replace manual hostel maintenance processes with a centralized digital platform.

---

## 3.2 Operational Efficiency

Reduce the time required to:

- Register complaints
- Assign staff
- Complete maintenance
- Monitor requests

---

## 3.3 Transparency

Allow students, staff, and administrators to view accurate request statuses at every stage.

---

## 3.4 Accountability

Ensure that every completed service is verified using OTP before being officially marked as completed.

---

## 3.5 Fair Work Distribution

Automatically distribute requests among eligible staff members to avoid workload imbalance.

---

## 3.6 Performance Monitoring

Provide measurable performance indicators using student ratings and feedback.

---

## 3.7 Future Scalability

Design the software architecture so additional hostel services, buildings, and AI modules can be integrated without major redesign.

---

# 4. Project Objectives

The project objectives are divided into functional and technical objectives.

## Functional Objectives

- Allow students to register securely.
- Allow staff to register securely.
- Allow administrators to manage the platform.
- Provide digital service requests.
- Provide complaint management.
- Track request progress.
- Enable OTP-based completion verification.
- Collect service feedback.
- Generate administrative analytics.

---

## Technical Objectives

- Develop a responsive web application.
- Use React for frontend development.
- Use Express.js for backend development.
- Store data in PostgreSQL.
- Secure passwords using bcrypt.
- Authenticate users using JWT.
- Deliver OTP through email.
- Follow REST API architecture.
- Maintain clean and modular code.

---

# 5. Product Vision

Room-Bot Service aims to become a reliable digital infrastructure for hostel operations by providing a platform that is:

- Secure
- Reliable
- Scalable
- User-Friendly
- Maintainable
- Production Ready

The platform should simplify hostel management while improving service quality for every stakeholder.

---

# 6. Target Users

The application is designed primarily for university hostel environments.

Primary users include:

- Hostel Students
- Hostel Maintenance Staff
- Hostel Administrators

Secondary users include:

- Hostel Wardens
- University Management
- IT Support Team
- Future Developers

---

# 7. User Roles

The system supports exactly three user roles.

## Student

Students are responsible for requesting hostel-related services.

Students can:

- Register
- Login
- Request services
- Submit complaints
- View request history
- Cancel eligible requests
- Verify completed work
- Submit feedback
- Manage profile

Students cannot:

- Assign staff
- View other students' requests
- Access administrative features

---

## Staff

Staff members are responsible for completing assigned maintenance requests.

Staff can:

- Register
- Login
- View assigned requests
- Update request progress
- Complete work
- Verify OTP
- View work history
- View ratings
- Manage profile

Staff cannot:

- Assign themselves new requests
- View unrelated requests
- Access administrator functions

---

## Administrator

Administrators have complete system control.

Administrators can:

- Login
- Manage students
- Manage staff
- Block and unblock users
- Monitor requests
- Monitor complaints
- View analytics
- View reports
- Monitor staff performance

Administrators cannot register through the application.

Only one predefined administrator account exists during initial deployment.

---

# 8. Functional Overview

The Room-Bot Service platform consists of the following major functional modules.

## Authentication Module

Responsible for:

- Registration
- Login
- JWT Authentication
- Forgot Password
- Password Reset
- Email OTP Verification

---

## Student Module

Responsible for:

- Dashboard
- Service Requests
- Complaints
- History
- Feedback
- Profile

---

## Staff Module

Responsible for:

- Dashboard
- Pending Requests
- Completed Requests
- OTP Verification
- Ratings
- History

---

## Administrator Module

Responsible for:

- Dashboard
- Student Management
- Staff Management
- Request Monitoring
- Complaint Monitoring
- Analytics
- Reports

---

## Notification Module

Responsible for:

- Registration OTP
- Password Reset OTP
- Request Completion OTP

Future versions may include push notifications.

---

# 9. Non-Functional Overview

The software shall satisfy the following non-functional requirements.

## Security

- JWT Authentication
- Password Hashing
- Role-Based Access Control
- OTP Verification
- Secure API Endpoints

---

## Performance

The application should provide fast response times and support concurrent users without noticeable degradation.

---

## Reliability

The system should preserve data integrity and prevent unauthorized access.

---

## Maintainability

The software shall use modular architecture to simplify future development.

---

## Scalability

The architecture shall support future modules without major redesign.

---

## Responsiveness

The application shall function correctly on:

- Desktop
- Laptop
- Tablet
- Mobile Devices

---

# 10. Product Principles

The following principles govern every feature developed within Room-Bot Service.

### Principle 1

Solve real operational problems.

---

### Principle 2

Prioritize security over convenience.

---

### Principle 3

Maintain transparency throughout every workflow.

---

### Principle 4

Design for scalability.

---

### Principle 5

Keep the user experience simple and intuitive.

---

### Principle 6

Automate repetitive administrative work wherever possible.

---

### Principle 7

Maintain production-quality code and documentation throughout the project lifecycle.

---

**End of Part 1**
# 11. Functional Requirements Overview

This chapter defines the core functional requirements of the Room-Bot Service platform.

A functional requirement specifies what the system must do. Every requirement listed in this document is mandatory unless explicitly marked as optional in a future version.

Each requirement is assigned a unique Requirement ID for future reference during development, testing, and maintenance.

---

# 12. System Modules

The Room-Bot Service platform consists of the following primary modules.

| Module ID | Module Name | Description |
|------------|-------------|-------------|
| MOD-01 | Authentication | User Registration, Login, OTP Verification and Password Management |
| MOD-02 | Student Module | Student Dashboard and Hostel Services |
| MOD-03 | Staff Module | Staff Dashboard and Assigned Requests |
| MOD-04 | Administrator Module | System Administration and Analytics |
| MOD-05 | Request Management | Complete Request Lifecycle |
| MOD-06 | Complaint Management | Hostel Complaint Handling |
| MOD-07 | Notification System | Email OTP and Notifications |
| MOD-08 | Feedback System | Student Ratings and Reviews |

Each module will be explained in detail in subsequent sections of this document.

---

# 13. Core Business Rules

The following business rules define how the platform operates.

These rules are mandatory and must always be enforced by the backend.

---

## BR-001

Every user must belong to exactly one role.

Allowed roles are:

- Student
- Staff
- Administrator

A user cannot possess multiple roles simultaneously.

---

## BR-002

Every student belongs to exactly one hostel block.

Example:

Block A

Block B

Block C

A student cannot belong to multiple blocks.

---

## BR-003

Every staff member belongs to exactly one hostel block.

Staff members may only receive requests originating from their own assigned block.

Example

Student → Block A

↓

Only Staff from Block A

Assignment to another block is prohibited.

---

## BR-004

Every staff member has exactly one primary service role.

Examples include:

- Cleaning
- Plumbing
- Electrical
- AC Maintenance
- Furniture Repair
- Warden

The system shall use this role while assigning requests.

---

## BR-005

Students cannot manually select staff members.

The system alone is responsible for assigning requests.

This eliminates favoritism and ensures fair workload distribution.

---

## BR-006

Administrators cannot manually override automatic assignment during Version 1.0.

Future versions may include reassignment functionality.

---

## BR-007

Every service request must belong to exactly one service category.

Supported categories:

- Cleaning
- Plumbing
- Electrical
- AC Maintenance
- Furniture Repair

---

## BR-008

Every request must have exactly one current status.

Allowed statuses are:

- Pending
- Assigned
- In Progress
- Completed
- Cancelled

No additional statuses are permitted in Version 1.0.

---

## BR-009

Completed requests become read-only.

Once completed:

- Service type cannot change.
- Assigned staff cannot change.
- Student cannot edit request.
- Staff cannot modify request details.

Only administrators may archive historical records if required.

---

## BR-010

Every completed request must have passed OTP verification.

Without successful OTP verification:

Status shall never become **Completed**.

---

## BR-011

Students may submit feedback only after successful completion.

Conditions:

✔ Request Status = Completed

✔ OTP Verified

Otherwise,

Feedback submission is prohibited.

---

## BR-012

Each request may receive only one feedback submission.

Students cannot:

- Submit multiple reviews.
- Edit ratings after submission.
- Delete submitted ratings.

Future versions may support review editing.

---

## BR-013

A feedback rating must be between 1 and 5.

Allowed values:

1 ⭐

2 ⭐⭐

3 ⭐⭐⭐

4 ⭐⭐⭐⭐

5 ⭐⭐⭐⭐⭐

No decimal ratings are allowed.

---

## BR-014

Staff ratings shall be calculated automatically.

Formula

Average Rating

=

Sum of all ratings

÷

Total submitted ratings

Only submitted reviews are included.

Missing feedback must not reduce ratings.

---

## BR-015

Students may cancel requests only before work begins.

Allowed

Pending

Assigned

Not Allowed

In Progress

Completed

Cancelled

---

## BR-016

Cancelled requests remain in history.

They are never permanently deleted.

Purpose:

- Audit Trail
- Reporting
- Analytics
- Transparency

---

## BR-017

Every request shall contain timestamps.

Mandatory timestamps include:

- Created Time
- Assigned Time
- Started Time
- Completed Time

These timestamps support reporting and analytics.

---

## BR-018

Every action performed inside the system shall be attributable to an authenticated user.

Anonymous operations are not permitted.

---

# 14. General System Workflow

The following diagram describes the standard service lifecycle.

Student Login

↓

Create Service Request

↓

Backend Validation

↓

Automatic Staff Assignment

↓

Staff Dashboard

↓

Staff Accepts Request

↓

Work Begins

↓

Staff Completes Work

↓

OTP Generated

↓

OTP Sent to Student Email

↓

Student Verifies Work

↓

Staff Enters OTP

↓

OTP Validated

↓

Request Completed

↓

Feedback Enabled

↓

Student Submits Rating

↓

History Updated

---

# 15. Data Integrity Rules

The application shall enforce the following integrity rules.

## DIR-001

Email addresses must be unique.

Students cannot register using an email already assigned to another account.

---

## DIR-002

Room numbers cannot be empty.

---

## DIR-003

Passwords must always be stored as bcrypt hashes.

Plain-text passwords are strictly prohibited.

---

## DIR-004

OTP values shall never be stored permanently.

Expired OTPs should be removed automatically.

---

## DIR-005

Request IDs shall be generated automatically.

Users must never manually enter request identifiers.

---

## DIR-006

Every request must reference:

- Student
- Assigned Staff
- Service Category

These relationships are mandatory.

---

# 16. Project Standards

The Room-Bot Service project follows the following standards.

## Coding Standards

- Clean Code
- Modular Development
- Reusable Components
- RESTful APIs
- Proper Error Handling

---

## Documentation Standards

Every feature implemented in the application must have corresponding documentation.

No undocumented functionality shall be introduced.

---

## Security Standards

Every protected API shall require authentication.

Every database query shall be validated.

Every user input shall be sanitized.

---

## UI Standards

The interface shall be:

- Modern
- Clean
- Responsive
- Accessible
- Consistent

The design language must follow the approved UI/UX Design System document.

---

**End of Part 2**
# 17. Authentication Module

## 17.1 Module Overview

The Authentication Module is responsible for identifying users, verifying their identity, authorizing access to protected resources, and protecting the application from unauthorized usage.

Authentication is one of the most critical modules of Room-Bot Service because every other module depends upon authenticated and authorized users.

The authentication system shall support three different user roles:

- Student
- Staff
- Administrator

Each role has different login permissions and dashboard access.

The authentication module shall provide:

- User Registration
- Email OTP Verification
- Secure Login
- JWT Authentication
- Forgot Password
- Password Reset
- Logout
- Role-Based Authorization
- Session Validation

---

# 17.2 Authentication Workflow

The authentication process follows the sequence below.

Registration

↓

Email OTP Verification

↓

Account Activation

↓

Login

↓

JWT Token Generation

↓

Protected Dashboard Access

↓

Logout

↓

JWT Invalidated (Client Side)

---

# 17.3 Supported Authentication Methods

Version 1.0 supports:

✅ Email + Password Authentication

Future versions may support:

- Google Sign-In
- Microsoft Login
- University SSO
- Biometric Authentication
- Multi-Factor Authentication (MFA)

---

# 18. User Registration

The system supports registration for:

- Students
- Staff

Administrators cannot register through the application.

---

# 18.1 Student Registration

Required Information

| Field | Required |
|--------|----------|
| Full Name | Yes |
| University Email | Yes |
| Hostel Block | Yes |
| Room Number | Yes |
| Password | Yes |
| Confirm Password | Yes |

---

## Registration Rules

REQ-AUTH-001

Every student email must be unique.

---

REQ-AUTH-002

Only valid university email addresses are allowed.

Example

student@vitstudent.ac.in

(Actual validation pattern can be configured by the administrator.)

---

REQ-AUTH-003

Password and Confirm Password must match.

---

REQ-AUTH-004

Minimum password length:

8 characters

Recommended:

12+ characters

---

REQ-AUTH-005

Password must contain at least:

- One uppercase letter
- One lowercase letter
- One number
- One special character

Example

```
Meet@2028
```

---

REQ-AUTH-006

Registration is incomplete until email OTP verification succeeds.

---

REQ-AUTH-007

Unverified accounts cannot login.

---

# Student Registration Flow

Student fills registration form

↓

Frontend Validation

↓

Backend Validation

↓

Email Uniqueness Check

↓

Password Hashing

↓

Generate OTP

↓

Send OTP Email

↓

Student Enters OTP

↓

OTP Verification

↓

Account Activated

↓

Redirect to Login

---

# 18.2 Staff Registration

Required Fields

| Field | Required |
|--------|----------|
| Full Name | Yes |
| Email | Yes |
| Block | Yes |
| Staff Role | Yes |
| Password | Yes |
| Confirm Password | Yes |

Staff Role must be one of:

- Cleaning
- Electrical
- Plumbing
- AC Maintenance
- Furniture Repair
- Warden

Registration flow is identical to Student Registration.

---

# 18.3 Administrator Registration

Administrator registration is NOT supported.

Instead, one predefined administrator account shall exist during database initialization.

Default Username

```
Meetu_17
```

Temporary Password

```
lalila2028
```

Important:

The password must be stored only as a bcrypt hash.

---

# 19. Login Module

Separate login interfaces shall exist for:

- Student
- Staff
- Administrator

Each role is authenticated independently.

---

## 19.1 Student Login

Required Fields

- Email
- Password

Workflow

Student enters credentials

↓

Backend Validation

↓

Password Verification

↓

JWT Generation

↓

Student Dashboard

---

## 19.2 Staff Login

Required Fields

- Email
- Password

Successful authentication redirects the user to the Staff Dashboard.

---

## 19.3 Administrator Login

Required Fields

- Username
- Password

Successful authentication redirects the administrator to the Admin Dashboard.

---

# 20. JWT Authentication

After successful login, the backend shall generate a JSON Web Token (JWT).

The token shall include:

- User ID
- User Role
- Email
- Token Expiry

Every protected API request must include:

Authorization

```
Bearer <JWT_TOKEN>
```

Unauthorized requests shall receive:

HTTP 401 Unauthorized

---

# 21. Email OTP Verification

OTP verification is mandatory for:

- Student Registration
- Staff Registration
- Forgot Password
- Request Completion

OTP Characteristics

- Randomly generated
- Numeric
- Six digits

Example

```
483921
```

Important:

This is only an example.

The application must generate random OTPs.

Hardcoded OTP values are strictly prohibited.

---

## OTP Expiry

OTP Validity

10 Minutes

Expired OTPs become invalid automatically.

---

## OTP Attempts

Maximum Attempts

5

After five failed attempts:

- OTP becomes invalid.
- User must request a new OTP.

---

## Resend OTP

Users may request another OTP.

Rules:

- Previous OTP immediately expires.
- New OTP replaces old OTP.
- Maximum resend limit may be configured in future versions.

---

# 22. Forgot Password

Users can reset passwords using email verification.

Workflow

Forgot Password

↓

Enter Email

↓

Generate OTP

↓

Send Email

↓

Verify OTP

↓

Create New Password

↓

Password Updated

↓

Login

---

Rules

The new password cannot be identical to the current password.

All previous reset OTPs become invalid immediately after successful password reset.

---

# 23. Logout

Logout is handled by the client.

The frontend shall:

- Remove JWT
- Remove user session
- Redirect to Login

Protected pages must become inaccessible after logout.

---

# 24. Role-Based Authorization

The backend shall authorize users based on role.

Student APIs

Accessible only by Students.

Staff APIs

Accessible only by Staff.

Administrator APIs

Accessible only by Administrators.

Attempting to access another role's APIs shall return:

HTTP 403 Forbidden

---

# 25. Authentication Error Messages

Examples

| Condition | Message |
|------------|---------|
| Invalid Email | Email not found. |
| Wrong Password | Invalid password. |
| Invalid OTP | Incorrect OTP. |
| Expired OTP | OTP has expired. |
| JWT Expired | Session expired. Please login again. |
| Unauthorized | Access denied. |
| Forbidden | You do not have permission to perform this action. |

Error messages should be user-friendly and must never expose sensitive system information.

---

# 26. Authentication Security Requirements

The authentication module shall comply with the following security requirements.

- Passwords stored only as bcrypt hashes.
- JWT Secret stored in environment variables.
- HTTPS required in production.
- Rate limiting on login endpoints.
- Input validation on every endpoint.
- Protection against SQL Injection.
- Protection against XSS.
- Protection against brute-force attacks.
- OTP expiration enforcement.
- Role verification on every protected request.

The Authentication Module serves as the security foundation for the entire Room-Bot Service platform.

---

**End of Part 3**
# 27. Student Module

## 27.1 Module Overview

The Student Module is the primary interface through which hostel residents interact with the Room-Bot Service platform.

Its primary objective is to provide students with a simple, intuitive, and secure interface for requesting hostel services, tracking requests, submitting complaints, viewing history, and providing feedback.

The module shall minimize the number of clicks required to complete common tasks while maintaining a clean and modern user experience.

Every authenticated student shall be redirected to the Student Dashboard immediately after successful login.

Only authenticated users with the **Student** role may access this module.

---

# 27.2 Student Dashboard

The Student Dashboard serves as the homepage after login.

Its purpose is to provide an overview of the student's current hostel service activities without requiring navigation to multiple pages.

The dashboard should present important information in a visually organized and easy-to-understand format.

---

## Dashboard Components

The dashboard shall include the following sections:

### 1. Welcome Card

Displays:

- Student Name
- Hostel Block
- Room Number
- Current Date
- Greeting Message

Example:

Good Morning, Meet!

Welcome back to Room-Bot Service.

---

### 2. Quick Statistics

The dashboard shall display summary cards.

Required Cards:

- Total Requests
- Pending Requests
- In Progress Requests
- Completed Requests

Each card shall contain:

- Icon
- Title
- Count
- Color Indicator

---

### 3. Recent Requests

Display the latest five requests.

Each row shall contain:

- Request ID
- Service Category
- Status
- Assigned Staff
- Request Date

Clicking a request opens its details page.

---

### 4. Recent Complaints

Display the latest complaints submitted by the student.

Columns:

- Complaint ID
- Status
- Date

---

### 5. Announcements (Optional Future Feature)

Reserved space for hostel announcements.

Examples:

- Water shutdown
- Electricity maintenance
- Hostel notices

This section is not required in Version 1.0 but the layout should reserve space for future integration.

---

# 27.3 Student Navigation

The student dashboard shall use a left sidebar.

Sidebar Items:

🏠 Dashboard

🛠 Services

📢 Complaint

📜 History

👤 Profile

Logout

The active page should be visually highlighted.

The sidebar shall collapse on smaller screens.

---

# 27.4 Navigation Rules

REQ-STU-001

Students shall never see administrator menus.

---

REQ-STU-002

Students shall never see staff menus.

---

REQ-STU-003

Navigation must remain identical throughout the application.

---

REQ-STU-004

Every page shall display a breadcrumb.

Example

Dashboard

↓

Services

↓

Electrical Maintenance

---

# 27.5 Student Profile

Students shall have access to their profile.

Visible Information:

- Name
- Email
- Hostel Block
- Room Number

Editable Fields:

None in Version 1.0.

Future versions may allow profile editing.

---

# 27.6 Dashboard Refresh

The dashboard shall automatically update after important events.

Examples:

Request Submitted

↓

Statistics Updated

Complaint Submitted

↓

Recent Complaints Updated

Feedback Submitted

↓

History Updated

No manual page refresh should be required.

---

# 27.7 Empty States

The application shall provide meaningful empty states.

Example

No Requests

Illustration

"No service requests found."

Button

Create Request

---

No Complaints

Illustration

"You haven't submitted any complaints."

---

No History

Illustration

"No completed requests yet."

---

# 27.8 Loading States

Every API request shall display a loading indicator.

Examples:

Loading Dashboard...

Loading Requests...

Loading History...

The interface should never appear frozen.

---

# 27.9 Error States

When data cannot be loaded:

Display

⚠ Unable to load data.

Retry Button

Users should never see raw backend errors.

---

# 27.10 Student Permissions

Students are allowed to:

✔ View own profile

✔ Create requests

✔ Create complaints

✔ Cancel eligible requests

✔ View history

✔ Submit feedback

✔ Logout

Students are NOT allowed to:

✖ View another student's information

✖ Assign staff

✖ Modify completed requests

✖ Access admin pages

✖ Access staff pages

✖ View analytics

---

# 27.11 Session Handling

If JWT expires:

User shall automatically return to Login.

Message

Session expired.

Please login again.

---

# 27.12 Responsive Behaviour

Desktop

Sidebar permanently visible.

Tablet

Collapsible sidebar.

Mobile

Hamburger menu.

Dashboard cards shall automatically rearrange into a single-column layout.

No horizontal scrolling should occur.

---

# 27.13 Accessibility Requirements

The Student Module shall follow accessibility best practices.

Requirements:

- Keyboard navigation supported.
- Proper button labels.
- Readable font sizes.
- High color contrast.
- Focus indicators.
- Screen-reader friendly form labels.

---

# 27.14 Student Module Success Criteria

The Student Module shall be considered complete when:

✓ Dashboard loads successfully.

✓ Navigation functions correctly.

✓ Responsive layout works on all supported devices.

✓ Statistics display accurately.

✓ Only student-specific information is visible.

✓ Unauthorized access is prevented.

✓ Loading and error states are handled gracefully.

✓ Performance remains smooth during normal usage.

---

**End of Part 4**
# 28. Student Service Request Module

## 28.1 Module Overview

The Student Service Request Module enables hostel residents to digitally request maintenance and hostel-related services without contacting hostel authorities manually.

This module is the core functionality of Room-Bot Service and acts as the entry point of the complete service lifecycle.

Once a request is submitted, the system automatically validates the request, assigns an appropriate staff member, records the request in the database, and updates all relevant dashboards.

The objective of this module is to provide a fast, reliable, transparent, and user-friendly request submission process.

---

# 28.2 Supported Service Categories

Version 1.0 supports the following services.

| Service ID | Service Name |
|------------|--------------|
| SER-001 | Room Cleaning |
| SER-002 | Electrical Maintenance |
| SER-003 | Plumbing |
| SER-004 | AC Maintenance |
| SER-005 | Furniture Repair |

The architecture shall allow additional services to be added without modifying the database structure.

---

# 28.3 Create Service Request

Students shall be able to create a new service request from the **Services** page.

The page shall display all available service categories as modern cards.

Each card shall contain:

- Service Icon
- Service Name
- Short Description
- "Request Service" Button

Clicking the button opens the request form.

---

# 28.4 Service Request Form

The following information shall be collected.

| Field | Required | Editable |
|--------|----------|----------|
| Student Name | Auto Filled | No |
| Email | Auto Filled | No |
| Hostel Block | Auto Filled | No |
| Room Number | Auto Filled | No |
| Service Category | Yes | Yes |
| Problem Title | Yes | Yes |
| Detailed Description | Yes | Yes |
| Priority | No | Yes |
| Image Attachment | Future Version | No |

Student information shall always be fetched from the authenticated account.

Students shall never manually enter their block or room number.

---

# 28.5 Priority Levels

Version 1.0 supports three priority levels.

| Priority | Description |
|----------|-------------|
| Low | Minor inconvenience |
| Medium | Normal maintenance issue |
| High | Requires urgent attention |

Priority is informational only.

It shall **NOT** affect automatic staff assignment in Version 1.0.

Future versions may prioritize requests based on urgency.

---

# 28.6 Form Validation

The system shall validate every request before submission.

Validation Rules:

REQ-SER-001

Service Category is mandatory.

---

REQ-SER-002

Problem Title is mandatory.

---

REQ-SER-003

Description is mandatory.

---

REQ-SER-004

Problem Title:

Minimum Length

5 Characters

Maximum Length

100 Characters

---

REQ-SER-005

Description:

Minimum Length

20 Characters

Maximum Length

1000 Characters

---

REQ-SER-006

Leading and trailing spaces shall be removed automatically.

---

REQ-SER-007

HTML tags shall not be accepted.

---

REQ-SER-008

SQL Injection attempts shall be rejected.

---

REQ-SER-009

JavaScript code shall never be stored.

---

REQ-SER-010

Empty submissions are prohibited.

---

# 28.7 Duplicate Request Prevention

The backend shall prevent duplicate requests.

A duplicate request is defined as:

- Same Student
- Same Service
- Same Room
- Same Status (Pending, Assigned or In Progress)

Example:

Student submits

Electrical Issue

↓

Cannot submit another Electrical request until the previous one is either:

- Completed
- Cancelled

This prevents unnecessary duplicate maintenance requests.

---

# 28.8 Request Submission Workflow

Student Opens Services

↓

Chooses Service

↓

Fills Form

↓

Frontend Validation

↓

Backend Validation

↓

Duplicate Check

↓

Database Entry Created

↓

Automatic Staff Assignment

↓

Assigned Staff Dashboard Updated

↓

Student Dashboard Updated

↓

Success Message Displayed

---

# 28.9 Automatic Request Assignment

Immediately after successful validation, the backend shall automatically assign a staff member.

Assignment Rules:

Step 1

Identify Student Block.

↓

Step 2

Filter Staff belonging to the same block.

↓

Step 3

Filter Staff having the required service role.

↓

Step 4

Count active requests for each eligible staff member.

↓

Step 5

Select staff with the minimum active workload.

↓

Step 6

If multiple staff satisfy the condition, randomly choose one.

↓

Step 7

Assign Request.

The assignment process shall be completely automatic.

No manual intervention is required.

---

# 28.10 Initial Request Status

Every newly created request shall have:

Status

```
Assigned
```

Reason:

The staff member is already allocated immediately after request creation.

Later status transitions:

Assigned

↓

In Progress

↓

Completed

or

Cancelled

---

# 28.11 Request ID

Every request shall receive an automatically generated identifier.

Example

```
REQ-202600001
```

The format may change during implementation.

Request IDs shall always remain unique.

Students cannot edit or choose request IDs.

---

# 28.12 Success Response

After successful submission:

Display:

✅ Service request submitted successfully.

Request ID:

REQ-XXXX

Assigned Staff:

<Name>

Status:

Assigned

Students shall immediately see the request inside:

- Dashboard
- History
- Recent Requests

---

# 28.13 Failed Submission

If validation fails:

Display meaningful validation messages.

Examples:

"Please select a service."

"Description cannot be empty."

"Request already exists."

Raw backend exceptions must never be displayed.

---

# 28.14 Service Request Permissions

Students may:

✔ Create Requests

✔ View Their Own Requests

✔ Cancel Eligible Requests

Students may NOT:

✖ Edit Completed Requests

✖ Edit Assigned Staff

✖ Create Requests for Other Students

✖ Modify Request IDs

---

# 28.15 Service Module Success Criteria

The Service Request Module shall be considered complete when:

✓ Students can create requests successfully.

✓ Validation rules work correctly.

✓ Duplicate requests are prevented.

✓ Automatic assignment works correctly.

✓ Dashboard updates automatically.

✓ Assigned staff receives the request instantly.

✓ Request IDs remain unique.

✓ Only authenticated students can create requests.

✓ Unauthorized access is blocked.

✓ Invalid data is rejected.

---

**End of Part 5**
# 29. Student Complaint Module

## 29.1 Module Overview

The Complaint Module enables students to report hostel-related issues that cannot be resolved through standard maintenance services.

Unlike service requests, complaints are intended for administrative attention and are directly assigned to the Hostel Warden.

Examples include:

- Staff Misconduct
- Hostel Cleanliness
- Noise Disturbance
- Water Supply Issues
- Security Concerns
- General Hostel Management Problems

The complaint system provides students with a secure and transparent way to communicate concerns while allowing administrators to monitor complaint resolution.

---

# 29.2 Complaint Dashboard

Selecting **Complaint** from the sidebar shall open the Complaint Dashboard.

The page shall contain:

- Complaint Summary
- Create Complaint Button
- Complaint History Table
- Complaint Status

---

# 29.3 Create Complaint

Students shall be able to submit a complaint using a dedicated form.

Required Fields

| Field | Required |
|--------|----------|
| Complaint Category | Yes |
| Complaint Title | Yes |
| Complaint Description | Yes |

Student Information

The following information shall be filled automatically:

- Student Name
- Email
- Hostel Block
- Room Number

Students shall not edit these values.

---

# 29.4 Complaint Categories

Version 1.0 supports the following categories.

| Category ID | Category Name |
|--------------|---------------|
| COM-001 | Hostel Management |
| COM-002 | Staff Behaviour |
| COM-003 | Water Supply |
| COM-004 | Electricity |
| COM-005 | Security |
| COM-006 | Cleanliness |
| COM-007 | Other |

The architecture shall support adding new categories without code restructuring.

---

# 29.5 Complaint Validation

The backend shall validate every complaint.

Validation Rules

REQ-CMP-001

Complaint Category is mandatory.

---

REQ-CMP-002

Complaint Title is mandatory.

---

REQ-CMP-003

Complaint Description is mandatory.

---

REQ-CMP-004

Complaint Title

Minimum Length

5 Characters

Maximum Length

100 Characters

---

REQ-CMP-005

Complaint Description

Minimum Length

20 Characters

Maximum Length

1500 Characters

---

REQ-CMP-006

HTML, JavaScript and SQL Injection attempts shall be rejected.

---

REQ-CMP-007

Blank complaints are prohibited.

---

# 29.6 Complaint Workflow

Student Opens Complaint Page

↓

Creates Complaint

↓

Frontend Validation

↓

Backend Validation

↓

Complaint Saved

↓

Complaint Assigned to Warden

↓

Complaint Appears in Admin Dashboard

↓

Student Receives Confirmation

---

# 29.7 Complaint Assignment

Unlike maintenance requests, complaints shall NOT use the automatic assignment algorithm.

Every complaint shall be assigned directly to the Hostel Warden responsible for the student's hostel block.

If multiple wardens exist for the same block, the administrator may configure the default warden during system setup.

Version 1.0 assumes one warden per block.

---

# 29.8 Complaint Status

Each complaint shall have exactly one status.

Allowed Statuses

- Submitted
- Under Review
- Resolved
- Closed

Only authorized staff or administrators may update complaint status.

Students have read-only access.

---

# 29.9 Complaint ID

Every complaint shall receive an automatically generated unique identifier.

Example

```
CMP-202600001
```

Students cannot modify complaint IDs.

---

# 29.10 Complaint History

Students shall be able to view all complaints they have submitted.

The complaint history table shall display:

- Complaint ID
- Category
- Title
- Submitted Date
- Current Status
- Last Updated

Clicking a complaint shall open a detailed view.

---

# 29.11 Complaint Details Page

The details page shall display:

- Complaint ID
- Category
- Title
- Description
- Submitted Date
- Current Status
- Status Timeline
- Resolution Notes (if available)

Students shall not edit submitted complaints.

---

# 29.12 Complaint Permissions

Students may:

✔ Submit complaints

✔ View their own complaints

✔ View complaint status

Students may NOT:

✖ Edit complaints after submission

✖ Delete complaints

✖ View complaints submitted by other students

✖ Assign complaints

---

# 29.13 Duplicate Complaint Prevention

To prevent spam, the system shall check for duplicate complaints.

A complaint is considered duplicate when:

- Same Student
- Same Category
- Similar Title
- Status = Submitted or Under Review

If a duplicate exists, the student shall receive:

"You already have a similar complaint under review."

---

# 29.14 Notifications

After successful complaint submission:

The student shall receive:

- On-screen confirmation
- Complaint ID
- Current Status

Future versions may include email notifications whenever the complaint status changes.

---

# 29.15 Complaint Security

The Complaint Module shall ensure:

- Only authenticated students can submit complaints.
- Students can access only their own complaints.
- Complaint records cannot be modified directly through client requests.
- All complaint submissions shall be validated before database insertion.
- Complaint history shall remain permanently available for auditing.

---

# 29.16 Complaint Module Success Criteria

The Complaint Module shall be considered complete when:

✓ Students can submit complaints successfully.

✓ Validation rules function correctly.

✓ Complaints are automatically assigned to the appropriate Warden.

✓ Complaint IDs remain unique.

✓ Students can track complaint status.

✓ Duplicate complaints are prevented.

✓ Unauthorized access is blocked.

✓ Complaint history remains accessible.

---

**End of Part 6**
# 30. Request History Module

## 30.1 Module Overview

The Request History Module provides students with a permanent record of every service request submitted through the Room-Bot Service platform.

The history allows students to monitor completed work, cancelled requests, and previously submitted maintenance requests while maintaining complete transparency.

Every service request shall remain available in history for auditing and future reference.

Requests shall never be permanently deleted in Version 1.0.

---

# 30.2 History Dashboard

The History page shall display all service requests created by the authenticated student.

The page shall support:

- Search
- Status Filter
- Service Category Filter
- Date Sorting
- Pagination

---

# 30.3 History Table

The table shall contain the following columns.

| Column | Description |
|----------|-------------|
| Request ID | Unique request identifier |
| Service Category | Requested service |
| Problem Title | Short issue summary |
| Assigned Staff | Staff member assigned |
| Status | Current request status |
| Priority | Selected priority |
| Created Date | Submission date |
| Completed Date | Completion date (if applicable) |
| Actions | View Details / Feedback |

---

# 30.4 Request Details

Selecting **View Details** shall open a detailed request page.

The page shall display:

- Request ID
- Student Name
- Hostel Block
- Room Number
- Service Category
- Problem Title
- Detailed Description
- Priority
- Assigned Staff
- Current Status
- Created Time
- Assigned Time
- Started Time
- Completed Time
- Cancellation Reason (if cancelled)

This page is read-only.

Students cannot modify historical requests.

---

# 30.5 Search and Filters

Students shall be able to search using:

- Request ID
- Problem Title

Available filters:

Status

- Assigned
- In Progress
- Completed
- Cancelled

Service Category

- Cleaning
- Electrical
- Plumbing
- AC Maintenance
- Furniture Repair

Sorting

- Newest First
- Oldest First

---

# 30.6 History Retention

History records shall remain permanently available.

Records shall not be deleted when:

- Request completed
- Request cancelled
- Student logs out

Only database administrators may archive old records outside the application if required.

---

# 31. Feedback Module

## 31.1 Module Overview

The Feedback Module allows students to evaluate completed services.

Feedback helps administrators monitor service quality while enabling staff performance measurement.

Feedback becomes available only after successful service completion.

---

# 31.2 Feedback Eligibility

Students may submit feedback only when:

✔ Request Status = Completed

✔ OTP Verification Successful

Otherwise:

The feedback option shall remain disabled.

---

# 31.3 Feedback Form

The feedback form shall contain:

| Field | Required |
|--------|----------|
| Rating (1–5 Stars) | Yes |
| Comment | No |

The request information shall be displayed above the form for reference.

---

# 31.4 Rating Scale

Allowed ratings:

⭐ 1 – Very Poor

⭐⭐ 2 – Poor

⭐⭐⭐ 3 – Average

⭐⭐⭐⭐ 4 – Good

⭐⭐⭐⭐⭐ 5 – Excellent

Decimal ratings are not permitted.

---

# 31.5 Feedback Validation

REQ-FDB-001

Exactly one rating is required.

---

REQ-FDB-002

Comments are optional.

---

REQ-FDB-003

Comments shall contain a maximum of 500 characters.

---

REQ-FDB-004

Each completed request may receive only one feedback submission.

---

REQ-FDB-005

Feedback cannot be edited after submission.

---

REQ-FDB-006

Feedback cannot be deleted after submission.

---

# 31.6 Feedback Workflow

Completed Request

↓

Student Opens History

↓

View Request Details

↓

Click "Give Feedback"

↓

Select Rating

↓

Write Optional Comment

↓

Submit Feedback

↓

Feedback Stored

↓

Staff Rating Updated

↓

Admin Dashboard Updated

---

# 31.7 Staff Rating Calculation

Every submitted rating contributes equally.

Formula:

Average Rating

=

Total Rating Score

÷

Number of Submitted Ratings

Example

Ratings:

5

4

5

3

Average

=

4.25

The system shall calculate ratings automatically after each new feedback submission.

---

# 31.8 Staff Feedback Page

Staff members shall have access to a dedicated Feedback page.

The page shall display:

- Average Rating
- Total Reviews
- Individual Ratings
- Student Comments
- Service Category
- Date

Student identities shall not be displayed to staff in Version 1.0.

---

# 31.9 Administrator Feedback View

Administrators shall be able to monitor staff performance.

The Admin Dashboard shall display:

- Staff Name
- Average Rating
- Total Reviews
- Recent Comments
- Completed Requests

Administrators may use this information for performance evaluation.

---

# 31.10 Feedback Security

The Feedback Module shall ensure:

- Only authenticated students can submit feedback.
- Feedback is linked to the corresponding completed request.
- Duplicate feedback submissions are rejected.
- Unauthorized users cannot access another student's feedback records.

---

# 31.11 Empty States

If no completed requests exist:

Display:

"No completed requests available for feedback."

If no feedback has been submitted:

Display:

"You haven't submitted any feedback yet."

---

# 31.12 Success Criteria

The Request History and Feedback Modules shall be considered complete when:

✓ Students can view all historical requests.

✓ Search, filters, and pagination work correctly.

✓ Detailed request information is available.

✓ Feedback is enabled only for completed requests.

✓ One feedback submission is allowed per request.

✓ Staff ratings update automatically.

✓ Administrators can monitor staff performance.

✓ Historical records remain permanently available.

---

**End of Part 7**
# 32. Staff Module

## 32.1 Module Overview

The Staff Module enables authorized hostel staff members to manage and complete service requests assigned by the Room-Bot Service platform.

Unlike students, staff members cannot create service requests. Their responsibility begins after the automatic assignment process is completed.

The Staff Module shall provide:

- Dashboard
- Pending Requests
- Request Details
- Status Updates
- OTP Verification
- Work History
- Feedback Overview
- Profile Management

Only authenticated users with the **Staff** role may access this module.

---

# 32.2 Staff Dashboard

The Staff Dashboard serves as the homepage after successful login.

It provides an overview of assigned work and performance metrics.

The dashboard shall include:

### Welcome Card

Displays:

- Staff Name
- Staff Role
- Assigned Hostel Block
- Greeting Message

---

### Statistics Cards

The following summary cards shall be displayed:

- Active Requests
- Assigned Requests
- In Progress Requests
- Completed Requests
- Average Rating

Each card shall display:

- Icon
- Title
- Count
- Color Indicator

---

### Recent Assigned Requests

Display the latest five assigned requests.

Each row shall include:

- Request ID
- Student Room
- Service Category
- Current Status
- Assigned Date

Clicking a row opens the request details page.

---

# 32.3 Staff Navigation

The Staff Dashboard shall use a left sidebar.

Sidebar Items:

🏠 Dashboard

📋 Pending Requests

📜 Work History

⭐ Feedback

👤 Profile

Logout

The active menu shall remain highlighted.

The sidebar shall collapse automatically on smaller devices.

---

# 32.4 Pending Requests

The Pending Requests page shall display all active requests assigned to the authenticated staff member.

Requests shall be grouped by status.

Supported statuses:

- Assigned
- In Progress

Completed and Cancelled requests shall not appear on this page.

---

# 32.5 Pending Requests Table

The table shall contain:

| Column | Description |
|----------|-------------|
| Request ID | Unique identifier |
| Student Room | Room Number |
| Hostel Block | Student Block |
| Service Category | Requested Service |
| Priority | Selected Priority |
| Status | Current Status |
| Assigned Date | Assignment Timestamp |
| Actions | View Details |

The page shall support:

- Search
- Status Filter
- Priority Filter
- Pagination

---

# 32.6 Request Details

Selecting **View Details** shall open a detailed request page.

Displayed Information:

- Request ID
- Student Name
- Email
- Hostel Block
- Room Number
- Service Category
- Problem Title
- Detailed Description
- Priority
- Assigned Time
- Current Status

Staff members shall not modify the original request information.

---

# 32.7 Status Updates

Staff members may update request status according to the following workflow.

Assigned

↓

In Progress

↓

Completed (after OTP verification)

A request cannot skip directly from **Assigned** to **Completed**.

---

# 32.8 Start Work

When the staff member begins working on a request, they shall click:

**Start Work**

The system shall:

- Update status to **In Progress**
- Record Started Time
- Update student dashboard
- Update administrator dashboard

---

# 32.9 Complete Work

After finishing the service, the staff member shall click:

**Complete Work**

The backend shall:

- Generate a random six-digit OTP
- Store the OTP securely
- Set an expiry time
- Send the OTP to the student's registered email

The request shall remain **In Progress** until OTP verification succeeds.

---

# 32.10 OTP Verification

The student provides the received OTP to the staff member.

The staff member enters the OTP into the application.

The backend validates:

- Correct OTP
- Matching Request
- Not Expired
- Not Previously Used

If successful:

- Request Status = Completed
- Completion Time Recorded
- Feedback Enabled
- Dashboards Updated

If validation fails:

Display:

"Invalid or expired OTP."

The request remains **In Progress**.

---

# 32.11 Request Timeline

Each request shall maintain the following timestamps:

- Created Time
- Assigned Time
- Started Time
- Completed Time

These timestamps are read-only and available in the request details page.

---

# 32.12 Staff Permissions

Staff members may:

✔ View assigned requests

✔ Update request status

✔ Start work

✔ Complete work

✔ Verify OTP

✔ View work history

✔ View ratings

✔ Logout

Staff members may NOT:

✖ Create service requests

✖ Modify request details

✖ Reassign requests

✖ Delete requests

✖ Access administrator pages

✖ View requests assigned to other staff members

---

# 32.13 Empty States

If no active requests exist:

Display:

"No pending requests assigned."

If no completed requests exist:

Display:

"No completed work available."

---

# 32.14 Loading and Error States

All API operations shall display loading indicators.

Examples:

Loading Requests...

Updating Status...

Verifying OTP...

Unexpected errors shall display user-friendly messages without exposing backend details.

---

# 32.15 Staff Module Success Criteria

The Staff Module shall be considered complete when:

✓ Assigned requests are displayed correctly.

✓ Staff can start work.

✓ Status updates follow the defined workflow.

✓ OTP verification completes requests securely.

✓ Dashboards update automatically.

✓ Unauthorized operations are blocked.

✓ Responsive layout functions correctly.

✓ Loading and error states are handled gracefully.

---

**End of Part 8**
# 33. Administrator Module

## 33.1 Module Overview

The Administrator Module provides centralized management and monitoring capabilities for the entire Room-Bot Service platform.

Administrators are responsible for:

- Managing students
- Managing staff
- Monitoring service requests
- Monitoring complaints
- Viewing analytics
- Monitoring staff performance
- Maintaining system integrity

Administrators shall not perform maintenance work or create service requests.

Only authenticated users with the **Administrator** role may access this module.

---

# 33.2 Administrator Dashboard

The Administrator Dashboard serves as the control center of the application.

It shall provide a real-time overview of hostel operations through summary cards, charts, and recent activity.

---

## Dashboard Components

### Statistics Cards

The dashboard shall display:

- Total Students
- Total Staff
- Active Requests
- Completed Requests
- Active Complaints
- Average Staff Rating

Each card shall include:

- Icon
- Title
- Count
- Color Indicator

---

### Request Status Chart

Display request distribution by status.

Statuses:

- Assigned
- In Progress
- Completed
- Cancelled

The chart updates automatically whenever request statuses change.

---

### Service Category Chart

Display the number of requests by service category.

Categories:

- Room Cleaning
- Electrical Maintenance
- Plumbing
- AC Maintenance
- Furniture Repair

---

### Recent Activities

Display the latest system events.

Examples:

- New student registered
- New staff registered
- Service request submitted
- Complaint submitted
- Request completed
- Feedback received

---

# 33.3 Administrator Navigation

The Administrator Dashboard shall use a left sidebar.

Sidebar Items:

🏠 Dashboard

👨‍🎓 Student Management

👷 Staff Management

📋 Request Management

📢 Complaint Management

📊 Analytics

👤 Profile

Logout

The active menu shall remain highlighted.

---

# 33.4 Student Management

Administrators shall be able to manage all registered students.

The page shall include:

- Search
- Block Filter
- Pagination

Displayed Information:

| Column | Description |
|----------|-------------|
| Student ID | Unique Identifier |
| Name | Student Name |
| Email | Registered Email |
| Hostel Block | Assigned Block |
| Room Number | Assigned Room |
| Status | Active / Blocked |
| Actions | View / Block / Unblock |

---

## Student Actions

Administrators may:

✔ View Student Details

✔ Block Student

✔ Unblock Student

Administrators may NOT:

✖ Edit passwords

✖ View password hashes

✖ Delete student accounts in Version 1.0

---

# 33.5 Staff Management

Administrators shall be able to manage all registered staff members.

Displayed Information:

| Column | Description |
|----------|-------------|
| Staff ID | Unique Identifier |
| Name | Staff Name |
| Role | Service Role |
| Block | Assigned Block |
| Active Requests | Current Workload |
| Completed Requests | Completed Count |
| Average Rating | Calculated Rating |
| Status | Active / Blocked |
| Actions | View / Block / Unblock |

---

## Staff Details

Selecting **View** shall display:

- Personal Information
- Assigned Block
- Service Role
- Active Requests
- Completed Requests
- Average Rating
- Recent Feedback

---

# 33.6 Request Management

Administrators shall be able to monitor every service request.

Displayed Information:

- Request ID
- Student
- Assigned Staff
- Service Category
- Priority
- Current Status
- Created Date
- Completed Date

Available Features:

- Search
- Status Filter
- Service Filter
- Block Filter
- Date Range Filter
- Pagination

Administrators shall have read-only access in Version 1.0.

---

# 33.7 Complaint Management

Administrators shall monitor all complaints.

Displayed Information:

- Complaint ID
- Student
- Category
- Assigned Warden
- Current Status
- Submitted Date

Administrators may:

✔ View Complaint Details

✔ Update Complaint Status

✔ View Resolution Notes

---

Allowed Complaint Statuses

- Submitted
- Under Review
- Resolved
- Closed

Every status update shall be recorded in the complaint timeline.

---

# 33.8 Analytics

The Analytics page shall present operational insights.

Required Metrics:

- Total Students
- Total Staff
- Total Requests
- Completed Requests
- Cancelled Requests
- Active Requests
- Total Complaints
- Average Resolution Time
- Average Staff Rating

Charts shall support filtering by:

- Date Range
- Hostel Block
- Service Category

---

# 33.9 Administrator Permissions

Administrators may:

✔ View all users

✔ View all requests

✔ View all complaints

✔ Block or unblock users

✔ View analytics

✔ Monitor staff performance

✔ Update complaint status

✔ Logout

Administrators may NOT:

✖ Submit service requests

✖ Submit complaints

✖ Complete maintenance work

✖ Bypass authentication requirements

---

# 33.10 Blocking Users

Administrators may temporarily block:

- Students
- Staff

Blocked users:

- Cannot login
- Cannot access protected APIs
- Shall receive:

"Your account has been blocked. Please contact the hostel administrator."

Blocking shall not delete any historical data.

---

# 33.11 Audit Logging

Every administrator action shall be recorded.

Examples:

- Student blocked
- Student unblocked
- Staff blocked
- Complaint status updated

Each audit log shall contain:

- Administrator ID
- Action Performed
- Target Entity
- Timestamp

Audit logs are read-only.

---

# 33.12 Administrator Module Success Criteria

The Administrator Module shall be considered complete when:

✓ Dashboard displays accurate statistics.

✓ Student management functions correctly.

✓ Staff management functions correctly.

✓ Request monitoring works correctly.

✓ Complaint management works correctly.

✓ Analytics display accurate information.

✓ Blocking and unblocking users functions correctly.

✓ Audit logs record administrator actions.

✓ Unauthorized users cannot access administrator features.

---

**End of Part 9**
# 34. Request Assignment and Lifecycle

## 34.1 Module Overview

The Request Assignment and Lifecycle module defines how service requests are automatically assigned, processed, tracked, completed, and archived throughout their lifecycle.

The objective is to ensure:

- Fair workload distribution
- Transparent request tracking
- Minimal manual intervention
- Complete auditability
- Consistent business rule enforcement

All request state changes shall occur through validated backend operations only.

---

# 34.2 Request Lifecycle

Every service request shall follow the lifecycle below.

```
Student Creates Request
        │
        ▼
Automatic Assignment
        │
        ▼
Assigned
        │
        ▼
In Progress
        │
        ▼
OTP Generated
        │
        ▼
OTP Verified
        │
        ▼
Completed
```

Alternative path:

```
Assigned
      │
      ▼
Cancelled
```

Cancelled requests are considered closed and cannot return to any previous status.

---

# 34.3 Valid Status Transitions

The backend shall enforce the following transitions.

| Current Status | Allowed Next Status |
|----------------|---------------------|
| Assigned | In Progress, Cancelled |
| In Progress | Completed |
| Completed | None |
| Cancelled | None |

Any other transition shall return:

HTTP 400 Bad Request

Message:

```
Invalid status transition.
```

---

# 34.4 Automatic Assignment Algorithm

Immediately after a valid request is created, the backend shall execute the assignment algorithm.

The algorithm shall run automatically without administrator intervention.

---

## Step 1

Read the authenticated student's hostel block.

Example:

```
Block A
```

---

## Step 2

Identify the requested service category.

Example:

```
Electrical Maintenance
```

---

## Step 3

Retrieve all active staff members satisfying:

- Same hostel block
- Matching service role
- Account status = Active

Blocked staff shall never be considered.

---

## Step 4

Calculate each eligible staff member's active workload.

Active requests include only:

- Assigned
- In Progress

The following statuses shall not contribute to workload:

- Completed
- Cancelled

---

## Step 5

Select the minimum workload.

Example:

| Staff | Active Requests |
|--------|-----------------|
| Staff A | 2 |
| Staff B | 1 |
| Staff C | 4 |

Selected:

```
Staff B
```

---

## Step 6

If multiple staff members have the same minimum workload:

Example:

| Staff | Active Requests |
|--------|-----------------|
| Staff A | 1 |
| Staff B | 1 |
| Staff C | 3 |

The backend shall randomly choose one eligible staff member.

Random selection ensures balanced distribution over time.

---

## Step 7

Assign the request.

The backend shall automatically:

- Save Assigned Staff ID
- Save Assigned Timestamp
- Update Request Status = Assigned
- Update dashboards

---

# 34.5 No Eligible Staff

If no eligible staff member exists:

Conditions:

- No staff for that service
- All matching staff blocked
- No staff assigned to block

The request shall remain:

```
Pending Assignment
```

The administrator dashboard shall highlight these requests for administrative attention.

---

# 34.6 Cancellation Rules

Students may cancel requests only when the request status is:

- Assigned

Cancellation is prohibited when:

- In Progress
- Completed
- Cancelled

After cancellation:

- Status becomes Cancelled
- Cancellation timestamp recorded
- Assigned staff workload updated
- Request retained in history

---

# 34.7 Work Start Rules

Only the assigned staff member may start work.

Starting work shall:

- Change status to In Progress
- Record Started Timestamp
- Notify student dashboard
- Update administrator dashboard

Other staff members shall receive:

HTTP 403 Forbidden

---

# 34.8 Work Completion Rules

Only the assigned staff member may complete work.

Completion shall:

- Generate random OTP
- Save encrypted OTP record
- Set expiry time
- Email OTP to student

Request status remains:

```
In Progress
```

until OTP verification succeeds.

---

# 34.9 OTP Verification Rules

The backend shall verify:

- Request exists
- Staff matches assigned staff
- OTP matches
- OTP not expired
- OTP unused

Successful verification shall:

- Mark request Completed
- Record completion timestamp
- Invalidate OTP
- Enable feedback
- Update dashboards

Failed verification shall not change request status.

---

# 34.10 Timestamp Management

Every request shall maintain:

| Timestamp | Description |
|-----------|-------------|
| Created At | Request submitted |
| Assigned At | Staff assigned |
| Started At | Work started |
| Completed At | OTP verified |
| Cancelled At | Student cancelled (if applicable) |

Timestamps shall be generated exclusively by the backend.

---

# 34.11 Notification Triggers

The following events shall generate notifications.

| Event | Recipient |
|--------|-----------|
| Request Assigned | Staff |
| Work Started | Student |
| OTP Generated | Student |
| Request Completed | Student |
| Complaint Submitted | Warden |
| Feedback Submitted | Administrator |

Notification delivery methods are defined in the Notification Module.

---

# 34.12 Concurrency Rules

The backend shall prevent race conditions.

Examples:

- Two staff members cannot complete the same request.
- Duplicate OTP verification shall fail.
- Duplicate request assignment shall not occur.
- Multiple simultaneous status updates shall be rejected if the request has already changed state.

Database transactions shall be used where necessary to maintain consistency.

---

# 34.13 Exception Handling

The system shall handle the following situations gracefully:

- Staff account blocked after assignment
- Student account blocked during active request
- OTP expired
- Staff unavailable
- Duplicate request submission
- Network interruption during status update

In all cases:

- Data integrity shall be preserved.
- No partial updates shall remain in the database.

---

# 34.14 Lifecycle Success Criteria

The Request Lifecycle Module shall be considered complete when:

✓ Automatic assignment always follows business rules.

✓ Workload distribution is balanced.

✓ Invalid status transitions are rejected.

✓ OTP verification securely completes requests.

✓ Cancellation rules are enforced.

✓ Notifications are triggered correctly.

✓ Backend maintains data consistency during concurrent operations.

✓ Complete request history is preserved for auditing.

---

**End of Part 10**
# 35. Notification and Email System

## 35.1 Module Overview

The Notification and Email System is responsible for delivering important updates to users throughout the lifecycle of the Room-Bot Service platform.

The objectives of this module are:

- Keep users informed
- Improve transparency
- Support OTP verification
- Reduce manual communication
- Ensure reliable event notifications

Version 1.0 supports email notifications. Future versions may support push notifications, SMS, and in-app notifications.

---

# 35.2 Notification Types

The system shall support the following notification categories.

| Notification Type | Recipient |
|-------------------|-----------|
| Registration OTP | Student / Staff |
| Password Reset OTP | Student / Staff / Administrator |
| Request Assigned | Assigned Staff |
| Work Started | Student |
| Work Completion OTP | Student |
| Complaint Submitted | Warden |
| Complaint Status Updated | Student |
| Feedback Submitted | Administrator |

Each notification shall be triggered automatically by backend events.

---

# 35.3 Email Service

All emails shall be sent through a secure email service integrated with the backend.

The email provider shall support:

- Secure SMTP
- TLS Encryption
- Delivery Status Monitoring
- Retry Mechanism

Configuration values such as SMTP credentials shall be stored in environment variables.

Hardcoded credentials are strictly prohibited.

---

# 35.4 Registration OTP Email

A registration OTP email shall be sent immediately after successful registration.

Email Subject:

```
Room-Bot Service - Verify Your Email
```

Email Body:

- Greeting
- Verification OTP
- Expiry Time
- Security Reminder

Example:

```
Hello Meet,

Your verification code is:

483921

This code will expire in 10 minutes.

If you did not create this account, please ignore this email.
```

---

# 35.5 Password Reset Email

When a user requests password reset:

The backend shall:

- Generate OTP
- Save OTP securely
- Send OTP email

Subject:

```
Room-Bot Service - Password Reset
```

The email shall include:

- OTP
- Expiry Time
- Security Warning

---

# 35.6 Work Completion OTP Email

When staff marks work as completed:

The backend shall:

- Generate random OTP
- Save OTP
- Send OTP to the student's registered email

Subject:

```
Room-Bot Service - Service Completion Verification
```

Email Content:

- Greeting
- Request ID
- Service Category
- OTP
- Expiry Time

Students shall provide this OTP to the assigned staff member to complete verification.

---

# 35.7 Complaint Notifications

When a complaint is submitted:

The assigned Warden shall receive a notification containing:

- Complaint ID
- Student Block
- Complaint Category
- Submission Time

When complaint status changes:

The student shall receive a notification indicating the updated status.

---

# 35.8 Notification Delivery Rules

Each notification shall include:

- Unique Notification ID
- Timestamp
- Recipient
- Notification Type
- Delivery Status

Delivery Status values:

- Pending
- Sent
- Failed

The backend shall update delivery status after each sending attempt.

---

# 35.9 Retry Policy

If an email cannot be delivered:

The backend shall retry automatically.

Recommended retry schedule:

- First Retry: 1 minute
- Second Retry: 5 minutes
- Third Retry: 15 minutes

If all retries fail:

- Mark notification as Failed
- Record the failure in system logs

---

# 35.10 Email Templates

All email templates shall follow a consistent format.

Each email shall contain:

- Room-Bot Service Logo (Future Version)
- Subject
- Greeting
- Main Message
- Required Action
- Security Notice
- Footer

Footer Example:

```
This is an automated email from Room-Bot Service.

Please do not reply to this email.
```

---

# 35.11 Notification Security

The Notification Module shall ensure:

- OTP values are never reused.
- Expired OTPs are rejected.
- Email addresses are validated before sending.
- Sensitive information is never included unnecessarily.
- SMTP credentials remain confidential.

---

# 35.12 Future Enhancements

Future versions may support:

- In-App Notifications
- Mobile Push Notifications
- SMS Alerts
- WhatsApp Notifications
- Real-Time Notification Center
- Notification Preferences

These features are outside the scope of Version 1.0.

---

# 35.13 Notification Module Success Criteria

The Notification Module shall be considered complete when:

✓ Registration OTP emails are delivered successfully.

✓ Password reset emails function correctly.

✓ Work completion OTP emails are generated and delivered.

✓ Complaint notifications are sent to the appropriate recipients.

✓ Delivery status is tracked accurately.

✓ Failed email attempts are retried.

✓ Sensitive information remains protected.

✓ Notification events are generated automatically by backend workflows.

---

**End of Part 11**
# 36. Validation, Error Handling and Edge Cases

## 36.1 Module Overview

This chapter defines the validation rules, error handling strategy, and edge case management for the Room-Bot Service platform.

The objective is to ensure:

- Data integrity
- System stability
- Secure user interactions
- Consistent error responses
- Graceful failure handling

Every validation shall be enforced by the backend, regardless of any frontend validation.

---

# 36.2 Input Validation

All user inputs shall be validated before processing.

Validation shall include:

- Required field validation
- Data type validation
- Length validation
- Format validation
- Business rule validation
- Duplicate record validation
- Authorization validation

Client-side validation improves user experience but shall never replace server-side validation.

---

# 36.3 Authentication Validation

The system shall validate:

### Registration

- Required fields completed
- Valid email format
- Unique email address
- Password strength
- Password confirmation match
- Valid hostel block
- Valid staff role (for staff registration)

---

### Login

- Email or username exists
- Password matches
- Account is verified
- Account is not blocked
- JWT generation succeeds

---

### Forgot Password

- Email exists
- OTP valid
- OTP not expired
- Password meets security requirements

---

# 36.4 Service Request Validation

The backend shall validate:

- Authenticated student
- Valid service category
- Problem title present
- Description present
- Duplicate request check
- Student account active
- Valid hostel block

If any validation fails, the request shall not be created.

---

# 36.5 Complaint Validation

The backend shall validate:

- Authenticated student
- Complaint category
- Complaint title
- Complaint description
- Duplicate complaint detection
- Student account status

Invalid complaints shall be rejected.

---

# 36.6 OTP Validation

Every OTP verification shall check:

- Request exists
- OTP exists
- OTP matches
- OTP belongs to the request
- OTP belongs to the student
- OTP unused
- OTP not expired

If any validation fails:

Request status shall remain unchanged.

---

# 36.7 Authorization Validation

Every protected endpoint shall verify:

- JWT validity
- Token expiry
- User role
- Account status

Example:

A Student attempting to access an Administrator endpoint shall receive:

HTTP Status

```
403 Forbidden
```

---

# 36.8 Common HTTP Status Codes

| Status Code | Description |
|--------------|-------------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

All APIs shall use standard HTTP status codes consistently.

---

# 36.9 Standard Error Response Format

Every API error response shall follow the same JSON structure.

Example:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists."
    }
  ],
  "timestamp": "2026-01-15T10:30:00Z"
}
```

The response format shall remain consistent across all endpoints.

---

# 36.10 Business Rule Violations

Examples:

Student attempts duplicate request.

Response

```
409 Conflict
```

Message

```
An active request already exists for this service.
```

---

Attempt to submit feedback twice.

Response

```
409 Conflict
```

Message

```
Feedback has already been submitted.
```

---

Attempt to verify expired OTP.

Response

```
400 Bad Request
```

Message

```
OTP has expired.
```

---

# 36.11 Edge Cases

The system shall correctly handle the following scenarios.

### User Related

- Account blocked after login
- Simultaneous login from multiple devices
- Expired JWT during API request
- Deleted browser token
- Invalid role access

---

### Service Request Related

- No eligible staff available
- Staff blocked after assignment
- Duplicate submissions
- Double-click on submit button
- Browser refresh during submission

---

### OTP Related

- Expired OTP
- Incorrect OTP
- OTP entered multiple times
- OTP reused
- Multiple OTP requests

---

### Complaint Related

- Duplicate complaints
- Invalid complaint category
- Complaint status updated twice
- Complaint already closed

---

### Network Related

- Slow internet connection
- Backend timeout
- Database unavailable
- SMTP server unavailable
- Partial request failure

---

### Database Related

- Duplicate primary key
- Unique constraint violation
- Foreign key violation
- Transaction rollback
- Deadlock detection

---

# 36.12 Logging Requirements

The backend shall record application logs.

Log Levels:

- INFO
- WARN
- ERROR
- FATAL

Examples:

INFO

```
Student logged in successfully.
```

WARN

```
Duplicate service request prevented.
```

ERROR

```
Database connection failed.
```

Sensitive information such as passwords, JWT secrets, OTP values, and bcrypt hashes shall never be written to application logs.

---

# 36.13 Recovery Strategy

The application shall recover gracefully whenever possible.

Examples:

Database temporarily unavailable

↓

Return user-friendly error

↓

Retry operation when appropriate

SMTP temporarily unavailable

↓

Retry email

↓

Log failure if retries exhausted

Unexpected exception

↓

Rollback transaction

↓

Log error

↓

Return generic error response

---

# 36.14 User-Friendly Error Messages

The application shall avoid technical jargon.

Examples:

Instead of:

```
SQLSTATE[23505]
```

Display:

```
This email address is already registered.
```

Instead of:

```
Foreign key constraint failed.
```

Display:

```
The requested resource could not be processed. Please try again.
```

---

# 36.15 Validation and Error Handling Success Criteria

This module shall be considered complete when:

✓ All required fields are validated.

✓ Invalid requests are rejected.

✓ Standard HTTP status codes are used consistently.

✓ API responses follow a common format.

✓ Sensitive information is never exposed.

✓ Edge cases are handled safely.

✓ System failures preserve data integrity.

✓ User-friendly error messages are displayed.

✓ Application logs support troubleshooting without exposing confidential information.

---

**End of Part 12**
# 36. Validation, Error Handling and Edge Cases

## 36.1 Module Overview

This chapter defines the validation rules, error handling strategy, and edge case management for the Room-Bot Service platform.

The objective is to ensure:

- Data integrity
- System stability
- Secure user interactions
- Consistent error responses
- Graceful failure handling

Every validation shall be enforced by the backend, regardless of any frontend validation.

---

# 36.2 Input Validation

All user inputs shall be validated before processing.

Validation shall include:

- Required field validation
- Data type validation
- Length validation
- Format validation
- Business rule validation
- Duplicate record validation
- Authorization validation

Client-side validation improves user experience but shall never replace server-side validation.

---

# 36.3 Authentication Validation

The system shall validate:

### Registration

- Required fields completed
- Valid email format
- Unique email address
- Password strength
- Password confirmation match
- Valid hostel block
- Valid staff role (for staff registration)

---

### Login

- Email or username exists
- Password matches
- Account is verified
- Account is not blocked
- JWT generation succeeds

---

### Forgot Password

- Email exists
- OTP valid
- OTP not expired
- Password meets security requirements

---

# 36.4 Service Request Validation

The backend shall validate:

- Authenticated student
- Valid service category
- Problem title present
- Description present
- Duplicate request check
- Student account active
- Valid hostel block

If any validation fails, the request shall not be created.

---

# 36.5 Complaint Validation

The backend shall validate:

- Authenticated student
- Complaint category
- Complaint title
- Complaint description
- Duplicate complaint detection
- Student account status

Invalid complaints shall be rejected.

---

# 36.6 OTP Validation

Every OTP verification shall check:

- Request exists
- OTP exists
- OTP matches
- OTP belongs to the request
- OTP belongs to the student
- OTP unused
- OTP not expired

If any validation fails:

Request status shall remain unchanged.

---

# 36.7 Authorization Validation

Every protected endpoint shall verify:

- JWT validity
- Token expiry
- User role
- Account status

Example:

A Student attempting to access an Administrator endpoint shall receive:

HTTP Status

```
403 Forbidden
```

---

# 36.8 Common HTTP Status Codes

| Status Code | Description |
|--------------|-------------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

All APIs shall use standard HTTP status codes consistently.

---

# 36.9 Standard Error Response Format

Every API error response shall follow the same JSON structure.

Example:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists."
    }
  ],
  "timestamp": "2026-01-15T10:30:00Z"
}
```

The response format shall remain consistent across all endpoints.

---

# 36.10 Business Rule Violations

Examples:

Student attempts duplicate request.

Response

```
409 Conflict
```

Message

```
An active request already exists for this service.
```

---

Attempt to submit feedback twice.

Response

```
409 Conflict
```

Message

```
Feedback has already been submitted.
```

---

Attempt to verify expired OTP.

Response

```
400 Bad Request
```

Message

```
OTP has expired.
```

---

# 36.11 Edge Cases

The system shall correctly handle the following scenarios.

### User Related

- Account blocked after login
- Simultaneous login from multiple devices
- Expired JWT during API request
- Deleted browser token
- Invalid role access

---

### Service Request Related

- No eligible staff available
- Staff blocked after assignment
- Duplicate submissions
- Double-click on submit button
- Browser refresh during submission

---

### OTP Related

- Expired OTP
- Incorrect OTP
- OTP entered multiple times
- OTP reused
- Multiple OTP requests

---

### Complaint Related

- Duplicate complaints
- Invalid complaint category
- Complaint status updated twice
- Complaint already closed

---

### Network Related

- Slow internet connection
- Backend timeout
- Database unavailable
- SMTP server unavailable
- Partial request failure

---

### Database Related

- Duplicate primary key
- Unique constraint violation
- Foreign key violation
- Transaction rollback
- Deadlock detection

---

# 36.12 Logging Requirements

The backend shall record application logs.

Log Levels:

- INFO
- WARN
- ERROR
- FATAL

Examples:

INFO

```
Student logged in successfully.
```

WARN

```
Duplicate service request prevented.
```

ERROR

```
Database connection failed.
```

Sensitive information such as passwords, JWT secrets, OTP values, and bcrypt hashes shall never be written to application logs.

---

# 36.13 Recovery Strategy

The application shall recover gracefully whenever possible.

Examples:

Database temporarily unavailable

↓

Return user-friendly error

↓

Retry operation when appropriate

SMTP temporarily unavailable

↓

Retry email

↓

Log failure if retries exhausted

Unexpected exception

↓

Rollback transaction

↓

Log error

↓

Return generic error response

---

# 36.14 User-Friendly Error Messages

The application shall avoid technical jargon.

Examples:

Instead of:

```
SQLSTATE[23505]
```

Display:

```
This email address is already registered.
```

Instead of:

```
Foreign key constraint failed.
```

Display:

```
The requested resource could not be processed. Please try again.
```

---

# 36.15 Validation and Error Handling Success Criteria

This module shall be considered complete when:

✓ All required fields are validated.

✓ Invalid requests are rejected.

✓ Standard HTTP status codes are used consistently.

✓ API responses follow a common format.

✓ Sensitive information is never exposed.

✓ Edge cases are handled safely.

✓ System failures preserve data integrity.

✓ User-friendly error messages are displayed.

✓ Application logs support troubleshooting without exposing confidential information.

---

**End of Part 12**
# 37. Non-Functional Requirements

## 37.1 Module Overview

Non-functional requirements define the quality attributes of the Room-Bot Service platform.

These requirements ensure that the application is:

- Secure
- Reliable
- Scalable
- Maintainable
- Performant
- Accessible
- Production Ready

All implementation decisions shall comply with these requirements.

---

# 37.2 Performance Requirements

The application shall provide responsive performance during normal hostel operations.

Performance Targets:

| Requirement | Target |
|-------------|--------|
| Login Response | ≤ 2 Seconds |
| Dashboard Load | ≤ 3 Seconds |
| API Response (Average) | ≤ 500 ms |
| Request Submission | ≤ 2 Seconds |
| Search Response | ≤ 1 Second |
| Page Navigation | ≤ 1 Second |

These values represent expected performance under normal operating conditions.

---

# 37.3 Scalability Requirements

The architecture shall support future expansion without major redesign.

The system shall support:

- Multiple Hostel Blocks
- Additional Service Categories
- Additional Staff Roles
- Multiple Hostels
- Increased User Volume
- Future AI Modules

Database normalization and modular backend architecture shall support future growth.

---

# 37.4 Availability Requirements

The application should remain available whenever hostel operations are active.

Target Availability:

```
99.5%
```

Planned maintenance windows shall be communicated in advance.

Unexpected downtime shall be minimized.

---

# 37.5 Reliability Requirements

The application shall maintain data consistency under normal and unexpected conditions.

Requirements:

- No duplicate request creation
- No duplicate OTP verification
- Atomic database transactions
- Automatic rollback on transaction failure
- Consistent request status management

The system shall preserve data integrity even during failures.

---

# 37.6 Security Requirements

The platform shall follow modern web application security practices.

Mandatory security measures include:

- JWT Authentication
- bcrypt Password Hashing
- HTTPS in Production
- Role-Based Access Control (RBAC)
- Secure Environment Variables
- Input Validation
- SQL Injection Prevention
- Cross-Site Scripting (XSS) Prevention
- Cross-Origin Resource Sharing (CORS) Configuration
- Rate Limiting
- Secure HTTP Headers

Sensitive information shall never be exposed in responses or logs.

---

# 37.7 Maintainability Requirements

The project shall be easy to maintain and extend.

Requirements:

- Modular folder structure
- Separation of concerns
- Reusable components
- Well-structured APIs
- Consistent naming conventions
- Comprehensive documentation

Future developers should be able to understand the project with minimal onboarding.

---

# 37.8 Compatibility Requirements

The application shall support modern web browsers.

Supported Browsers:

- Google Chrome (Latest)
- Microsoft Edge (Latest)
- Mozilla Firefox (Latest)
- Safari (Latest)

The user interface shall adapt correctly across supported browsers.

---

# 37.9 Responsive Design Requirements

The application shall support:

Desktop

- Full sidebar
- Multi-column layout

Tablet

- Collapsible sidebar
- Responsive cards

Mobile

- Hamburger navigation
- Single-column layout
- Touch-friendly controls

Horizontal scrolling shall be avoided except where unavoidable for large data tables.

---

# 37.10 Accessibility Requirements

The application shall follow accessibility best practices.

Requirements:

- Semantic HTML
- Keyboard Navigation
- Screen Reader Compatibility
- Focus Indicators
- Accessible Form Labels
- Adequate Color Contrast
- Responsive Text Scaling

Accessibility improvements shall not reduce usability for other users.

---

# 37.11 Database Requirements

The database shall satisfy the following requirements:

- PostgreSQL
- ACID Compliance
- Normalized Schema
- Foreign Key Constraints
- Indexing on Frequently Queried Fields
- Unique Constraints
- Transaction Support
- Automatic Timestamp Storage

The database shall preserve referential integrity at all times.

---

# 37.12 API Requirements

Backend APIs shall comply with REST principles.

Requirements:

- Stateless Requests
- JSON Request and Response Bodies
- Consistent Endpoint Naming
- Standard HTTP Status Codes
- Input Validation
- Authentication Middleware
- Authorization Middleware
- Versioning Support (e.g., /api/v1)

---

# 37.13 Logging Requirements

The application shall generate structured logs.

Each log entry shall include:

- Timestamp
- Log Level
- Module
- Event Description

Sensitive information shall never be logged.

Logs shall assist in debugging and monitoring production systems.

---

# 37.14 Backup and Recovery

The system shall support regular database backups.

Requirements:

- Scheduled Backups
- Secure Backup Storage
- Recovery Procedures
- Backup Verification

Future versions may support automated cloud backup.

---

# 37.15 Monitoring Requirements

The application should support operational monitoring.

Recommended metrics include:

- API Response Time
- Error Rate
- Active Users
- Database Health
- Email Delivery Status
- Server Resource Usage

These metrics help identify issues before they affect users.

---

# 37.16 Code Quality Requirements

The codebase shall follow consistent engineering standards.

Requirements:

- ESLint Configuration
- Prettier Formatting
- Modular Architecture
- Meaningful Variable Names
- Proper Error Handling
- No Dead Code
- No Hardcoded Secrets
- Environment-Based Configuration

All production code shall pass linting before deployment.

---

# 37.17 Deployment Requirements

The application shall support deployment using Docker.

Deployment shall include:

- Frontend Container
- Backend Container
- PostgreSQL Database
- Environment Configuration

Deployment procedures are defined in the Deployment Guide document.

---

# 37.18 Future Extensibility

The architecture shall support future enhancements, including:

- AI-Based Request Prioritization
- Image Uploads
- Real-Time Notifications
- Mobile Application
- Multi-Language Support
- University Single Sign-On
- Analytics Dashboard Enhancements

These enhancements shall not require significant redesign of existing modules.

---

# 37.19 Non-Functional Requirement Success Criteria

The application shall satisfy the following objectives:

✓ Fast response times

✓ Secure authentication and authorization

✓ Reliable data consistency

✓ Responsive user interface

✓ Modular and maintainable codebase

✓ Production-ready deployment

✓ Cross-browser compatibility

✓ Accessible user experience

✓ Scalable architecture for future growth

✓ Comprehensive monitoring and logging

---

**End of Part 13**
# 38. UI/UX Functional Requirements

## 38.1 Module Overview

The Room-Bot Service platform shall provide a modern, responsive, intuitive, and consistent user experience across all supported devices.

The user interface shall prioritize:

- Simplicity
- Consistency
- Accessibility
- Readability
- Performance
- Ease of Navigation

The application shall follow the UI Design System defined in **UI_UX_DESIGN_SYSTEM.md**.

---

# 38.2 Design Principles

The interface shall follow these principles.

### Principle 1

Keep interfaces clean and uncluttered.

---

### Principle 2

Important information should be visible without excessive scrolling.

---

### Principle 3

Primary actions shall always be visually prominent.

---

### Principle 4

Use consistent colors, typography, spacing, and components throughout the application.

---

### Principle 5

Reduce the number of clicks required to complete common tasks.

---

### Principle 6

Provide immediate visual feedback for every user action.

---

# 38.3 Layout Standards

Every authenticated dashboard shall follow a consistent layout.

Layout Structure:

```
---------------------------------------------------------
| Sidebar | Top Navigation Bar                         |
|         |--------------------------------------------|
|         |                                            |
|         |               Main Content                 |
|         |                                            |
|         |                                            |
---------------------------------------------------------
```

Components:

- Left Sidebar
- Top Navigation Bar
- Main Content Area
- Footer (Optional)

The layout shall remain consistent across Student, Staff, and Administrator dashboards.

---

# 38.4 Sidebar Standards

The sidebar shall contain:

- Logo
- Navigation Menu
- Active Page Highlight
- User Profile Shortcut
- Logout Button

Requirements:

- Fixed position on desktop
- Collapsible on tablet
- Hidden behind hamburger menu on mobile

---

# 38.5 Top Navigation Bar

The top navigation bar shall display:

- Current Page Title
- Breadcrumb Navigation
- User Profile
- Logout Shortcut

Future versions may include:

- Notification Bell
- Global Search

---

# 38.6 Dashboard Cards

Summary cards shall follow a consistent design.

Each card shall contain:

- Icon
- Title
- Numeric Value
- Optional Trend Indicator

Cards shall maintain equal height and consistent spacing.

---

# 38.7 Forms

All forms shall follow a standardized structure.

Requirements:

- Label above input
- Required field indicator (*)
- Placeholder text where appropriate
- Validation messages below fields
- Primary action button
- Secondary cancel button (where applicable)

Buttons shall remain disabled until required validation passes where practical.

---

# 38.8 Tables

Tables shall support:

- Search
- Sorting
- Filtering
- Pagination
- Responsive Layout

Each table shall include:

- Header Row
- Alternating Row States (optional)
- Hover Effect
- Empty State
- Loading State

---

# 38.9 Buttons

Button hierarchy:

### Primary

Used for:

- Submit
- Save
- Login
- Create Request

---

### Secondary

Used for:

- Cancel
- Back
- Close

---

### Danger

Used for:

- Block User
- Delete (Future)
- Permanent Actions

Buttons shall display loading indicators during asynchronous operations.

---

# 38.10 Status Indicators

Request statuses shall use consistent visual indicators.

| Status | Visual Style |
|---------|--------------|
| Assigned | Blue Badge |
| In Progress | Orange Badge |
| Completed | Green Badge |
| Cancelled | Red Badge |
| Pending Assignment | Gray Badge |

Status colors shall remain consistent across all screens.

---

# 38.11 Feedback Messages

The application shall display clear feedback after every important action.

Examples:

Success

```
Service request submitted successfully.
```

Error

```
Unable to submit request.
Please try again.
```

Warning

```
Your OTP will expire in 2 minutes.
```

Information

```
No pending requests found.
```

---

# 38.12 Loading States

Loading indicators shall be displayed whenever data is being retrieved.

Examples:

- Loading Dashboard...
- Loading Requests...
- Loading Complaints...
- Loading Analytics...

Skeleton loaders are recommended for dashboard cards and tables.

---

# 38.13 Empty States

Every page shall display meaningful empty states.

Examples:

No Requests

```
You haven't submitted any service requests yet.
```

No Complaints

```
No complaints found.
```

No Feedback

```
Feedback will appear here after completed requests.
```

Each empty state should include an illustration or icon and, where appropriate, a clear call-to-action.

---

# 38.14 Responsive Design

Desktop (≥1200px)

- Full sidebar
- Multi-column dashboard
- Maximum information density

Tablet (768px–1199px)

- Collapsible sidebar
- Responsive cards
- Reduced spacing

Mobile (<768px)

- Hamburger menu
- Single-column layout
- Touch-friendly controls
- Larger tap targets

No feature shall be unavailable due to screen size.

---

# 38.15 Accessibility

The application shall comply with accessibility best practices.

Requirements:

- Keyboard navigation
- Visible focus indicators
- Accessible labels
- Semantic HTML
- High contrast support
- Screen reader compatibility

Interactive elements shall remain accessible without using a mouse.

---

# 38.16 Theme Requirements

Version 1.0 shall support:

- Light Theme (Default)

Future versions may support:

- Dark Theme
- Custom Themes

The design system shall be prepared for theme expansion.

---

# 38.17 Branding Guidelines

The application shall maintain consistent branding.

Requirements:

- Consistent logo placement
- Uniform typography
- Consistent spacing
- Standard icon style
- Professional color palette

The interface shall reflect a modern SaaS application rather than a traditional academic project.

---

# 38.18 Animation Guidelines

Animations shall improve usability without distracting users.

Recommended animations:

- Page transitions
- Card hover effects
- Button loading states
- Modal appearance
- Toast notifications

Animation duration should generally remain between:

150 ms – 300 ms

Animations shall not delay user interactions.

---

# 38.19 UI/UX Success Criteria

The UI/UX implementation shall be considered complete when:

✓ Navigation is intuitive.

✓ All layouts are responsive.

✓ Forms are consistent.

✓ Tables support search and filtering.

✓ Status indicators remain consistent.

✓ Loading, empty, and error states are implemented.

✓ Accessibility requirements are met.

✓ Visual branding is consistent.

✓ User interactions are smooth and responsive.

✓ The overall experience reflects a production-quality SaaS application.

---

**End of Part 14**
# 39. Acceptance Criteria

## 39.1 Purpose

Acceptance Criteria define the conditions that must be satisfied before a feature, module, or the entire Room-Bot Service platform is considered complete.

These criteria provide a common understanding between:

- Product Owner
- Developers
- QA Engineers
- Future Contributors

Every requirement described in this PRD shall have corresponding acceptance criteria.

---

# 39.2 Project-Level Acceptance Criteria

The Room-Bot Service platform shall be accepted only if all of the following conditions are satisfied.

### Functional

✓ Student registration works correctly.

✓ Staff registration works correctly.

✓ Administrator login works correctly.

✓ Email OTP verification functions correctly.

✓ Password reset functions correctly.

✓ Students can create service requests.

✓ Automatic staff assignment functions according to business rules.

✓ Staff members can update request status.

✓ OTP verification securely completes requests.

✓ Students can submit complaints.

✓ Students can submit feedback only after successful completion.

✓ Administrators can manage students and staff.

✓ Analytics display accurate information.

✓ Notifications are generated for all required events.

---

### Security

✓ Passwords are stored only as bcrypt hashes.

✓ Protected APIs require valid JWT authentication.

✓ Role-based authorization is enforced.

✓ Blocked users cannot access the application.

✓ OTP expiration is enforced.

✓ Sensitive information is never exposed.

---

### Performance

✓ Login completes within acceptable response time.

✓ Dashboard loads within defined limits.

✓ API responses satisfy performance targets.

✓ Large request lists support pagination.

---

### Reliability

✓ No duplicate requests are created.

✓ No duplicate feedback submissions occur.

✓ Database transactions preserve consistency.

✓ Request history is retained.

---

### Usability

✓ Responsive layout functions correctly.

✓ Navigation remains consistent.

✓ Forms display validation messages.

✓ Loading and error states are implemented.

✓ Empty states provide meaningful guidance.

---

# 39.3 Authentication Acceptance Criteria

The Authentication Module shall be accepted when:

| ID | Acceptance Criterion |
|----|----------------------|
| AC-AUTH-001 | Student registration succeeds with valid information. |
| AC-AUTH-002 | Duplicate email registration is rejected. |
| AC-AUTH-003 | Invalid passwords are rejected. |
| AC-AUTH-004 | OTP verification activates accounts. |
| AC-AUTH-005 | Unverified accounts cannot login. |
| AC-AUTH-006 | JWT is generated after successful login. |
| AC-AUTH-007 | Expired JWT prevents API access. |
| AC-AUTH-008 | Password reset completes successfully. |

---

# 39.4 Student Module Acceptance Criteria

| ID | Acceptance Criterion |
|----|----------------------|
| AC-STU-001 | Student dashboard loads successfully. |
| AC-STU-002 | Student statistics are accurate. |
| AC-STU-003 | Students can create valid service requests. |
| AC-STU-004 | Invalid service requests are rejected. |
| AC-STU-005 | Duplicate active requests are prevented. |
| AC-STU-006 | Complaint submission functions correctly. |
| AC-STU-007 | History displays all student requests. |
| AC-STU-008 | Feedback is available only after completion. |

---

# 39.5 Staff Module Acceptance Criteria

| ID | Acceptance Criterion |
|----|----------------------|
| AC-STAFF-001 | Assigned requests are displayed correctly. |
| AC-STAFF-002 | Staff can start work. |
| AC-STAFF-003 | Status updates follow valid transitions. |
| AC-STAFF-004 | OTP verification completes requests securely. |
| AC-STAFF-005 | Completed work appears in history. |
| AC-STAFF-006 | Staff ratings update automatically. |

---

# 39.6 Administrator Module Acceptance Criteria

| ID | Acceptance Criterion |
|----|----------------------|
| AC-ADMIN-001 | Administrator dashboard loads correctly. |
| AC-ADMIN-002 | Student management functions correctly. |
| AC-ADMIN-003 | Staff management functions correctly. |
| AC-ADMIN-004 | Complaint management functions correctly. |
| AC-ADMIN-005 | Analytics display accurate metrics. |
| AC-ADMIN-006 | Blocking and unblocking users functions correctly. |
| AC-ADMIN-007 | Audit logs record administrator actions. |

---

# 39.7 Notification Acceptance Criteria

| ID | Acceptance Criterion |
|----|----------------------|
| AC-NOTIFY-001 | Registration OTP emails are delivered. |
| AC-NOTIFY-002 | Password reset OTP emails are delivered. |
| AC-NOTIFY-003 | Work completion OTP emails are delivered. |
| AC-NOTIFY-004 | Complaint notifications are sent correctly. |
| AC-NOTIFY-005 | Delivery failures are retried automatically. |

---

# 39.8 Validation Acceptance Criteria

| ID | Acceptance Criterion |
|----|----------------------|
| AC-VAL-001 | Required fields are validated. |
| AC-VAL-002 | Invalid input is rejected. |
| AC-VAL-003 | Duplicate records are prevented. |
| AC-VAL-004 | User-friendly error messages are displayed. |
| AC-VAL-005 | Standard HTTP status codes are returned. |

---

# 39.9 Non-Functional Acceptance Criteria

| ID | Acceptance Criterion |
|----|----------------------|
| AC-NFR-001 | Application meets performance targets. |
| AC-NFR-002 | Responsive design functions across supported devices. |
| AC-NFR-003 | Accessibility requirements are satisfied. |
| AC-NFR-004 | APIs remain secure under normal usage. |
| AC-NFR-005 | Application supports future scalability. |

---

# 39.10 Test Readiness Checklist

Before User Acceptance Testing (UAT), the following shall be verified.

### Functional Testing

- All features implemented
- No blocking defects
- APIs tested
- Database validated

---

### Security Testing

- Authentication tested
- Authorization tested
- JWT validation tested
- SQL Injection protection verified
- XSS protection verified

---

### UI Testing

- Responsive layouts verified
- Cross-browser testing completed
- Loading states verified
- Empty states verified

---

### Integration Testing

- Email service integrated
- Database integration verified
- Authentication integrated
- Notification workflows validated

---

# 39.11 User Acceptance Testing (UAT)

The system shall undergo User Acceptance Testing before production deployment.

Representative users shall verify:

- Student workflows
- Staff workflows
- Administrator workflows

All critical issues identified during UAT shall be resolved before release.

---

# 39.12 Release Readiness Checklist

The application shall be considered ready for production when:

✓ All acceptance criteria are satisfied.

✓ No Critical severity defects remain.

✓ No High severity defects remain.

✓ Database migrations succeed.

✓ Environment variables are configured.

✓ Production build completes successfully.

✓ Documentation is complete.

✓ Code review is completed.

✓ Security review is completed.

✓ Product Owner approves the release.

---

# 39.13 Acceptance Criteria Success

This PRD shall be considered successfully implemented when:

- Every functional requirement has been delivered.
- Every acceptance criterion has passed.
- The application demonstrates production-quality behavior.
- All stakeholders formally approve the implementation.

---

**End of Part 15**
# 40. User Stories and Requirement Traceability

## 40.1 Purpose

This chapter captures the major user stories for each user role and establishes traceability between business needs, functional requirements, implementation, and testing.

The objectives are:

- Understand user expectations
- Guide development priorities
- Support QA testing
- Improve requirement traceability
- Simplify future maintenance

Each user story follows the format:

> **As a** <user role>  
> **I want** <goal>  
> **So that** <benefit>

---

# 40.2 Student User Stories

### US-STU-001

**As a Student**

I want to register using my university email

So that I can securely access the hostel service platform.

---

### US-STU-002

**As a Student**

I want to verify my email using an OTP

So that unauthorized users cannot create accounts using my email address.

---

### US-STU-003

**As a Student**

I want to login securely

So that I can access my dashboard and hostel services.

---

### US-STU-004

**As a Student**

I want to create service requests

So that maintenance problems can be resolved without visiting the hostel office.

---

### US-STU-005

**As a Student**

I want to view the status of my requests

So that I know the current progress of my maintenance requests.

---

### US-STU-006

**As a Student**

I want to cancel eligible requests

So that I can stop unnecessary maintenance work before it begins.

---

### US-STU-007

**As a Student**

I want to submit complaints

So that hostel management can address non-maintenance issues.

---

### US-STU-008

**As a Student**

I want to provide feedback

So that service quality can continuously improve.

---

# 40.3 Staff User Stories

### US-STAFF-001

**As a Staff Member**

I want to login securely

So that I can access my assigned work.

---

### US-STAFF-002

**As a Staff Member**

I want to view assigned requests

So that I know what work has been allocated to me.

---

### US-STAFF-003

**As a Staff Member**

I want to update request status

So that students receive accurate progress updates.

---

### US-STAFF-004

**As a Staff Member**

I want to verify completion using OTP

So that completed work is confirmed by the student.

---

### US-STAFF-005

**As a Staff Member**

I want to view my ratings

So that I can understand my service performance.

---

# 40.4 Administrator User Stories

### US-ADMIN-001

**As an Administrator**

I want to monitor all users

So that hostel operations remain organized.

---

### US-ADMIN-002

**As an Administrator**

I want to manage students

So that unauthorized or inactive accounts can be controlled.

---

### US-ADMIN-003

**As an Administrator**

I want to manage staff

So that hostel services operate efficiently.

---

### US-ADMIN-004

**As an Administrator**

I want to monitor complaints

So that student concerns are addressed promptly.

---

### US-ADMIN-005

**As an Administrator**

I want to view analytics

So that I can evaluate hostel service performance.

---

# 40.5 Requirement Traceability Matrix

The following matrix links business requirements to implementation and testing.

| Requirement ID | Feature | Module | Acceptance Criteria |
|----------------|---------|--------|---------------------|
| REQ-AUTH-001 | Student Registration | Authentication | AC-AUTH-001 |
| REQ-AUTH-006 | OTP Verification | Authentication | AC-AUTH-004 |
| REQ-SER-001 | Service Request Creation | Student Module | AC-STU-003 |
| REQ-SER-010 | Duplicate Prevention | Student Module | AC-STU-005 |
| REQ-CMP-001 | Complaint Submission | Complaint Module | AC-STU-006 |
| REQ-FDB-004 | Single Feedback Submission | Feedback Module | AC-STU-008 |
| BR-010 | OTP Completion Rule | Lifecycle | AC-STAFF-004 |
| BR-015 | Request Cancellation Rule | Lifecycle | AC-STU-005 |
| BR-018 | Authenticated Actions | Security | AC-NFR-004 |

Every future requirement shall be added to this matrix to preserve traceability.

---

# 40.6 Feature Priority

The implementation priority for Version 1.0 is defined below.

## High Priority (Must Have)

- Authentication
- Student Dashboard
- Staff Dashboard
- Administrator Dashboard
- Service Requests
- Complaint Module
- OTP Verification
- Automatic Assignment
- Feedback
- Notifications

---

## Medium Priority (Should Have)

- Analytics
- Advanced Search
- Filtering
- Pagination
- Audit Logs
- Enhanced Reporting

---

## Low Priority (Could Have)

- Dark Theme
- Push Notifications
- Mobile Application
- AI-Based Prioritization
- Image Uploads
- Multi-Language Support

Low-priority features are outside the scope of Version 1.0 unless explicitly approved.

---

# 40.7 Out of Scope for Version 1.0

The following features shall not be included in the initial release.

- Live Chat
- Video Calling
- Voice Notifications
- Social Login
- QR Code Based Authentication
- AI Chatbot Support
- Mobile Applications
- Offline Mode
- Multi-University Support

These features may be considered in future releases.

---

# 40.8 Requirement Change Management

All requirement changes shall follow the process below.

1. Requirement Proposed
2. Impact Analysis
3. Product Owner Review
4. Approval or Rejection
5. Documentation Update
6. Development Implementation
7. Testing
8. Release

No approved requirement shall be modified without updating this PRD.

---

# 40.9 Traceability Success Criteria

Requirement traceability shall be considered complete when:

✓ Every major feature has at least one user story.

✓ Every critical requirement maps to an acceptance criterion.

✓ Requirements can be traced from business need to implementation.

✓ Future requirement changes can be managed without ambiguity.

✓ Development and QA teams can identify feature coverage using this document.

---

**End of Part 16**
# 41. Glossary, References and Appendices

## 41.1 Purpose

This chapter provides common definitions, abbreviations, assumptions, constraints, dependencies, reference documents, and appendices used throughout the Room-Bot Service Product Requirements Document.

Its purpose is to ensure all stakeholders interpret requirements consistently.

---

# 41.2 Glossary

| Term | Definition |
|------|------------|
| Administrator | User responsible for managing the complete system. |
| Student | Hostel resident who creates service requests and complaints. |
| Staff | Hostel employee responsible for completing assigned maintenance tasks. |
| Warden | Staff member responsible for handling complaints. |
| Service Request | A maintenance request submitted by a student. |
| Complaint | A non-maintenance issue submitted by a student. |
| Dashboard | Main page displayed after successful login. |
| OTP | One-Time Password used for verification. |
| JWT | JSON Web Token used for secure authentication. |
| Request Lifecycle | Complete journey of a request from creation to completion. |
| Assignment Algorithm | Backend logic used to automatically assign requests to staff. |
| Feedback | Rating and optional comment submitted by students after request completion. |
| Audit Log | Permanent record of administrator actions. |
| Active Request | Request currently in Assigned or In Progress status. |
| Pending Assignment | Request awaiting assignment because no eligible staff is available. |

---

# 41.3 Abbreviations

| Abbreviation | Meaning |
|-------------|---------|
| PRD | Product Requirements Document |
| UI | User Interface |
| UX | User Experience |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| OTP | One-Time Password |
| RBAC | Role-Based Access Control |
| SMTP | Simple Mail Transfer Protocol |
| CRUD | Create, Read, Update, Delete |
| REST | Representational State Transfer |
| HTTP | Hypertext Transfer Protocol |
| HTTPS | Hypertext Transfer Protocol Secure |
| DB | Database |
| SQL | Structured Query Language |
| QA | Quality Assurance |
| UAT | User Acceptance Testing |
| CI | Continuous Integration |
| CD | Continuous Deployment |

---

# 41.4 Assumptions

The following assumptions apply to Version 1.0.

### A-001

Every student has a valid university email address.

---

### A-002

Every hostel block has at least one assigned warden.

---

### A-003

Students belong to exactly one hostel block.

---

### A-004

Staff belong to exactly one hostel block.

---

### A-005

Each staff member has exactly one primary service role.

---

### A-006

Students have internet access while using the platform.

---

### A-007

SMTP email service is available for OTP delivery.

---

### A-008

The PostgreSQL database is available and properly configured.

---

### A-009

System clocks on the server remain synchronized to ensure accurate OTP expiration and timestamps.

---

# 41.5 Constraints

Version 1.0 includes the following constraints.

- Web application only.
- English language only.
- Single predefined administrator account.
- No mobile application.
- No image upload support.
- No push notifications.
- No social login.
- No offline mode.

These constraints may be removed in future releases.

---

# 41.6 Dependencies

The successful operation of the application depends upon:

## Backend

- Node.js
- Express.js

---

## Frontend

- React
- Tailwind CSS

---

## Database

- PostgreSQL

---

## Authentication

- JWT
- bcrypt

---

## Email

- Nodemailer
- SMTP Provider

---

## Deployment

- Docker
- GitHub

---

Future AI modules may additionally depend on Python-based services.

---

# 41.7 External References

The following standards and references should be considered during implementation.

### REST API Design

REST architectural principles.

---

### HTTP Status Codes

RFC 9110

---

### JSON Web Tokens

RFC 7519

---

### OWASP

OWASP Top 10 Web Application Security Risks.

---

### PostgreSQL Documentation

Official PostgreSQL documentation.

---

### React Documentation

Official React documentation.

---

### Express.js Documentation

Official Express.js documentation.

---

# 41.8 Supporting Documents

This PRD should be read together with the following project documents.

| Document ID | Document |
|-------------|----------|
| RBS-DOC-001 | Project Overview |
| RBS-DOC-003 | UI/UX Design System |
| RBS-DOC-004 | System Architecture |
| RBS-DOC-005 | Database Design |
| RBS-DOC-006 | Authentication & Security |
| RBS-DOC-007 | Business Logic & Workflows |
| RBS-DOC-008 | API Specification |
| RBS-DOC-009 | Frontend Architecture |
| RBS-DOC-010 | Backend Architecture |
| RBS-DOC-011 | Notification & Email System |
| RBS-DOC-012 | Testing & Edge Cases |
| RBS-DOC-013 | Deployment Guide |
| RBS-DOC-014 | Codex Implementation Tasks |
| RBS-DOC-015 | Acceptance Checklist |
| RBS-DOC-016 | Project Rules |
| RBS-DOC-017 | README |

---

# 41.9 Appendix A — Request Status Definitions

| Status | Description |
|--------|-------------|
| Pending Assignment | Awaiting staff assignment because no eligible staff is available. |
| Assigned | Staff member assigned; work has not started. |
| In Progress | Staff has started working. |
| Completed | Work completed and OTP successfully verified. |
| Cancelled | Request cancelled before work began. |

---

# 41.10 Appendix B — Complaint Status Definitions

| Status | Description |
|--------|-------------|
| Submitted | Complaint successfully created. |
| Under Review | Warden or administrator is reviewing the complaint. |
| Resolved | Issue addressed by hostel management. |
| Closed | Complaint officially closed with no further action required. |

---

# 41.11 Appendix C — Priority Levels

| Priority | Description |
|----------|-------------|
| Low | Minor issue with no immediate impact. |
| Medium | Standard maintenance request. |
| High | Urgent issue requiring prompt attention. |

Priority is informational in Version 1.0 and does not affect automatic assignment.

---

# 41.12 Appendix D — Document Maintenance

This Product Requirements Document shall be maintained throughout the project lifecycle.

Any modification shall include:

- Version Number
- Revision Date
- Author
- Summary of Changes
- Approval (if required)

Older versions shall be archived for historical reference.

---

# 41.13 Glossary and Appendix Success Criteria

This reference section shall be considered complete when:

✓ All technical terms are defined.

✓ Common abbreviations are documented.

✓ Assumptions are explicitly stated.

✓ Project constraints are identified.

✓ Dependencies are documented.

✓ Supporting documents are referenced.

✓ Appendices provide additional clarification where required.

---

**End of Part 17**
# 42. Implementation Roadmap

## 42.1 Purpose

This roadmap provides the recommended implementation sequence for the Room-Bot Service platform.

The objective is to build the project incrementally while ensuring each module is stable before proceeding to the next.

---

# 42.2 Development Phases

## Phase 1 — Project Foundation

Objectives:

- Initialize repository
- Configure React
- Configure Express.js
- Configure PostgreSQL
- Configure Docker
- Configure environment variables
- Establish project structure

Deliverables:

- Working frontend
- Working backend
- Database connection
- Base routing
- Shared coding standards

---

## Phase 2 — Authentication

Objectives:

- Student Registration
- Staff Registration
- Administrator Login
- Email OTP
- JWT Authentication
- Forgot Password
- Password Reset

Exit Criteria:

- Secure authentication completed
- Role-based authorization functional
- Protected APIs operational

---

## Phase 3 — Student Module

Objectives:

- Student Dashboard
- Service Requests
- Complaint Module
- Request History
- Feedback Module

Exit Criteria:

- Students can complete all primary workflows successfully.

---

## Phase 4 — Staff Module

Objectives:

- Staff Dashboard
- Pending Requests
- Status Updates
- OTP Verification
- Work History
- Feedback Overview

Exit Criteria:

- Staff can process assigned requests from start to completion.

---

## Phase 5 — Administrator Module

Objectives:

- Dashboard
- Student Management
- Staff Management
- Request Monitoring
- Complaint Monitoring
- Analytics
- Audit Logs

Exit Criteria:

- Complete administrative functionality implemented.

---

## Phase 6 — Integration & Testing

Objectives:

- Module Integration
- API Testing
- Security Testing
- Performance Testing
- User Acceptance Testing
- Bug Fixes

Exit Criteria:

- All acceptance criteria satisfied.

---

## Phase 7 — Production Deployment

Objectives:

- Production Build
- Docker Deployment
- Database Migration
- Environment Configuration
- Monitoring
- Release Verification

Exit Criteria:

- Stable production deployment.

---

# 42.3 Project Milestones

| Milestone | Description |
|-----------|-------------|
| M1 | Project Foundation Complete |
| M2 | Authentication Complete |
| M3 | Student Module Complete |
| M4 | Staff Module Complete |
| M5 | Administrator Module Complete |
| M6 | Integration Testing Complete |
| M7 | User Acceptance Testing Complete |
| M8 | Production Release |

Each milestone shall be reviewed before progressing to the next.

---

# 42.4 Risk Summary

The following risks have been identified.

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email service failure | High | Retry mechanism and monitoring |
| Database outage | High | Backups and recovery procedures |
| Unauthorized access | High | JWT, RBAC, secure coding practices |
| Poor data quality | Medium | Backend validation |
| Performance degradation | Medium | Database indexing and monitoring |
| Future requirement changes | Medium | Modular architecture and documentation |

Risk assessments shall be reviewed periodically throughout development.

---

# 42.5 Future Roadmap

The following enhancements are planned for future versions.

## Version 1.1

- Image attachments for service requests
- Student profile editing
- In-app notifications
- Enhanced analytics

---

## Version 1.2

- Dark Theme
- Push Notifications
- Mobile Responsive Enhancements
- Advanced Reporting

---

## Version 2.0

- Mobile Applications
- AI-Based Request Prioritization
- Image-Based Issue Detection
- Predictive Maintenance
- Multi-University Support
- Multi-Language Support

These features are outside the scope of Version 1.0.

---

# 42.6 Document Governance

This Product Requirements Document is a controlled project document.

All future revisions shall:

- Receive a new version number.
- Include a revision summary.
- Identify the author.
- Record the revision date.
- Be approved before implementation.

Unapproved modifications shall not be considered official project requirements.

---

# 42.7 Document Ownership

Product Owner:

Meet

Software Architect:

ChatGPT

Implementation Team:

Development Team

Quality Assurance:

QA Team

Final approval remains the responsibility of the Product Owner.

---

# 42.8 Final Approval Checklist

Before implementation begins, verify:

✓ Project Scope Approved

✓ Business Rules Approved

✓ Authentication Requirements Approved

✓ Student Module Approved

✓ Staff Module Approved

✓ Administrator Module Approved

✓ Database Design Approved

✓ API Design Approved

✓ UI/UX Requirements Approved

✓ Security Requirements Approved

✓ Acceptance Criteria Approved

✓ Implementation Roadmap Approved

---

# 42.9 PRD Completion Statement

This Product Requirements Document defines the complete functional and non-functional requirements for Version 1.0 of the Room-Bot Service platform.

The document provides:

- Business objectives
- User roles
- Functional requirements
- Non-functional requirements
- Business rules
- User workflows
- Validation rules
- Security requirements
- UI/UX standards
- Acceptance criteria
- User stories
- Implementation roadmap

Together, these requirements establish a single, authoritative specification for the design, development, testing, deployment, and maintenance of the Room-Bot Service platform.

All implementation decisions shall align with this document unless superseded by an approved revision.

---

# 42.10 Formal Sign-Off

| Role | Name | Status |
|------|------|--------|
| Product Owner | Meet | Pending Approval |
| Software Architect | ChatGPT | Approved (Specification Complete) |
| Development Team | Pending | Pending |
| Quality Assurance | Pending | Pending |

Implementation shall begin only after the Product Owner approves the finalized requirements.

---

# End of Document

**Document Name:** Product Requirements Document (PRD)

**Project:** Room-Bot Service

**Document ID:** RBS-DOC-002

**Version:** 1.0

**Status:** Complete

```
This marks the completion of the official
Room-Bot Service Product Requirements Document.
```