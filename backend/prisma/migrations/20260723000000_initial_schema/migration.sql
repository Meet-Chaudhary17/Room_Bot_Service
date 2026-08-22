-- Initial Room-Bot Service schema. Application lifecycle validation is enforced in services.
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'STAFF', 'ADMINISTRATOR');
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'COMPLETION');
CREATE TYPE "ServiceRole" AS ENUM ('CLEANING', 'ELECTRICAL_MAINTENANCE', 'PLUMBING', 'AC_MAINTENANCE', 'FURNITURE_REPAIR');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH');
CREATE TYPE "NotificationType" AS ENUM ('AUTHENTICATION', 'SERVICE_REQUEST', 'COMPLAINT', 'FEEDBACK', 'SYSTEM');

CREATE TABLE "hostel_block" (
  "id" SERIAL PRIMARY KEY, "block_name" VARCHAR(20) NOT NULL UNIQUE, "description" VARCHAR(200),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "student" (
  "id" SERIAL PRIMARY KEY, "registration_number" VARCHAR(30) NOT NULL UNIQUE, "full_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) NOT NULL UNIQUE, "phone_number" VARCHAR(20), "room_number" VARCHAR(20) NOT NULL,
  "block_id" INTEGER NOT NULL, "is_blocked" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "staff" (
  "id" SERIAL PRIMARY KEY, "full_name" VARCHAR(100) NOT NULL, "email" VARCHAR(150) NOT NULL UNIQUE,
  "service_role" "ServiceRole" NOT NULL, "block_id" INTEGER NOT NULL, "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "administrator" (
  "id" SERIAL PRIMARY KEY, "username" VARCHAR(50) NOT NULL UNIQUE, "full_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) UNIQUE, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "account_credentials" (
  "id" SERIAL PRIMARY KEY, "user_type" "UserType" NOT NULL, "user_id" INTEGER NOT NULL,
  "email" VARCHAR(150) NOT NULL UNIQUE, "password_hash" VARCHAR(255) NOT NULL,
  "email_verified" BOOLEAN NOT NULL DEFAULT false, "last_password_change" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "account_credentials_user_type_user_id_key" UNIQUE ("user_type", "user_id")
);
CREATE TABLE "otp_verification" (
  "id" SERIAL PRIMARY KEY, "user_type" "UserType" NOT NULL, "user_id" INTEGER NOT NULL,
  "otp_code" VARCHAR(10) NOT NULL, "purpose" "OtpPurpose" NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(3) NOT NULL, "verified_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "service_category" (
  "id" SERIAL PRIMARY KEY, "category_name" VARCHAR(50) NOT NULL UNIQUE, "service_role" "ServiceRole" NOT NULL UNIQUE,
  "description" VARCHAR(200), "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "service_request" (
  "id" SERIAL PRIMARY KEY, "student_id" INTEGER NOT NULL, "category_id" INTEGER NOT NULL, "assigned_staff_id" INTEGER,
  "title" VARCHAR(150) NOT NULL, "description" TEXT NOT NULL, "room_number" VARCHAR(20) NOT NULL,
  "request_status" "RequestStatus" NOT NULL DEFAULT 'PENDING', "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
  "assigned_at" TIMESTAMP(3), "completed_at" TIMESTAMP(3), "cancelled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "complaint_category" (
  "id" SERIAL PRIMARY KEY, "category_name" VARCHAR(50) NOT NULL UNIQUE, "description" VARCHAR(200),
  "is_active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "complaint" (
  "id" SERIAL PRIMARY KEY, "student_id" INTEGER NOT NULL, "category_id" INTEGER NOT NULL, "title" VARCHAR(150) NOT NULL,
  "description" TEXT NOT NULL, "complaint_status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
  "priority" "Priority" NOT NULL DEFAULT 'NORMAL', "resolved_by" INTEGER, "resolution_notes" TEXT,
  "resolved_at" TIMESTAMP(3), "closed_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "feedback" (
  "id" SERIAL PRIMARY KEY, "request_id" INTEGER NOT NULL UNIQUE, "student_id" INTEGER NOT NULL, "staff_id" INTEGER NOT NULL,
  "rating" INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5), "comments" TEXT,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "audit_log" (
  "id" SERIAL PRIMARY KEY, "administrator_id" INTEGER NOT NULL, "action" VARCHAR(100) NOT NULL,
  "target_table" VARCHAR(50) NOT NULL, "target_record_id" INTEGER, "description" TEXT, "ip_address" VARCHAR(45),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "notification" (
  "id" SERIAL PRIMARY KEY, "user_id" INTEGER NOT NULL, "role" "UserType" NOT NULL, "title" VARCHAR(150) NOT NULL,
  "message" TEXT NOT NULL, "type" "NotificationType" NOT NULL, "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "student" ADD CONSTRAINT "student_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "hostel_block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff" ADD CONSTRAINT "staff_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "hostel_block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_request" ADD CONSTRAINT "service_request_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "complaint_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "administrator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "service_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "administrator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "student_block_id_idx" ON "student"("block_id");
CREATE INDEX "staff_block_id_idx" ON "staff"("block_id");
CREATE INDEX "staff_service_role_idx" ON "staff"("service_role");
CREATE INDEX "account_credentials_user_id_idx" ON "account_credentials"("user_id");
CREATE INDEX "otp_verification_user_id_idx" ON "otp_verification"("user_id");
CREATE INDEX "otp_verification_expires_at_idx" ON "otp_verification"("expires_at");
CREATE INDEX "otp_verification_user_type_user_id_purpose_idx" ON "otp_verification"("user_type", "user_id", "purpose");
CREATE INDEX "service_request_student_id_idx" ON "service_request"("student_id");
CREATE INDEX "service_request_assigned_staff_id_idx" ON "service_request"("assigned_staff_id");
CREATE INDEX "service_request_request_status_idx" ON "service_request"("request_status");
CREATE INDEX "service_request_category_id_idx" ON "service_request"("category_id");
CREATE INDEX "service_request_created_at_idx" ON "service_request"("created_at");
CREATE INDEX "complaint_student_id_idx" ON "complaint"("student_id");
CREATE INDEX "complaint_complaint_status_idx" ON "complaint"("complaint_status");
CREATE INDEX "complaint_category_id_idx" ON "complaint"("category_id");
CREATE INDEX "complaint_resolved_by_idx" ON "complaint"("resolved_by");
CREATE INDEX "complaint_created_at_idx" ON "complaint"("created_at");
CREATE INDEX "feedback_staff_id_idx" ON "feedback"("staff_id");
CREATE INDEX "feedback_student_id_idx" ON "feedback"("student_id");
CREATE INDEX "feedback_submitted_at_idx" ON "feedback"("submitted_at");
CREATE INDEX "audit_log_administrator_id_idx" ON "audit_log"("administrator_id");
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");
CREATE INDEX "audit_log_target_table_idx" ON "audit_log"("target_table");
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");
CREATE INDEX "notification_role_user_id_is_read_idx" ON "notification"("role", "user_id", "is_read");
CREATE INDEX "notification_created_at_idx" ON "notification"("created_at");

