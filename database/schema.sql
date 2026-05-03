-- ============================================================
-- FreshCart Grocery Platform — MySQL Schema
-- Version: 1.0.0
-- Generated: 2026-05-02
-- ============================================================

CREATE DATABASE IF NOT EXISTS grocery_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE grocery_platform;

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(100)    DEFAULT NULL,
  last_name     VARCHAR(100)    DEFAULT NULL,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL COMMENT 'bcrypt hash',
  role          ENUM('super_admin','editor') NOT NULL DEFAULT 'editor',
  role_id       INT UNSIGNED    DEFAULT NULL,
  avatar_url    VARCHAR(500)    DEFAULT NULL,
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  last_login    DATETIME        DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE INDEX idx_admins_email (email),
  CONSTRAINT fk_admins_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: login_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  email         VARCHAR(255) PRIMARY KEY,
  attempts      INT DEFAULT 0,
  locked_until  DATETIME DEFAULT NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: merchants
-- ============================================================
CREATE TABLE IF NOT EXISTS merchants (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  store_name      VARCHAR(200)    NOT NULL,
  business_type   ENUM('Grocery Store','Supermarket','Pharmacy','Bakery','Dairy & Milk','Fruits & Vegetables','Meat & Fish','Other') NOT NULL,
  gstin           VARCHAR(15)     DEFAULT NULL,
  pan             VARCHAR(10)     DEFAULT NULL,
  years_in_biz    ENUM('Less than 1 year','1-3 years','3-5 years','5-10 years','10+ years') DEFAULT NULL,
  owner_name      VARCHAR(150)    NOT NULL,
  mobile          VARCHAR(15)     NOT NULL,
  email           VARCHAR(255)    NOT NULL,
  id_proof_url    VARCHAR(500)    DEFAULT NULL,
  address_line1   VARCHAR(300)    NOT NULL,
  address_line2   VARCHAR(300)    DEFAULT NULL,
  city            VARCHAR(100)    NOT NULL,
  state           VARCHAR(100)    NOT NULL,
  pin_code        VARCHAR(6)      NOT NULL,
  open_from       TIME            DEFAULT '08:00:00',
  open_to         TIME            DEFAULT '22:00:00',
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  rejection_note  TEXT            DEFAULT NULL,
  reviewed_by     INT UNSIGNED    DEFAULT NULL,
  reviewed_at     DATETIME        DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_merchants_status (status),
  INDEX idx_merchants_city (city),
  CONSTRAINT fk_merchants_reviewer FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: delivery_partners
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_partners (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)    NOT NULL,
  mobile          VARCHAR(15)     NOT NULL,
  email           VARCHAR(255)    DEFAULT NULL,
  city            VARCHAR(100)    NOT NULL,
  vehicle_type    ENUM('Bike','Scooter','Bicycle','Car') NOT NULL,
  status          ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
  rejection_note  TEXT            DEFAULT NULL,
  reviewed_by     INT UNSIGNED    DEFAULT NULL,
  reviewed_at     DATETIME        DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_dp_status (status),
  INDEX idx_dp_city (city),
  CONSTRAINT fk_dp_reviewer FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200)    NOT NULL,
  department      ENUM('Engineering','Operations','Logistics','Marketing','HR','Finance','Customer Support') NOT NULL,
  location        VARCHAR(150)    NOT NULL,
  job_type        ENUM('Full-time','Part-time','Contract','Remote') NOT NULL DEFAULT 'Full-time',
  description     TEXT            NOT NULL,
  requirements    TEXT            DEFAULT NULL,
  deadline        DATE            DEFAULT NULL,
  status          ENUM('draft','active','closed') NOT NULL DEFAULT 'draft',
  posted_by       INT UNSIGNED    DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_jobs_status (status),
  CONSTRAINT fk_jobs_poster FOREIGN KEY (posted_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: contact_inquiries
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)    NOT NULL,
  email           VARCHAR(255)    NOT NULL,
  phone           VARCHAR(15)     DEFAULT NULL,
  subject         VARCHAR(300)    DEFAULT NULL,
  message         TEXT            NOT NULL,
  is_bot          BOOLEAN         NOT NULL DEFAULT FALSE,
  status          ENUM('unread','read','replied') NOT NULL DEFAULT 'unread',
  replied_by      INT UNSIGNED    DEFAULT NULL,
  replied_at      DATETIME        DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_ci_status (status),
  INDEX idx_ci_created (created_at),
  CONSTRAINT fk_ci_replier FOREIGN KEY (replied_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: admin_activity_log
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id        INT UNSIGNED    NOT NULL,
  action          VARCHAR(100)    NOT NULL COMMENT 'e.g. approved_merchant, deleted_job',
  target_type     VARCHAR(50)     DEFAULT NULL COMMENT 'e.g. merchant, job, delivery_partner',
  target_id       INT UNSIGNED    DEFAULT NULL,
  ip_address      VARCHAR(45)     DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_log_admin (admin_id),
  CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;
