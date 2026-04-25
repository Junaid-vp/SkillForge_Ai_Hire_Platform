import { prisma } from "../src/HR/Lib/prisma.js"

export const defaultTasks = [{
  title: "Build a GitHub Profile Finder",
  description: "Create a React app that searches GitHub users, displays their profile, repositories, and contribution stats using GitHub public API. This task is inspired by real frontend assessments used at Razorpay and Swiggy.",
  requirements: [
    "Search GitHub users by username with debounced input (400ms)",
    "Display avatar, bio, followers, following, and public repos",
    "List top 6 repositories sorted by stars",
    "Show programming language used in each repo with color indicator",
    "Handle loading, empty, and error states with proper UI",
    "Fully responsive for mobile and desktop",
    "No UI library allowed — pure Tailwind CSS only"
  ],
  category: "Frontend",
  techStack: "React, TypeScript, Tailwind CSS, GitHub API",
  difficulty: "Easy",
  duration: 1,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Real-Time Currency Converter",
  description: "Create a currency converter that fetches live exchange rates, supports multiple currencies, and shows historical rate charts. Inspired by frontend assessments at Groww and Zerodha.",
  requirements: [
    "Fetch live exchange rates from a public API",
    "Convert between any two currencies instantly on input",
    "Show historical rates for last 7 days as a line chart",
    "Support minimum 20 currencies with flag icons",
    "Swap currencies with animation",
    "Cache rates in localStorage — refresh only after 1 hour",
    "Show rate change percentage compared to yesterday"
  ],
  category: "Frontend",
  techStack: "React, TypeScript, Recharts, Tailwind CSS",
  difficulty: "Medium",
  duration: 1,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Drag and Drop Kanban Board",
  description: "Create a fully functional Kanban board like Trello with drag and drop, custom columns, and persistent state. This is a standard assessment used at Linear, Notion, and multiple product startups.",
  requirements: [
    "Default columns: Backlog, In Progress, Review, Done",
    "Drag and drop tasks between any column",
    "Add new column with custom name and color",
    "Add task with title, priority (High, Medium, Low), and due date",
    "Delete task and column with confirmation",
    "Persist all data in localStorage",
    "Show task count per column",
    "Filter tasks by priority level"
  ],
  category: "Frontend",
  techStack: "React, TypeScript, dnd-kit, Tailwind CSS",
  difficulty: "Medium",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Multi-Step Checkout Flow",
  description: "Create a pixel-perfect multi-step checkout form similar to Swiggy or Amazon checkout — with cart summary, address, payment, and confirmation steps.",
  requirements: [
    "Step 1: Cart review with quantity update and remove item",
    "Step 2: Delivery address form with validation",
    "Step 3: Payment method selection (Card, UPI, COD)",
    "Step 4: Order confirmation with summary",
    "Progress indicator showing current step",
    "Validate each step before proceeding to next",
    "Back navigation without losing filled data",
    "Show order total with tax calculation at every step"
  ],
  category: "Frontend",
  techStack: "React, TypeScript, React Hook Form, Zod, Tailwind CSS",
  difficulty: "Medium",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Video Streaming UI like YouTube",
  description: "Create a YouTube-inspired video browsing UI with infinite scroll, video player, sidebar recommendations, and search. Inspired by Meta and Google frontend interviews.",
  requirements: [
    "Home feed with video thumbnails, title, channel, views, and time",
    "Infinite scroll — load 12 more videos on scroll",
    "Video player page with custom controls (play, pause, volume, fullscreen)",
    "Sidebar with recommended videos",
    "Search with debounce and results page",
    "Category filter tabs (All, Music, Gaming, News, etc)",
    "Skeleton loading for all content",
    "Responsive layout for mobile and desktop"
  ],
  category: "Frontend",
  techStack: "React, TypeScript, React Query, Tailwind CSS",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},{
  title: "Build a URL Shortener API",
  description: "Create a production-grade URL shortener like bit.ly with analytics tracking, expiry, and rate limiting. This exact task is used in backend interviews at Flipkart and Amazon.",
  requirements: [
    "POST /shorten — accepts long URL, returns short code",
    "GET /:code — redirects to original URL",
    "Track click count, referrer, and timestamp per visit",
    "Set optional expiry date on short URL",
    "Rate limit — max 10 requests per minute per IP",
    "Return 404 for expired or invalid codes",
    "GET /analytics/:code — return click stats",
    "Validate URL format before shortening"
  ],
  category: "Backend",
  techStack: "Node.js, Express, PostgreSQL, Redis",
  difficulty: "Medium",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Notification Service",
  description: "Create a microservice that sends email, SMS, and in-app notifications based on event triggers using a queue system. Inspired by backend systems at Zomato and Razorpay.",
  requirements: [
    "Accept notification events via REST API",
    "Queue notifications using RabbitMQ",
    "Process and send email notifications via Resend",
    "Support notification types: WELCOME, OTP, ORDER_UPDATE, PAYMENT_SUCCESS",
    "Retry failed notifications up to 3 times with exponential backoff",
    "Log all notification attempts with status in database",
    "GET /notifications/:userId — fetch user notification history",
    "Mark notifications as read endpoint"
  ],
  category: "Backend",
  techStack: "Node.js, Express, RabbitMQ, PostgreSQL, Resend",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a JWT Authentication System with RBAC",
  description: "Implement a complete authentication system with role-based access control (RBAC) supporting Admin, Manager, and User roles. Used in backend assessments at TCS, Infosys, and most product companies.",
  requirements: [
    "Register with email and password — hash with Bcrypt",
    "Login returns access token (15 min) and refresh token (7 days)",
    "Refresh token endpoint to issue new access token",
    "Three roles: ADMIN, MANAGER, USER with different permissions",
    "Role-based middleware to protect routes",
    "Admin can create, update, delete users",
    "Manager can view all users but not delete",
    "User can only view and update their own profile",
    "Logout invalidates refresh token in Redis"
  ],
  category: "Backend",
  techStack: "Node.js, Express, JWT, Bcrypt, PostgreSQL, Redis",
  difficulty: "Medium",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build an E-Commerce Order Management API",
  description: "Create the core order management backend for an e-commerce platform handling cart, orders, inventory, and payments. Inspired by Meesho and Amazon backend interviews.",
  requirements: [
    "Cart API: add item, remove item, update quantity, clear cart",
    "Check inventory before adding to cart",
    "Place order — deduct inventory atomically using transactions",
    "Order status flow: PENDING → CONFIRMED → SHIPPED → DELIVERED",
    "Cancel order if status is PENDING or CONFIRMED only",
    "Razorpay or Stripe payment integration",
    "Send order confirmation email after payment",
    "GET /orders/:userId — paginated order history",
    "Handle concurrent orders without overselling"
  ],
  category: "Backend",
  techStack: "Node.js, Express, PostgreSQL, Prisma, Stripe",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Real-Time Leaderboard API",
  description: "Create a high-performance leaderboard API for a gaming platform using Redis sorted sets. This is a classic backend problem asked at Dream11, MPL, and other gaming companies.",
  requirements: [
    "POST /score — submit or update player score",
    "GET /leaderboard — return top 100 players with rank",
    "GET /leaderboard/:playerId — get player rank and nearby players",
    "Leaderboard updates in real time using Redis sorted sets",
    "Weekly leaderboard that resets every Monday midnight",
    "All-time leaderboard that never resets",
    "GET /leaderboard/friends/:playerId — leaderboard among friends only",
    "Score history per player stored in PostgreSQL"
  ],
  category: "Backend",
  techStack: "Node.js, Express, Redis, PostgreSQL",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},{
  title: "Build a Full Stack Expense Splitter",
  description: "Create a Splitwise-inspired app where friends can create groups, add expenses, and track who owes whom. Used as take-home at several Indian product startups.",
  requirements: [
    "User registration and login with JWT",
    "Create groups and invite friends by email",
    "Add expense with amount, description, and split type (equal, exact, percentage)",
    "Dashboard showing total owed and owed to you",
    "Settle up feature to mark debts as paid",
    "Expense history per group",
    "Email notification when added to group or expense",
    "Responsive UI with clean design"
  ],
  category: "Full Stack",
  techStack: "React, Node.js, PostgreSQL, Prisma, Resend",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Full Stack Interview Scheduler",
  description: "Create a scheduling platform where interviewers set availability and candidates book interview slots. Inspired by Calendly — used in full stack assessments at multiple HR tech companies.",
  requirements: [
    "Interviewer sets available time slots per week",
    "Candidate views available slots and books one",
    "Booking confirmation email to both parties",
    "Cancel and reschedule with 24 hour notice rule",
    "Google Calendar style weekly view",
    "Prevent double booking with database locks",
    "Timezone support for remote interviews",
    "Dashboard for interviewer showing upcoming bookings"
  ],
  category: "Full Stack",
  techStack: "React, Node.js, PostgreSQL, Prisma, Resend",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Real-Time Collaborative Document Editor",
  description: "Create a Google Docs-inspired editor where multiple users can edit the same document simultaneously with real-time sync. Inspired by Notion and Confluence engineering interviews.",
  requirements: [
    "Create and manage documents with titles",
    "Real-time collaborative editing using Socket.io",
    "Show other users cursor positions",
    "Auto-save every 30 seconds",
    "Document version history — restore any version",
    "Share document with view or edit permission",
    "Rich text formatting: bold, italic, headings, lists",
    "Offline support — sync when back online"
  ],
  category: "Full Stack",
  techStack: "React, Node.js, Socket.io, PostgreSQL, Quill.js",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Full Stack Food Ordering Platform",
  description: "Create a Zomato-inspired food ordering platform with restaurant listings, menu, cart, orders, and delivery tracking. Used as take-home at Swiggy and Zomato engineering teams.",
  requirements: [
    "Restaurant listings with search and cuisine filter",
    "Menu page with categories and item customization",
    "Cart with quantity management and special instructions",
    "Razorpay payment integration",
    "Order tracking with status: Placed, Preparing, Out for Delivery, Delivered",
    "Real-time order status updates using Socket.io",
    "Order history page",
    "Restaurant owner dashboard to manage orders",
    "Rating and review after delivery"
  ],
  category: "Full Stack",
  techStack: "React, Node.js, Socket.io, PostgreSQL, Razorpay",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Developer Portfolio CMS",
  description: "Create a content management system where developers can manage their portfolio — projects, skills, blogs, and contact form. Inspired by Hashnode and Dev.to engineering assessments.",
  requirements: [
    "Admin login to manage portfolio content",
    "Add, edit, delete projects with image upload",
    "Blog system with rich text editor",
    "Skills section with proficiency levels",
    "Contact form with email notification",
    "Public portfolio page with custom slug",
    "SEO meta tags for all pages",
    "Dark and light mode support",
    "Analytics — track profile views per day"
  ],
  category: "Full Stack",
  techStack: "React, Node.js, PostgreSQL, Cloudinary, Resend",
  difficulty: "Medium",
  duration: 3,
  isDefault: true,
  hrId: null
},{
  title: "Set Up Production CI/CD Pipeline",
  description: "Build a complete CI/CD pipeline for a Node.js application using GitHub Actions — with linting, testing, and automatic deployment. Used in DevOps assessments at ThoughtWorks and Atlassian.",
  requirements: [
    "GitHub Actions workflow triggers on push to main",
    "Step 1: Run ESLint and TypeScript type check",
    "Step 2: Run Jest unit tests with coverage report",
    "Step 3: Build Docker image and push to Docker Hub",
    "Step 4: Deploy to Railway or Render automatically",
    "Fail pipeline and block merge if any step fails",
    "Send Slack notification on deploy success or failure",
    "Add build status badge to README",
    "Separate workflows for PR checks and deployment"
  ],
  category: "DevOps",
  techStack: "GitHub Actions, Docker, Railway, Jest, Slack API",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Containerize a Microservices Application",
  description: "Containerize a multi-service application (API, frontend, database, cache) using Docker and orchestrate with Docker Compose. Used in DevOps interviews at Infosys, Wipro, and product startups.",
  requirements: [
    "Dockerfile for Node.js backend with multi-stage build",
    "Dockerfile for React frontend served via Nginx",
    "Docker Compose with all services: backend, frontend, PostgreSQL, Redis",
    "Environment variables via .env file — not hardcoded",
    "Named volumes for database persistence",
    "Health checks for backend and database containers",
    "Custom Docker network for service isolation",
    "Single command startup: docker-compose up",
    "Production vs development compose files"
  ],
  category: "DevOps",
  techStack: "Docker, Docker Compose, Nginx, Node.js, PostgreSQL",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Implement Centralized Logging and Monitoring",
  description: "Set up production-grade logging, error tracking, and uptime monitoring for a Node.js application. Inspired by SRE practices at Google and Amazon.",
  requirements: [
    "Winston logger with levels: error, warn, info, debug",
    "Log all API requests: method, path, status, response time",
    "Separate log files for errors and combined logs",
    "Log rotation — new file daily, keep last 14 days",
    "Sentry integration for real-time error tracking",
    "Sentry captures unhandled exceptions and promise rejections",
    "Health check endpoint: GET /health returns uptime and DB status",
    "Set up BetterUptime or UptimeRobot for uptime alerts",
    "Performance monitoring — alert if response time exceeds 2 seconds"
  ],
  category: "DevOps",
  techStack: "Node.js, Winston, Sentry, PM2",
  difficulty: "Medium",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Configure Secure Nginx Reverse Proxy",
  description: "Set up a production Nginx server with SSL, HTTP/2, security headers, rate limiting, and Gzip compression. Used in server admin assessments at hosting companies and backend-heavy teams.",
  requirements: [
    "Install Nginx on Ubuntu 22.04 server",
    "Configure reverse proxy to Node.js application on port 3000",
    "Set up free SSL with Certbot and Let's Encrypt",
    "Force HTTP to HTTPS redirect",
    "Enable HTTP/2 for better performance",
    "Add security headers: HSTS, X-Frame-Options, CSP",
    "Rate limit: 30 requests per second per IP",
    "Enable Gzip compression for responses",
    "Configure static asset caching for 30 days",
    "Score A+ on SSL Labs test"
  ],
  category: "DevOps",
  techStack: "Nginx, Ubuntu, Let's Encrypt, Node.js",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build an Infrastructure as Code Setup",
  description: "Define and provision cloud infrastructure using code — VPC, EC2, RDS, S3, and security groups on AWS. Used in DevOps assessments at cloud-native companies.",
  requirements: [
    "Create VPC with public and private subnets",
    "EC2 instance in public subnet for Node.js app",
    "RDS PostgreSQL in private subnet",
    "S3 bucket for file storage with proper IAM policies",
    "Security groups allowing only necessary ports",
    "Application Load Balancer for the EC2 instance",
    "Auto-scaling group with min 1 max 3 instances",
    "Store Terraform state in S3 backend",
    "README with full setup instructions"
  ],
  category: "DevOps",
  techStack: "Terraform, AWS EC2, RDS, S3, VPC",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},{
  title: "Build a UPI Payment App Clone",
  description: "Create a mobile app inspired by Google Pay with contacts, send money flow, transaction history, and QR code scanner. Inspired by Razorpay and PhonePe mobile assessments.",
  requirements: [
    "Home screen with balance and quick action buttons",
    "Send money flow: select contact, enter amount, confirm PIN",
    "QR code scanner to receive payment details",
    "Transaction history with filter by date and type",
    "Contact list with search and recent contacts",
    "Bill splitting feature — split with multiple contacts",
    "Push notification on transaction success or failure",
    "Biometric authentication using fingerprint or Face ID"
  ],
  category: "Mobile",
  techStack: "React Native, Expo, AsyncStorage, React Navigation",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Food Delivery Tracking App",
  description: "Create a Swiggy-inspired mobile app with restaurant browsing, ordering, and real-time delivery tracking on a map. Used in mobile assessments at Swiggy and Dunzo.",
  requirements: [
    "Restaurant listing with search and filter by cuisine and rating",
    "Menu with categories, item images, and add to cart",
    "Cart with quantity management and coupon code",
    "Order placement with address selection",
    "Real-time delivery tracking on Google Maps",
    "Order status updates via push notifications",
    "Order history with reorder option",
    "Rating screen after delivery"
  ],
  category: "Mobile",
  techStack: "React Native, Expo, Google Maps, Socket.io",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build an Offline-First Notes App",
  description: "Create a fully offline notes app that syncs with a backend when internet is available and handles conflicts gracefully. Inspired by Notion and Bear app engineering challenges.",
  requirements: [
    "Create, edit, delete notes with rich text formatting",
    "Notes stored locally in SQLite — works without internet",
    "Sync with backend API when internet available",
    "Conflict resolution: last write wins strategy",
    "Search notes by title and content",
    "Organize notes with color labels and folders",
    "Pin important notes to top",
    "Share note as plain text or PDF",
    "Biometric lock for private notes"
  ],
  category: "Mobile",
  techStack: "React Native, Expo, SQLite, Node.js",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Fitness and Workout Tracker",
  description: "Create a mobile fitness app that tracks workouts, calories, steps, and body measurements with progress charts. Inspired by HealthifyMe and Fitbit mobile engineering.",
  requirements: [
    "Log workouts with exercise name, sets, reps, and weight",
    "Pre-built workout templates: Push Day, Pull Day, Leg Day",
    "Step counter using device accelerometer",
    "Calorie tracker with food search using Nutritionix API",
    "Body measurement tracker: weight, BMI, body fat",
    "Weekly progress charts for all metrics",
    "Streak tracking — consecutive workout days",
    "Push notifications for workout reminders",
    "Export progress report as PDF"
  ],
  category: "Mobile",
  techStack: "React Native, Expo, Victory Native, SQLite",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Real-Time Group Chat App",
  description: "Create a WhatsApp-inspired group chat mobile application with real-time messaging, media sharing, and read receipts.",
  requirements: [
    "User registration with phone number and OTP",
    "Create groups and add or remove members",
    "Real-time messaging using Socket.io",
    "Send images and documents in chat",
    "Message status: Sent, Delivered, Read (tick system)",
    "Reply to specific messages with quote",
    "Online and last seen status",
    "Push notifications for new messages",
    "Delete message for everyone within 1 hour"
  ],
  category: "Mobile",
  techStack: "React Native, Expo, Socket.io, Node.js, Cloudinary",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},{
  title: "Design and Optimize a Social Media Database",
  description: "Design the database schema for a Twitter-like social media platform and write optimized queries for feeds, followers, and trending topics. Used in database interviews at Twitter and Koo.",
  requirements: [
    "Design tables: users, posts, likes, comments, followers, hashtags",
    "Write query to get home feed — posts from followed users sorted by time",
    "Write query for trending hashtags in last 24 hours",
    "Write query to get mutual followers between two users",
    "Add proper indexes for all high-traffic queries",
    "Run EXPLAIN ANALYZE before and after indexing",
    "Show query execution time improvement percentage",
    "Handle soft delete for posts and users"
  ],
  category: "Database",
  techStack: "PostgreSQL, SQL",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Implement Full-Text Search with PostgreSQL",
  description: "Build a fast full-text search system for a product catalog using PostgreSQL's built-in full-text search capabilities. Used in database assessments at e-commerce companies.",
  requirements: [
    "Create products table with name, description, category, and price",
    "Implement full-text search using tsvector and tsquery",
    "Add GIN index for fast full-text search",
    "Search across name and description simultaneously",
    "Rank results by relevance using ts_rank",
    "Support partial word matching and typo tolerance",
    "Add category and price range filters",
    "Compare performance: LIKE vs full-text search with EXPLAIN ANALYZE",
    "Seed with 10000 product records for benchmarking"
  ],
  category: "Database",
  techStack: "PostgreSQL, SQL, Node.js",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Time-Series Data Storage System",
  description: "Design and implement a time-series database solution for storing and querying IoT sensor data efficiently. Inspired by real problems at monitoring companies.",
  requirements: [
    "Design schema optimized for time-series data",
    "Partition tables by month for better query performance",
    "Insert 1 million sensor readings efficiently using bulk insert",
    "Query average temperature per hour for last 7 days",
    "Query min/max/avg per device per day",
    "Automatic data archival after 90 days to cold storage table",
    "Alert query: find devices with reading above threshold",
    "Benchmark query performance before and after partitioning",
    "API endpoints to insert and query sensor data"
  ],
  category: "Database",
  techStack: "PostgreSQL, Node.js, Express",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Design a Multi-Tenant SaaS Database",
  description: "Design and implement a multi-tenant database architecture where multiple companies share infrastructure but data is completely isolated. This is a core concept in B2B SaaS companies like Freshworks and Zoho.",
  requirements: [
    "Implement shared database with tenantId isolation strategy",
    "Add tenantId to all tables and enforce in all queries",
    "Row-level security using PostgreSQL RLS policies",
    "Tenant registration and onboarding API",
    "Middleware that automatically injects tenantId from JWT",
    "Prevent any cross-tenant data access",
    "Per-tenant usage analytics",
    "Tenant data export as JSON",
    "Write tests proving tenant isolation cannot be bypassed"
  ],
  category: "Database",
  techStack: "PostgreSQL, Node.js, Prisma",
  difficulty: "Hard",
  duration: 3,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Database Audit and Compliance System",
  description: "Implement a complete audit trail system that tracks all data changes with who changed what and when. Required in fintech companies like Razorpay, Paytm, and banks.",
  requirements: [
    "Create audit_logs table: table_name, record_id, action, old_value, new_value, changed_by, timestamp",
    "PostgreSQL triggers that fire on INSERT, UPDATE, DELETE",
    "Capture old and new values as JSONB on update",
    "API to query audit history for any record",
    "Filter audit logs by user, table, date range, and action",
    "Audit logs must be immutable — no update or delete allowed",
    "Export audit report as CSV for compliance",
    "Alert when sensitive fields like email or password are changed"
  ],
  category: "Database",
  techStack: "PostgreSQL, Node.js, Express",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},{
  title: "Implement a LRU Cache from Scratch",
  description: "Build a production-grade LRU (Least Recently Used) cache using HashMap and Doubly LinkedList without using any built-in cache libraries. This is one of the most asked system design coding problems at Google, Amazon, and Microsoft.",
  requirements: [
    "Implement LRU Cache class with get(key) and put(key, value)",
    "O(1) time complexity for both get and put operations",
    "Use HashMap + Doubly LinkedList — no built-in Map allowed",
    "Evict least recently used item when capacity is full",
    "get() returns -1 if key not found",
    "put() updates existing key and moves to front",
    "Write unit tests with 100% coverage",
    "Implement TTL (time to live) — auto evict expired keys",
    "Benchmark against a simple array-based cache"
  ],
  category: "Algorithms & DSA",
  techStack: "TypeScript, Jest",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Task Scheduler with Priority Queue",
  description: "Implement a task scheduling system using a min-heap priority queue that executes tasks based on priority and scheduled time. Used in interviews at Uber, Ola, and scheduling-heavy companies.",
  requirements: [
    "Implement MinHeap from scratch without built-in sort",
    "Schedule tasks with priority (1-10) and execution time",
    "Higher priority tasks execute first at same time",
    "Earlier scheduled tasks execute first at same priority",
    "Cancel a scheduled task by task ID",
    "Get next N tasks to execute in order",
    "Recurring tasks that re-schedule themselves",
    "Write unit tests for heap operations",
    "Analyze time complexity of all operations"
  ],
  category: "Algorithms & DSA",
  techStack: "TypeScript, Jest",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Implement Graph Algorithms for Social Network",
  description: "Solve real-world social network problems using graph algorithms — friend suggestions, shortest connection path, and influencer detection. Inspired by LinkedIn and Facebook engineering problems.",
  requirements: [
    "Represent social network as adjacency list graph",
    "BFS to find shortest connection path between two users",
    "Friend suggestions — users 2 degrees away not already connected",
    "Detect communities using Union-Find algorithm",
    "Find most influential users using PageRank algorithm",
    "Detect if two users are in the same network component",
    "Find all users within N connections of a given user",
    "Write unit tests for each algorithm",
    "Analyze and document time and space complexity"
  ],
  category: "Algorithms & DSA",
  techStack: "TypeScript, Jest",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Build a Search Autocomplete with Trie",
  description: "Implement a Google Search-style autocomplete system using Trie data structure with ranking, typo tolerance, and caching. Asked frequently at Google, Atlassian, and search-focused companies.",
  requirements: [
    "Implement Trie data structure from scratch",
    "Insert search terms with frequency tracking",
    "Return top 5 suggestions ranked by search frequency",
    "Prefix-based search with O(prefix length) time",
    "Case-insensitive search support",
    "Fuzzy matching — tolerate 1 character typo",
    "Delete search term from Trie",
    "Serialize and deserialize Trie to JSON",
    "Benchmark Trie search vs linear array search",
    "Write comprehensive unit tests"
  ],
  category: "Algorithms & DSA",
  techStack: "TypeScript, Jest",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},
{
  title: "Solve Real-World Dynamic Programming Problems",
  description: "Solve 5 real-world DP problems that appear in product company interviews — each with brute force, memoization, and tabulation solutions with complexity analysis.",
  requirements: [
    "Problem 1: Maximum profit from stock prices with cooldown period (Swiggy delivery optimization)",
    "Problem 2: Minimum cost path in a grid with obstacles (Uber route planning)",
    "Problem 3: Longest common subsequence for diff tool (GitHub diff feature)",
    "Problem 4: Word break problem for search suggestions (Google autocomplete)",
    "Problem 5: Coin change minimum coins (Razorpay payment denomination)",
    "For each: write brute force O(2^n) solution first",
    "Optimize with memoization (top-down DP)",
    "Optimize further with tabulation (bottom-up DP)",
    "Document time and space complexity for each approach",
    "Write unit tests with edge cases for all 5 problems"
  ],
  category: "Algorithms & DSA",
  techStack: "TypeScript, Jest",
  difficulty: "Hard",
  duration: 2,
  isDefault: true,
  hrId: null
},]


 export const main = async () => {
  try {
    console.log("Seeding default tasks...")

    
    await prisma.taskLibrary.deleteMany({
      where: { isDefault: true }
    })

  
    const tasksToSeed = defaultTasks.map(task => ({
      ...task,
      requirements: Array.isArray(task.requirements) ? task.requirements.join("|") : task.requirements
    }));

    await prisma.taskLibrary.createMany({
      data: tasksToSeed as any
    })

    console.log(`✅ Successfully seeded ${defaultTasks.length} default tasks`)

  } catch (e: any) {
    console.error("❌ Seeding failed:", e.message)
    throw e
  } finally {
    await prisma.$disconnect()
  }
}


main();
