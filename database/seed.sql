-- ============================================================
-- FreshCart Grocery Platform — Seed Data
-- ============================================================
USE grocery_platform;

-- ============================================================
-- ADMINS (password: Admin@2025! — bcrypt hash below)
-- ============================================================
INSERT INTO admins (name, email, password_hash, role, is_active, last_login) VALUES
('Rahul Sharma',   'admin@groceryapp.com',   '$2b$12$LJ3m5Zq8eX1kR0r4cWQaWOzq8K3bN5dS1uY7mA9pF2gH4jL6nO8vC', 'super_admin', TRUE, '2026-05-01 10:30:00'),
('Priya Menon',    'priya@groceryapp.com',   '$2b$12$aB3cD4eF5gH6iJ7kL8mN9OpQrStUvWxYz0123456789abcdefghij', 'editor',      TRUE, '2026-04-28 14:15:00'),
('Vikram Patel',   'vikram@groceryapp.com',  '$2b$12$xY9zW8vU7tS6rQ5pO4nM3lK2jI1hG0fE9dC8bA7654321zyxwvutsr', 'editor',      TRUE, '2026-04-25 09:00:00');

-- ============================================================
-- MERCHANTS
-- ============================================================
INSERT INTO merchants (store_name, business_type, gstin, pan, years_in_biz, owner_name, mobile, email, address_line1, city, state, pin_code, open_from, open_to, status, reviewed_by, reviewed_at) VALUES
('FreshMart Organics',    'Grocery Store',        '29ABCDE1234F1Z5', 'ABCDE1234F', '3-5 years',       'Amit Kumar',     '9876543210', 'amit@freshmart.in',    '45 MG Road, Koramangala',        'Bangalore', 'Karnataka', '560034', '07:00', '22:00', 'approved', 1, '2026-03-15 10:00:00'),
('MediCare Plus',         'Pharmacy',             '27FGHIJ5678K2Y3', 'FGHIJ5678K', '10+ years',       'Dr. Sunita Rao', '9123456780', 'sunita@medicare.in',   '12 Linking Road, Bandra',        'Mumbai',    'Maharashtra','400050', '08:00', '23:00', 'approved', 1, '2026-03-20 11:30:00'),
('Baker\'s Delight',      'Bakery',               '33LMNOP9012Q3X1', 'LMNOP9012Q', '1-3 years',       'Ravi Chandran',  '9988776655', 'ravi@bakersdelight.in','78 Anna Nagar Main Road',        'Chennai',   'Tamil Nadu', '600040', '06:00', '21:00', 'approved', 2, '2026-04-01 09:15:00'),
('Green Valley Veggies',  'Fruits & Vegetables',  '06RSTUV3456W4Z7', 'RSTUV3456W', 'Less than 1 year','Pooja Singh',    '9876012345', 'pooja@greenvalley.in', '23 Sector 15, Gurugram',         'Gurugram',  'Haryana',   '122001', '05:30', '20:00', 'pending',  NULL, NULL),
('Daily Dairy Hub',       'Dairy & Milk',          '29WXYZ7890A5B2', 'WXYZ7890AB', '5-10 years',      'Mahesh Gowda',   '9845123456', 'mahesh@dailydairy.in', '56 Jayanagar 4th Block',         'Bangalore', 'Karnataka', '560041', '05:00', '12:00', 'pending',  NULL, NULL),
('QuickBite Supermarket', 'Supermarket',          '27CDEFG1234H6I8', 'CDEFG1234H', '5-10 years',      'Neha Kapoor',    '9012345678', 'neha@quickbite.in',    '89 FC Road, Shivaji Nagar',      'Pune',      'Maharashtra','411005', '08:00', '22:00', 'rejected', 1, '2026-04-10 16:00:00'),
('Coastal Catch',         'Meat & Fish',          '32JKLMN5678O9P0', 'JKLMN5678O', '3-5 years',       'Faisal Ahmed',   '9567890123', 'faisal@coastalcatch.in','14 Beach Road, Calicut',        'Kozhikode', 'Kerala',    '673001', '06:00', '19:00', 'approved', 2, '2026-04-15 08:45:00');

-- ============================================================
-- DELIVERY PARTNERS
-- ============================================================
INSERT INTO delivery_partners (full_name, mobile, email, city, vehicle_type, status, reviewed_by, reviewed_at) VALUES
('Rajesh Kumar',      '9876543201', 'rajesh.k@gmail.com',   'Bangalore', 'Bike',    'active',   1, '2026-03-10 10:00:00'),
('Suresh Babu',       '9123456701', 'suresh.b@gmail.com',   'Bangalore', 'Scooter', 'active',   1, '2026-03-12 11:00:00'),
('Mohammed Irfan',    '9988776601', 'irfan.m@gmail.com',    'Mumbai',    'Bike',    'active',   2, '2026-03-15 09:30:00'),
('Deepak Sharma',     '9876012301', 'deepak.s@gmail.com',   'Pune',      'Bicycle', 'pending',  NULL, NULL),
('Karthik Naidu',     '9845123401', 'karthik.n@gmail.com',  'Chennai',   'Bike',    'active',   2, '2026-04-01 14:00:00'),
('Ankit Verma',       '9012345601', 'ankit.v@gmail.com',    'Gurugram',  'Scooter', 'pending',  NULL, NULL),
('Pradeep Joshi',     '9567890101', 'pradeep.j@gmail.com',  'Bangalore', 'Bike',    'rejected', 1, '2026-04-20 16:30:00'),
('Sanjay Patil',      '9234567801', 'sanjay.p@gmail.com',   'Mumbai',    'Car',     'active',   1, '2026-04-22 10:15:00');

