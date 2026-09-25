-- ============================================================
-- 1. Create the Users / Authentication Credentials Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. Create the Students Roster Profile Table
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. Create the Courses Catalog Table
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    credit_hour INT NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL
);

-- ============================================================
-- 4. Create the Protected View-Only Results Table
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
    course_code VARCHAR(20) REFERENCES courses(course_code) ON DELETE CASCADE,
    assignment NUMERIC(5, 2) DEFAULT 0.00,
    mid_exam NUMERIC(5, 2) DEFAULT 0.00,
    final_exam NUMERIC(5, 2) DEFAULT 0.00,
    total_mark NUMERIC(5, 2) DEFAULT 0.00,
    grade VARCHAR(5) NOT NULL,
    grade_point NUMERIC(3, 2) NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    published BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 5. Create the Broadcast Notifications Table
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    target VARCHAR(50) DEFAULT 'all', -- Can route to 'all' or a specific student_id
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