-- ============================================================
-- JOBS
-- ============================================================
INSERT INTO jobs (title, department, location, job_type, description, requirements, deadline, status, posted_by) VALUES
('Senior React Developer',  'Engineering',       'Bangalore',  'Full-time', 'Build and scale our customer-facing web experiences with React, Next.js, and modern tooling.', 'Min 4 years React experience. TypeScript, Next.js, Tailwind CSS. Strong system design skills.', '2026-06-30', 'active', 1),
('Product Designer',         'Marketing',         'Remote',     'Full-time', 'Design delightful user experiences across our consumer app and merchant dashboard.', 'Figma/Sketch mastery. 3+ years product design. Portfolio required.', '2026-07-15', 'active', 1),
('Operations Manager',       'Operations',        'Mumbai',     'Full-time', 'Manage and optimize daily delivery operations across multiple city hubs.', '5+ years ops management. Supply chain experience. MBA preferred.', '2026-06-15', 'active', 2),
('Backend Engineer',         'Engineering',       'Bangalore',  'Full-time', 'Design robust APIs and microservices powering our real-time delivery platform.', 'Node.js/Python. REST/GraphQL. PostgreSQL/MySQL. Docker/K8s.', '2026-07-01', 'active', 1),
('Marketing Lead',           'Marketing',         'Remote',     'Remote',   'Drive growth through creative campaigns, partnerships, and community engagement.', '5+ years digital marketing. SEO/SEM. Data-driven mindset.', '2026-06-30', 'active', 2),
('Data Analyst',             'Engineering',       'Bangalore',  'Full-time', 'Analyze delivery patterns, customer behavior, and supply chain data to drive insights.', 'SQL, Python, Tableau/Power BI. Statistics background.', '2026-08-01', 'draft', 1),
('Customer Support Lead',    'Customer Support',  'Chennai',    'Full-time', 'Build and lead a world-class customer support team across phone, chat, and email.', '3+ years support management. CRM tools. Multilingual preferred.', '2026-05-30', 'closed', 2),
('Logistics Coordinator',    'Logistics',         'Pune',       'Full-time', 'Coordinate last-mile delivery logistics and optimize route planning.', '2+ years logistics. Analytical skills. Proficiency in route optimization tools.', '2026-07-15', 'active', 1);

-- ============================================================
-- CONTACT INQUIRIES
-- ============================================================
INSERT INTO contact_inquiries (full_name, email, phone, subject, message, is_bot, status, replied_by, replied_at, created_at) VALUES
('Arun Mehta',     'arun.m@gmail.com',    '9876543210', 'Delivery issue',        'My order #1234 was delivered to the wrong address. Please help resolve this urgently.', FALSE, 'replied', 1, '2026-04-20 11:00:00', '2026-04-20 09:30:00'),
('Sneha Reddy',    'sneha.r@gmail.com',   '9123456789', 'Partnership inquiry',   'I own a chain of organic stores in Hyderabad. Would love to discuss partnership opportunities.', FALSE, 'read', NULL, NULL, '2026-04-25 14:20:00'),
('Bot Spammer',    'spam@bot.net',        NULL,          'Buy cheap products',    'Visit our site for amazing deals!!! Click here now!!!', TRUE, 'unread', NULL, NULL, '2026-04-26 03:15:00'),
('Kavitha Nair',   'kavitha.n@yahoo.com', '9988776655', 'App not working',       'The app keeps crashing when I try to add items to cart on my Samsung phone. Android 14.', FALSE, 'unread', NULL, NULL, '2026-04-28 16:45:00'),
('Rohit Gupta',    'rohit.g@outlook.com', '9876012345', 'Refund request',        'I was charged twice for order #5678. Please process a refund for the duplicate charge.', FALSE, 'read', NULL, NULL, '2026-04-29 10:00:00'),
('Meera Iyer',     'meera.i@gmail.com',   '9845123456', 'Feedback',              'Absolutely love the app! Delivery was super fast. Just wish you had more organic options.', FALSE, 'replied', 2, '2026-05-01 15:30:00', '2026-05-01 12:00:00');

-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================
INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, ip_address) VALUES
(1, 'approved_merchant',     'merchant',          1, '192.168.1.10'),
(1, 'approved_merchant',     'merchant',          2, '192.168.1.10'),
(2, 'approved_merchant',     'merchant',          3, '192.168.1.15'),
(1, 'rejected_merchant',     'merchant',          6, '192.168.1.10'),
(1, 'approved_partner',      'delivery_partner',  1, '192.168.1.10'),
(2, 'posted_job',            'job',               1, '192.168.1.15'),
(1, 'replied_inquiry',       'contact_inquiry',   1, '192.168.1.10');
