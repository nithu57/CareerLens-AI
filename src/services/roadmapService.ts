import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RoadmapMilestone, RoleType, LearningResourceItem } from '@/types';

/**
 * Standard curriculum templates for target roles
 */
export const ROLE_CURRICULUM_TEMPLATES: Record<
  RoleType,
  {
    title: string;
    objectives: string[];
    actionItems: string[];
    practicalExercises: string[];
    portfolioProject: { title: string; description: string; deliverable: string; techStack: string[] };
    verifiedResources: LearningResourceItem[];
  }[]
> = {
  'Full-Stack Developer': [
    {
      title: 'Modern Frontend Architecture & TypeScript Mastery',
      objectives: ['Master TypeScript interfaces, generics, and strict type safety in React', 'Build performant, accessible UI components with Tailwind CSS'],
      actionItems: ['Refactor JavaScript components to strict TypeScript', 'Configure React Query for resilient caching', 'Audit web performance using Lighthouse'],
      practicalExercises: ['Build a type-safe generic searchable data grid with pagination', 'Implement debounced search and infinite scrolling'],
      portfolioProject: {
        title: 'Enterprise Analytics Dashboard',
        description: 'Responsive, highly accessible dashboard featuring interactive charts, server-state management with TanStack Query, and clean component isolation.',
        deliverable: 'GitHub repository with 95%+ Lighthouse score and full unit tests.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'TanStack Query'],
      },
      verifiedResources: [
        {
          id: 'res-react-docs',
          title: 'React Official Documentation (Learn React)',
          provider: 'Official Docs',
          url: 'https://react.dev/learn',
          topic: 'React',
          type: 'documentation',
          isOfficial: true,
        },
        {
          id: 'res-ts-handbook',
          title: 'TypeScript Official Handbook',
          provider: 'Official Docs',
          url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
          topic: 'TypeScript',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Scalable Backend APIs, Authentication & Database Modeling',
      objectives: ['Design secure RESTful APIs with Node.js and Express / Cloud Functions', 'Model relational and document database schemas with Firestore and PostgreSQL'],
      actionItems: ['Implement JWT and Firebase Auth session verification', 'Write strict data validation schemas with Zod', 'Set up database indexes and security rules'],
      practicalExercises: ['Build an authenticated CRUD microservice with rate limiting and input sanitization', 'Implement role-based authorization middleware'],
      portfolioProject: {
        title: 'Collaborative Workspace API & Cloud Functions',
        description: 'Production backend with Firebase Cloud Functions, Firestore triggers, fine-grained security rules, and comprehensive API documentation.',
        deliverable: 'Tested backend endpoints with automated unit & integration tests.',
        techStack: ['Node.js', 'Firebase Functions', 'Firestore', 'Zod', 'Jest'],
      },
      verifiedResources: [
        {
          id: 'res-node-docs',
          title: 'Node.js Official Documentation',
          provider: 'Official Docs',
          url: 'https://nodejs.org/en/docs',
          topic: 'Node.js',
          type: 'documentation',
          isOfficial: true,
        },
        {
          id: 'res-firebase-docs',
          title: 'Cloud Firestore Security Rules & Data Modeling',
          provider: 'Official Docs',
          url: 'https://firebase.google.com/docs/firestore/security/get-started',
          topic: 'Firestore',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'System Integration, Docker Containers & Cloud Deployment',
      objectives: ['Containerize full-stack services using Docker and multi-stage builds', 'Deploy to production with automated CI/CD pipelines and monitoring'],
      actionItems: ['Author Dockerfile and docker-compose configurations', 'Configure GitHub Actions for automated linting, test execution, and deployment', 'Set up error reporting and performance monitoring'],
      practicalExercises: ['Containerize a React + Node service with environment variable segregation', 'Automate production deployment to Firebase Hosting and Cloud Run'],
      portfolioProject: {
        title: 'Full-Stack SaaS Platform with CI/CD',
        description: 'End-to-end deployed SaaS application with custom domain, automated deployment preview channels, and zero-downtime releases.',
        deliverable: 'Live web application URL and continuous delivery pipeline.',
        techStack: ['Docker', 'GitHub Actions', 'Firebase Hosting', 'Google Cloud Run'],
      },
      verifiedResources: [
        {
          id: 'res-docker-docs',
          title: 'Docker Official Getting Started Guide',
          provider: 'Official Docs',
          url: 'https://docs.docker.com/get-started/',
          topic: 'Docker',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Production Readiness, Security Hardening & Mock Interviews',
      objectives: ['Perform security auditing (OWASP Top 10, CORS, XSS, CSRF)', 'Master system design and live behavioral/technical interview coding'],
      actionItems: ['Audit frontend dependencies for vulnerabilities with npm audit', 'Conduct mock technical interview sessions with LensBot AI', 'Prepare clear project walkthroughs highlighting architectural decisions'],
      practicalExercises: ['Solve 10 targeted algorithmic and system design interview challenges', 'Complete end-to-end security audit on portfolio projects'],
      portfolioProject: {
        title: 'Production-Hardened Portfolio Showcase',
        description: 'Polished portfolio site presenting production deliverables, architecture diagrams, and live demo links ready for recruiters.',
        deliverable: 'Public portfolio ready for application submissions.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      },
      verifiedResources: [
        {
          id: 'res-owasp',
          title: 'OWASP Top 10 Security Risks',
          provider: 'Official Docs',
          url: 'https://owasp.org/www-project-top-ten/',
          topic: 'Web Security',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Frontend Developer': [
    {
      title: 'Advanced React, TypeScript & State Management',
      objectives: ['Master React hooks, custom hooks, and concurrent features', 'Enforce strict TypeScript typings and reusable component contracts'],
      actionItems: ['Implement complex state machines and query caching', 'Build accessible forms with React Hook Form and Zod validation'],
      practicalExercises: ['Build a multi-step onboarding wizard with draft persistence', 'Create an interactive virtualized list with 10,000 items'],
      portfolioProject: {
        title: 'High-Performance E-Commerce Interface',
        description: 'Accessible storefront featuring dynamic filtering, faceted search, Cart state management, and optimized asset loading.',
        deliverable: 'Live deployed application with 100/100 Lighthouse accessibility rating.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand / Redux'],
      },
      verifiedResources: [
        {
          id: 'res-react-docs',
          title: 'React Official Documentation',
          provider: 'Official Docs',
          url: 'https://react.dev',
          topic: 'React',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Responsive Design, CSS Architecture & Web Accessibility',
      objectives: ['Master modern CSS layouts: Grid, Flexbox, Container Queries', 'Achieve WCAG 2.1 AA accessibility compliance across all components'],
      actionItems: ['Implement keyboard navigation and ARIA landmarks', 'Design fluid typography and responsive breakpoints'],
      practicalExercises: ['Audit and remediate accessibility violations in existing components', 'Create dark/light theme switcher with CSS variables and prefers-color-scheme'],
      portfolioProject: {
        title: 'Enterprise Design System & Component Library',
        description: 'Reusable, documented component library with Storybook or preview pages, complete with keyboard accessibility and dark mode.',
        deliverable: 'Published component package or live interactive Storybook.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'ARIA'],
      },
      verifiedResources: [
        {
          id: 'res-mdn-a11y',
          title: 'MDN Web Accessibility (a11y) Guide',
          provider: 'MDN',
          url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
          topic: 'Accessibility',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Web Performance Optimization (CWV) & Testing',
      objectives: ['Optimize Core Web Vitals (LCP, INP, CLS)', 'Write comprehensive unit and integration tests using Vitest and React Testing Library'],
      actionItems: ['Implement code splitting with React.lazy and dynamic imports', 'Achieve 80%+ test coverage across critical user flows'],
      practicalExercises: ['Profile React rendering cycles with React DevTools Profiler', 'Write integration tests for async user authentication flows'],
      portfolioProject: {
        title: 'High-Traffic News Reader with Sub-Second LCP',
        description: 'Blazing fast news aggregator demonstrating content-visibility, image responsive srcset, and view transitions.',
        deliverable: 'Tested web app with verified CWV metrics under 1.2s LCP.',
        techStack: ['React', 'Vite', 'Vitest', 'Testing Library'],
      },
      verifiedResources: [
        {
          id: 'res-web-dev-cwv',
          title: 'Web.dev Core Web Vitals Optimization',
          provider: 'Official Docs',
          url: 'https://web.dev/explore/fast',
          topic: 'Performance',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Frontend Interview Preparation & Portfolio Showcase',
      objectives: ['Prepare for JavaScript fundamentals, DOM APIs, and live UI coding challenges', 'Polished portfolio presentation'],
      actionItems: ['Practice JavaScript closures, prototypes, event loop, and promises', 'Simulate frontend technical rounds with LensBot AI mentor'],
      practicalExercises: ['Code a live autocomplete widget from scratch in 30 minutes', 'Implement custom Promise.all and debounce helpers'],
      portfolioProject: {
        title: 'Production Frontend Engineer Portfolio',
        description: 'Curated developer portfolio featuring interactive live demos, technical write-ups, and downloadable resume.',
        deliverable: 'Deployed production portfolio URL.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      },
      verifiedResources: [
        {
          id: 'res-javascript-info',
          title: 'The Modern JavaScript Tutorial',
          provider: 'Official Docs',
          url: 'https://javascript.info/',
          topic: 'JavaScript',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Backend Developer': [
    {
      title: 'API Design, Microservices & Asynchronous Node.js',
      objectives: ['Design idempotent RESTful APIs and handle asynchronous concurrency safely', 'Implement robust error handling, middleware, and request validation'],
      actionItems: ['Construct structured error responses and logging with Winston / Pino', 'Implement rate limiting and request timeouts'],
      practicalExercises: ['Build a high-throughput webhook handler with queue processing', 'Implement health check and liveness probes'],
      portfolioProject: {
        title: 'Payment & Subscription Processing Service',
        description: 'Secure API service managing subscription billing, webhook validation, and transaction logs with idempotency keys.',
        deliverable: 'Dockerized microservice with OpenAPI / Swagger spec.',
        techStack: ['Node.js', 'TypeScript', 'Express / Fastify', 'Zod'],
      },
      verifiedResources: [
        {
          id: 'res-node-api',
          title: 'Node.js Best Practices Repository',
          provider: 'Official Docs',
          url: 'https://github.com/goldbergyoni/nodebestpractices',
          topic: 'Node.js',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Advanced Database Modeling & Query Optimization',
      objectives: ['Master SQL indexing, query plans, transactions, and ACID properties', 'Design high-performance NoSQL data models in MongoDB / Firestore'],
      actionItems: ['Analyze slow queries with EXPLAIN ANALYZE', 'Implement caching with Redis for read-heavy operations'],
      practicalExercises: ['Model a multi-tenant relational schema with foreign key constraints and cascades', 'Configure Redis cache-aside strategy with TTL and invalidation'],
      portfolioProject: {
        title: 'High-Volume Order Management Database Engine',
        description: 'Relational data store handling concurrent inventory reservations, deadlock prevention, and optimized financial reporting queries.',
        deliverable: 'SQL migration scripts, seed data, and performance benchmark report.',
        techStack: ['PostgreSQL', 'Redis', 'Prisma / Drizzle'],
      },
      verifiedResources: [
        {
          id: 'res-postgres-docs',
          title: 'PostgreSQL Official Documentation',
          provider: 'Official Docs',
          url: 'https://www.postgresql.org/docs/',
          topic: 'PostgreSQL',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Security, Authentication & Distributed Systems',
      objectives: ['Implement OAuth2, JWTs with rotating refresh tokens, and RBAC', 'Understand message broker patterns using Kafka or RabbitMQ'],
      actionItems: ['Harden API endpoints against SQL injection, NoSQL injection, and SSRF', 'Set up event-driven communication between two backend services'],
      practicalExercises: ['Implement secure password hashing with argon2 / bcrypt', 'Build a pub/sub message publisher and subscriber with retry policies'],
      portfolioProject: {
        title: 'Event-Driven Notification Microservice',
        description: 'Scalable service consuming event streams and dispatching email / SMS alerts with dead-letter queue handling.',
        deliverable: 'Deployed background worker architecture with automated testing.',
        techStack: ['Node.js', 'Kafka / RabbitMQ', 'Docker'],
      },
      verifiedResources: [
        {
          id: 'res-auth-guide',
          title: 'RFC 6749 - The OAuth 2.0 Authorization Framework',
          provider: 'Official Docs',
          url: 'https://datatracker.ietf.org/doc/html/rfc6749',
          topic: 'Security',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Cloud Deployment, Observability & Technical Interviews',
      objectives: ['Deploy backend services to Cloud (AWS ECS / GCP Cloud Run)', 'Master distributed tracing, metrics, and backend system design interviews'],
      actionItems: ['Configure Prometheus metrics and Grafana dashboards', 'Practice designing large-scale systems (URL shortener, rate limiter, chat system) with LensBot'],
      practicalExercises: ['Set up OpenTelemetry instrumentation for distributed tracing', 'Conduct mock system design interview'],
      portfolioProject: {
        title: 'Cloud-Deployed Microservice with Tracing & Metrics',
        description: 'Production-ready service monitored with Prometheus metrics, structured JSON logs, and health probes.',
        deliverable: 'Live cloud service with Grafana dashboard screenshots.',
        techStack: ['Docker', 'Google Cloud Run', 'Prometheus', 'Grafana'],
      },
      verifiedResources: [
        {
          id: 'res-gcp-run',
          title: 'Google Cloud Run Documentation',
          provider: 'Official Docs',
          url: 'https://cloud.google.com/run/docs',
          topic: 'Cloud',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Flutter Developer': [
    {
      title: 'Dart 3 Mastery & Modern Flutter UI Layouts',
      objectives: ['Master Dart 3 pattern matching, records, and class modifiers', 'Build fluid, responsive Flutter widgets with Material 3 design'],
      actionItems: ['Refactor stateful widgets to modern patterns', 'Implement custom slivers and scroll effects'],
      practicalExercises: ['Build a responsive adaptive layout that adjusts across mobile, tablet, and web', 'Create custom animations with AnimationController and AnimatedBuilder'],
      portfolioProject: {
        title: 'Finance & Expense Tracker App',
        description: 'Mobile app featuring interactive expense charts, transaction filters, and adaptive tablet/desktop layout.',
        deliverable: 'Flutter application repository with clean widget architecture.',
        techStack: ['Flutter', 'Dart', 'FlChart'],
      },
      verifiedResources: [
        {
          id: 'res-flutter-docs',
          title: 'Flutter Official Documentation',
          provider: 'Official Docs',
          url: 'https://docs.flutter.dev/',
          topic: 'Flutter',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'State Management & Offline Persistence',
      objectives: ['Implement robust state management using Bloc or Riverpod', 'Enable offline-first architecture with local SQLite / Hive database'],
      actionItems: ['Structure application into presentation, domain, and data layers', 'Write repository contracts and local cache sync logic'],
      practicalExercises: ['Implement an offline sync engine that queues changes and syncs upon reconnection', 'Write unit tests for Bloc / Riverpod notifiers'],
      portfolioProject: {
        title: 'Offline-First Task & Habit Tracker',
        description: 'High-performance mobile app allowing full offline task creation, local notifications, and cloud sync.',
        deliverable: 'Functional app with comprehensive test coverage.',
        techStack: ['Flutter', 'Riverpod / Bloc', 'Isar / SQLite'],
      },
      verifiedResources: [
        {
          id: 'res-riverpod-docs',
          title: 'Riverpod State Management Documentation',
          provider: 'Official Docs',
          url: 'https://riverpod.dev/docs/introduction/getting_started',
          topic: 'State Management',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Hardware Interop, Push Notifications & Firebase Integration',
      objectives: ['Integrate Firebase Cloud Messaging (FCM) and Cloud Firestore', 'Use platform channels for device cameras, location, and biometrics'],
      actionItems: ['Configure Firebase for iOS and Android in Flutter', 'Implement biometric fingerprint / Face ID authentication'],
      practicalExercises: ['Set up deep linking with GoRouter', 'Build a camera capture and document upload screen'],
      portfolioProject: {
        title: 'Social Community & Discovery App',
        description: 'Complete cross-platform app featuring real-time Firestore chat, push notifications, and profile photo capture.',
        deliverable: 'Deployed APK / TestFlight build and open-source codebase.',
        techStack: ['Flutter', 'Firebase Auth', 'Firestore', 'FCM'],
      },
      verifiedResources: [
        {
          id: 'res-flutterfire',
          title: 'FlutterFire Official Integration Guide',
          provider: 'Official Docs',
          url: 'https://firebase.flutter.dev/docs/overview',
          topic: 'Firebase Flutter',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Testing, CI/CD & App Store Deployment Readiness',
      objectives: ['Write unit, widget, and integration tests', 'Automate builds with GitHub Actions / Fastlane for Play Store and App Store'],
      actionItems: ['Set up automated screenshot generation and code signing', 'Practice mobile architecture interview questions with LensBot'],
      practicalExercises: ['Write integration tests simulating full user login and checkout flow', 'Audit app bundle size and remove unused assets'],
      portfolioProject: {
        title: 'Production Store-Ready App Submission',
        description: 'Full Flutter project with CI/CD pipeline, signing certificates configured, and clean changelog.',
        deliverable: 'Release APK and demonstration video.',
        techStack: ['Flutter', 'GitHub Actions', 'Fastlane'],
      },
      verifiedResources: [
        {
          id: 'res-flutter-testing',
          title: 'Testing Flutter Apps Official Guide',
          provider: 'Official Docs',
          url: 'https://docs.flutter.dev/testing/overview',
          topic: 'Testing',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Software Engineer': [
    {
      title: 'Data Structures, Algorithms & Algorithmic Complexity',
      objectives: ['Master Arrays, Hash Tables, Trees, Graphs, and Dynamic Programming', 'Analyze time and space complexity with Big-O notation'],
      actionItems: ['Solve 25 fundamental LeetCode medium questions', 'Write modular, well-commented algorithms in preferred language'],
      practicalExercises: ['Implement a Trie for search autocompletion', 'Implement Dijkstra and BFS shortest path algorithms'],
      portfolioProject: {
        title: 'Algorithmic Visualizer & Profiler',
        description: 'Interactive web tool visualizing sorting and pathfinding algorithms with real-time step execution.',
        deliverable: 'Live web app and algorithmic comparison benchmarks.',
        techStack: ['TypeScript', 'React', 'Tailwind CSS'],
      },
      verifiedResources: [
        {
          id: 'res-cs-fundamentals',
          title: 'Algorithms, Part I (Princeton University / Coursera)',
          provider: 'Coursera',
          url: 'https://www.coursera.org/learn/algorithms-part1',
          topic: 'Algorithms',
          type: 'course',
        },
      ],
    },
    {
      title: 'Object-Oriented Design & Clean Architecture Patterns',
      objectives: ['Apply SOLID principles, design patterns (Factory, Observer, Strategy, Decorator)', 'Write clean, maintainable, self-documenting code'],
      actionItems: ['Refactor monolithic classes into modular, loosely coupled components', 'Design clean interfaces and dependency injection containers'],
      practicalExercises: ['Refactor a legacy calculation script using Strategy and Command patterns', 'Write automated unit tests asserting class behavior'],
      portfolioProject: {
        title: 'Extensible Rule & Workflow Engine',
        description: 'Pluggable workflow processing engine that parses JSON rules and executes multi-step business logic.',
        deliverable: 'Tested library with 100% test coverage and documentation.',
        techStack: ['TypeScript / Python / Java', 'Jest / PyTest'],
      },
      verifiedResources: [
        {
          id: 'res-refactoring-guru',
          title: 'Design Patterns Guide (Refactoring Guru)',
          provider: 'Official Docs',
          url: 'https://refactoring.guru/design-patterns',
          topic: 'Design Patterns',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Database Systems, Caching & Concurrency',
      objectives: ['Understand relational query planning, indexes, and transactions', 'Handle concurrency, multi-threading, and distributed caching'],
      actionItems: ['Model normalized relational schemas and optimize complex join queries', 'Implement mutexes and thread-safe data structures'],
      practicalExercises: ['Benchmarking database read and write latency across various indexing strategies', 'Build a rate-limiting token bucket algorithm'],
      portfolioProject: {
        title: 'Distributed Key-Value Store with Caching',
        description: 'In-memory key-value cache supporting TTL, LRU eviction, and HTTP interface.',
        deliverable: 'Documented engine with concurrent benchmark test suite.',
        techStack: ['Node.js / Go / Python', 'Docker'],
      },
      verifiedResources: [
        {
          id: 'res-ddia',
          title: 'Designing Data-Intensive Applications (O\'Reilly Reference)',
          provider: 'Official Docs',
          url: 'https://dataintensive.net/',
          topic: 'Distributed Systems',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'System Design Mastery & Senior Technical Interviews',
      objectives: ['Master scalable system design: Load balancers, CDNs, Sharding, Microservices', 'Conquer behavioral (STAR method) and coding technical interviews'],
      actionItems: ['Practice designing Twitter feed, Uber dispatch, and YouTube upload system', 'Conduct mock technical interviews with LensBot'],
      practicalExercises: ['Design an end-to-end distributed system on a virtual whiteboard', 'Prepare 5 concise STAR behavioral stories from past projects'],
      portfolioProject: {
        title: 'End-to-End Production Software Project',
        description: 'Comprehensive software project with architecture diagrams, CI/CD, tests, and deployed demo.',
        deliverable: 'Polished GitHub repo with comprehensive README and live demo.',
        techStack: ['TypeScript', 'React', 'Node.js', 'Docker', 'Cloud'],
      },
      verifiedResources: [
        {
          id: 'res-sys-design-primer',
          title: 'The System Design Primer (GitHub)',
          provider: 'Official Docs',
          url: 'https://github.com/donnemartin/system-design-primer',
          topic: 'System Design',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Data Analyst': [
    {
      title: 'Advanced SQL, Relational Modeling & Complex Queries',
      objectives: ['Master window functions (ROW_NUMBER, RANK, DENSE_RANK), CTEs, and recursive queries', 'Extract actionable business insights from normalized transactional data'],
      actionItems: ['Write optimized SQL queries across multi-million row datasets', 'Calculate cohort retention, churn rates, and moving averages in SQL'],
      practicalExercises: ['Write complex windowing SQL queries on sales transaction data', 'Perform cohort retention analysis on customer signup data'],
      portfolioProject: {
        title: 'SaaS Customer Retention & Revenue SQL Analysis',
        description: 'End-to-end SQL analysis examining customer lifetime value (LTV), cohort churn, and MRR expansion.',
        deliverable: 'Documented SQL scripts, schema definitions, and executive summary report.',
        techStack: ['PostgreSQL', 'Metabase / Superset'],
      },
      verifiedResources: [
        {
          id: 'res-sql-docs',
          title: 'PostgreSQL Tutorial & Window Functions Guide',
          provider: 'Official Docs',
          url: 'https://www.postgresqltutorial.com/postgresql-window-function/',
          topic: 'SQL',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Python for Data Analysis (Pandas, NumPy & Data Cleaning)',
      objectives: ['Clean messy datasets, handle missing values, and transform unstructured data', 'Perform exploratory data analysis (EDA) with statistical rigor'],
      actionItems: ['Automate data extraction from CSV, JSON, and external APIs', 'Detect anomalies and outliers using Interquartile Range (IQR) and Z-scores'],
      practicalExercises: ['Perform EDA on a real-world messy dataset and present findings in Jupyter Notebook', 'Merge and aggregate multiple time-series datasets in Pandas'],
      portfolioProject: {
        title: 'Automated E-Commerce Sales Insights Pipeline',
        description: 'Python script and Jupyter notebook that ingests raw sales data, cleans null values, and generates automated summary charts.',
        deliverable: 'Jupyter Notebook on GitHub with markdown explanations and visualizations.',
        techStack: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
      },
      verifiedResources: [
        {
          id: 'res-pandas-docs',
          title: 'Pandas Official User Guide',
          provider: 'Official Docs',
          url: 'https://pandas.pydata.org/docs/user_guide/index.html',
          topic: 'Pandas',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Business Intelligence Dashboards (Power BI / Tableau)',
      objectives: ['Design interactive, intuitive executive dashboards', 'Implement calculated measures, DAX expressions, and drill-down analytics'],
      actionItems: ['Create user-friendly dashboard layouts adhering to visual design best practices', 'Build automated KPI cards showing MoM and YoY percentage changes'],
      practicalExercises: ['Create a multi-tab interactive sales dashboard in Tableau Public / Power BI', 'Design an alert system for underperforming sales regions'],
      portfolioProject: {
        title: 'Executive Healthcare / Supply Chain BI Dashboard',
        description: 'Interactive BI dashboard with real-time slicers, geographic heat maps, and drill-through details for executives.',
        deliverable: 'Tableau Public link or interactive dashboard screenshots with business documentation.',
        techStack: ['Tableau / Power BI', 'SQL', 'Data Modeling'],
      },
      verifiedResources: [
        {
          id: 'res-powerbi-docs',
          title: 'Microsoft Power BI Official Documentation',
          provider: 'Official Docs',
          url: 'https://learn.microsoft.com/en-us/power-bi/',
          topic: 'Power BI',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Data Storytelling, Stakeholder Communication & Interview Prep',
      objectives: ['Translate complex data insights into actionable business recommendations', 'Conquer data analyst case studies and SQL live coding interviews'],
      actionItems: ['Practice communicating findings to non-technical stakeholders', 'Simulate data analyst case interviews with LensBot'],
      practicalExercises: ['Deliver a 5-minute recorded presentation explaining dashboard findings and recommendations', 'Complete timed SQL interview challenges'],
      portfolioProject: {
        title: 'Complete Data Analyst Portfolio Case Study',
        description: 'Deep-dive case study covering business question, data gathering, SQL queries, visualizations, and final business impact.',
        deliverable: 'Published article or PDF slide deck ready for hiring managers.',
        techStack: ['SQL', 'Python', 'Power BI', 'Google Slides / Notion'],
      },
      verifiedResources: [
        {
          id: 'res-data-storytelling',
          title: 'Storytelling with Data (Cole Nussbaumer Knaflic)',
          provider: 'Official Docs',
          url: 'https://www.storytellingwithdata.com/',
          topic: 'Data Visualization',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Data Scientist': [
    {
      title: 'Statistical Foundations, Probability & Exploratory Analysis',
      objectives: ['Master hypothesis testing, p-values, confidence intervals, and distributions', 'Perform thorough exploratory data analysis with statistical validation'],
      actionItems: ['Conduct A/B test analysis and evaluate statistical significance', 'Perform feature engineering on continuous and categorical data'],
      practicalExercises: ['Run two-sample t-tests and Chi-Square tests on customer conversion datasets', 'Implement cross-validation pipelines with Scikit-Learn'],
      portfolioProject: {
        title: 'Statistical A/B Testing & Conversion Analysis Platform',
        description: 'Rigorous statistical analysis of conversion experiments with sample size calculations, power analysis, and confidence bounds.',
        deliverable: 'Jupyter notebook with mathematical breakdowns and business takeaways.',
        techStack: ['Python', 'SciPy', 'Statsmodels', 'Seaborn'],
      },
      verifiedResources: [
        {
          id: 'res-scipy-docs',
          title: 'SciPy Statistical Functions Documentation',
          provider: 'Official Docs',
          url: 'https://docs.scipy.org/doc/scipy/reference/stats.html',
          topic: 'Statistics',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Machine Learning Algorithms & Predictive Modeling',
      objectives: ['Master Regression, Random Forests, XGBoost, and Clustering algorithms', 'Tune hyperparameters, prevent data leakage, and optimize precision/recall'],
      actionItems: ['Build classification and regression pipelines using Scikit-Learn', 'Evaluate models using ROC-AUC, F1-Score, and Confusion Matrices'],
      practicalExercises: ['Train and tune an XGBoost model for customer churn prediction', 'Implement K-Means and DBSCAN clustering on user behavior data'],
      portfolioProject: {
        title: 'Customer Churn & Lifetime Value Prediction Engine',
        description: 'Trained, evaluated ML model predicting churn with 88%+ ROC-AUC, feature importance analysis via SHAP values.',
        deliverable: 'Reproducible ML pipeline code with model serialization and evaluation report.',
        techStack: ['Python', 'Scikit-Learn', 'XGBoost', 'SHAP'],
      },
      verifiedResources: [
        {
          id: 'res-sklearn-docs',
          title: 'Scikit-Learn Official User Guide',
          provider: 'Official Docs',
          url: 'https://scikit-learn.org/stable/user_guide.html',
          topic: 'Machine Learning',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Deep Learning & Natural Language Processing (PyTorch)',
      objectives: ['Master neural network architectures, backpropagation, and loss functions in PyTorch', 'Train NLP models with Hugging Face Transformers and embeddings'],
      actionItems: ['Build a convolutional or transformer model in PyTorch', 'Fine-tune a pretrained Hugging Face model for text sentiment classification'],
      practicalExercises: ['Implement a custom PyTorch Dataset and DataLoader with data augmentation', 'Fine-tune a DistilBERT model on customer reviews'],
      portfolioProject: {
        title: 'Multi-Class Text Classification with Transformers',
        description: 'PyTorch and Hugging Face transformer model classifying support tickets into departments with high precision.',
        deliverable: 'Trained model weights, evaluation metrics, and inference script.',
        techStack: ['Python', 'PyTorch', 'Hugging Face Transformers'],
      },
      verifiedResources: [
        {
          id: 'res-pytorch-docs',
          title: 'PyTorch Official Tutorials',
          provider: 'Official Docs',
          url: 'https://pytorch.org/tutorials/',
          topic: 'PyTorch',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'MLOps, Model Serving & Data Science Interview Mastery',
      objectives: ['Containerize models and serve predictions via FastAPI', 'Track model experiments with MLflow and master machine learning interview rounds'],
      actionItems: ['Package ML model into Docker container with REST API endpoints', 'Practice ML system design (Recommendation system, Search ranking) with LensBot'],
      practicalExercises: ['Deploy an ML inference API to Google Cloud Run or AWS Lambda', 'Conduct mock technical interview on bias-variance tradeoff and regularization'],
      portfolioProject: {
        title: 'Deployed ML Prediction Microservice with FastApi',
        description: 'End-to-end deployed ML microservice providing real-time predictions, input validation with Pydantic, and latency logging.',
        deliverable: 'Live cloud API endpoint with interactive Swagger docs.',
        techStack: ['FastAPI', 'Docker', 'Google Cloud Run', 'MLflow'],
      },
      verifiedResources: [
        {
          id: 'res-fastapi-docs',
          title: 'FastAPI Official Documentation',
          provider: 'Official Docs',
          url: 'https://fastapi.tiangolo.com/',
          topic: 'FastAPI',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'AI Engineer': [
    {
      title: 'Generative AI, Prompt Engineering & Google Gemini API',
      objectives: ['Master structured output, system instructions, and multimodal prompting with Gemini API', 'Enforce strict JSON schema validation and handle rate limits'],
      actionItems: ['Implement few-shot prompting and chain-of-thought reasoning', 'Integrate Google Gemini 1.5 Flash and Pro models in TypeScript and Python'],
      practicalExercises: ['Build a structured document parsing tool using Gemini API with Zod validation', 'Implement audio / image multimodal analysis workflow'],
      portfolioProject: {
        title: 'Automated Document & Invoice Intelligence Engine',
        description: 'Production AI application using Gemini 1.5 Flash to parse complex PDF invoices into structured, validated JSON data.',
        deliverable: 'Deployed full-stack app with structured schema verification.',
        techStack: ['Google Gemini API', 'TypeScript', 'Node.js', 'React'],
      },
      verifiedResources: [
        {
          id: 'res-gemini-docs',
          title: 'Google Gemini API Official Documentation',
          provider: 'Official Docs',
          url: 'https://ai.google.dev/gemini-api/docs',
          topic: 'Gemini API',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Retrieval-Augmented Generation (RAG) & Vector Databases',
      objectives: ['Master text chunking strategies, embeddings, and vector similarity search', 'Build production RAG pipelines with Pinecone, Chroma, or Firestore Vector Search'],
      actionItems: ['Generate dense embeddings with text-embedding-004', 'Implement semantic search, hybrid search (keyword + vector), and re-ranking'],
      practicalExercises: ['Build a vector search index over a collection of technical PDF manuals', 'Implement hallucination mitigation with citations and source groundings'],
      portfolioProject: {
        title: 'Enterprise Knowledge Base RAG Assistant',
        description: 'RAG system answering queries over internal company documents with verified inline citations and source links.',
        deliverable: 'Working RAG pipeline with evaluation metrics for retrieval relevance.',
        techStack: ['Python / TypeScript', 'ChromaDB / Pinecone', 'Gemini API', 'LangChain'],
      },
      verifiedResources: [
        {
          id: 'res-pinecone-rag',
          title: 'Pinecone Retrieval Augmented Generation Guide',
          provider: 'Official Docs',
          url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/',
          topic: 'Vector DB & RAG',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Autonomous AI Agents & Function Calling (Tool Use)',
      objectives: ['Implement multi-agent systems, function calling, and external API tool integration', 'Design safety guardrails, human-in-the-loop validation, and error recovery'],
      actionItems: ['Configure Gemini tool definitions for real-time data fetching', 'Build autonomous agent workflows with memory and task decomposition'],
      practicalExercises: ['Implement an agent that can query SQL databases, fetch weather, and execute web searches', 'Build conversational memory with context window compression'],
      portfolioProject: {
        title: 'Autonomous Research & Task Execution Agent',
        description: 'AI agent capable of breaking down complex goals into subtasks, executing tools, and compiling verified research reports.',
        deliverable: 'Open-source GitHub repository with automated integration tests.',
        techStack: ['Gemini API', 'LangGraph / Custom Agent Loop', 'TypeScript'],
      },
      verifiedResources: [
        {
          id: 'res-function-calling',
          title: 'Gemini Function Calling Official Guide',
          provider: 'Official Docs',
          url: 'https://ai.google.dev/gemini-api/docs/function-calling',
          topic: 'Function Calling',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'AI Evaluation, Safety, Deployment & Interview Mastery',
      objectives: ['Evaluate LLM pipelines using Ragas, prompt benchmarks, and automated test cases', 'Deploy AI microservices with streaming responses and master AI engineering interviews'],
      actionItems: ['Measure faithfulness, answer relevancy, and context precision in RAG', 'Conduct mock technical interview sessions on LLM architectures with LensBot'],
      practicalExercises: ['Build an automated prompt regression test suite', 'Deploy a streaming Server-Sent Events (SSE) AI endpoint on Google Cloud'],
      portfolioProject: {
        title: 'Production AI Gateway with Rate Limiting & Streaming',
        description: 'Robust AI API gateway featuring token usage quotas, streaming responses, input sanitization, and fallback models.',
        deliverable: 'Live cloud deployed endpoint with real-time streaming demonstration.',
        techStack: ['Node.js', 'FastAPI', 'Google Cloud Run', 'Gemini API'],
      },
      verifiedResources: [
        {
          id: 'res-ai-evaluation',
          title: 'Ragas RAG Evaluation Framework',
          provider: 'Official Docs',
          url: 'https://docs.ragas.io/',
          topic: 'AI Evaluation',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Cloud Engineer': [
    {
      title: 'Cloud Architecture & Infrastructure Foundations (GCP / AWS)',
      objectives: ['Master core cloud services: Compute Engine/EC2, VPCs, IAM, and Cloud Storage/S3', 'Implement principle of least privilege in Cloud IAM'],
      actionItems: ['Configure secure Virtual Private Clouds (VPC) with public and private subnets', 'Set up Cloud NAT, firewall rules, and IAM service accounts'],
      practicalExercises: ['Deploy an isolated VPC network with private VM instances', 'Configure fine-grained IAM roles and service account token impersonation'],
      portfolioProject: {
        title: 'Secure Multi-Tier Cloud VPC Network',
        description: 'Cloud network architecture isolating database tier in private subnets with bastion host access and NAT gateways.',
        deliverable: 'Architecture diagram, deployment scripts, and security review document.',
        techStack: ['Google Cloud / AWS', 'Networking', 'IAM'],
      },
      verifiedResources: [
        {
          id: 'res-gcp-docs',
          title: 'Google Cloud Architecture Center',
          provider: 'Official Docs',
          url: 'https://cloud.google.com/architecture',
          topic: 'Cloud Architecture',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Infrastructure as Code (Terraform) & Configuration Management',
      objectives: ['Write declarative infrastructure modules with Terraform', 'Manage state files securely with remote backend locking in Cloud Storage / S3'],
      actionItems: ['Create reusable Terraform modules for VPCs, compute instances, and databases', 'Implement Terraform linting (tflint) and security scanning (tfsec)'],
      practicalExercises: ['Provision a complete cloud cluster from scratch using Terraform', 'Perform state migrations and import existing cloud resources'],
      portfolioProject: {
        title: 'Production Terraform Cloud Infrastructure Blueprint',
        description: 'Complete Terraform code repository provisioning staging and production environments with remote state locking.',
        deliverable: 'Tested Terraform codebase with automated GitHub Actions CI plan verification.',
        techStack: ['Terraform', 'HCL', 'Google Cloud / AWS', 'GitHub Actions'],
      },
      verifiedResources: [
        {
          id: 'res-terraform-docs',
          title: 'Terraform Official Tutorials (HashiCorp)',
          provider: 'Official Docs',
          url: 'https://developer.hashicorp.com/terraform/tutorials',
          topic: 'Terraform',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Containers & Kubernetes Orchestration (GKE / EKS)',
      objectives: ['Master Kubernetes concepts: Pods, Deployments, Services, Ingress, and ConfigMaps', 'Deploy and manage containerized workloads on managed Kubernetes (GKE)'],
      actionItems: ['Author production Kubernetes YAML manifests with resource requests/limits', 'Set up Horizontal Pod Autoscaling (HPA) and rolling updates'],
      practicalExercises: ['Deploy a multi-service web application on Kubernetes with Ingress routing', 'Configure Kubernetes Secrets and volume mounts'],
      portfolioProject: {
        title: 'Highly Available Kubernetes Application Cluster',
        description: 'Production Kubernetes deployment with automated horizontal autoscaling, health probes, and SSL Ingress termination.',
        deliverable: 'Kubernetes manifests, Helm chart, and disaster recovery test log.',
        techStack: ['Kubernetes', 'GKE / EKS', 'Docker', 'Helm'],
      },
      verifiedResources: [
        {
          id: 'res-k8s-docs',
          title: 'Kubernetes Official Documentation',
          provider: 'Official Docs',
          url: 'https://kubernetes.io/docs/home/',
          topic: 'Kubernetes',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Cloud Monitoring, Cost Optimization & Interview Preparation',
      objectives: ['Configure Cloud Monitoring, alerting policies, and centralized log sinks', 'Optimize cloud spend and prepare for Cloud Architect certification/interviews'],
      actionItems: ['Set up uptime checks and PagerDuty / Slack alert notifications', 'Analyze cloud billing reports and implement auto-shutdown policies for dev resources'],
      practicalExercises: ['Simulate a service outage and observe alerting notifications and log traces', 'Conduct mock cloud architect system design interview with LensBot'],
      portfolioProject: {
        title: 'Enterprise Cloud Observability & Alerting Framework',
        description: 'Comprehensive monitoring setup with automated metric dashboards, alert policies, and billing budget threshold alerts.',
        deliverable: 'Monitoring dashboard configuration and runbook documentation.',
        techStack: ['Cloud Monitoring', 'Prometheus', 'Grafana', 'Terraform'],
      },
      verifiedResources: [
        {
          id: 'res-cloud-finops',
          title: 'FinOps Foundation Cloud Cost Management',
          provider: 'Official Docs',
          url: 'https://www.finops.org/framework/',
          topic: 'FinOps',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'Cybersecurity Analyst': [
    {
      title: 'Network Security, Protocols & Traffic Analysis',
      objectives: ['Master OSI model, TCP/IP, DNS, SSL/TLS, and packet inspection with Wireshark', 'Identify port scans, ARP spoofing, and malicious network traffic'],
      actionItems: ['Capture and analyze packet traces using Wireshark and tcpdump', 'Configure firewalls (iptables/UFW) and network access control lists (NACLs)'],
      practicalExercises: ['Analyze a PCAP file containing an intrusion attempt and identify attacker IP and payload', 'Perform network vulnerability scan using Nmap'],
      portfolioProject: {
        title: 'Network Intrusion Detection & Packet Analysis Report',
        description: 'Detailed analysis of simulated cyber attack traffic identifying attack vectors, IOCs, and mitigation recommendations.',
        deliverable: 'Incident report and packet capture analysis documentation.',
        techStack: ['Wireshark', 'Nmap', 'tcpdump', 'Linux'],
      },
      verifiedResources: [
        {
          id: 'res-wireshark-docs',
          title: 'Wireshark User Guide',
          provider: 'Official Docs',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
          topic: 'Network Security',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'SIEM, Log Analysis & Threat Detection (Splunk / Elastic)',
      objectives: ['Configure centralized log collection and ingest authentication and firewall logs', 'Write detection rules for brute force attacks, privilege escalation, and lateral movement'],
      actionItems: ['Write Splunk SPL or Elastic KQL queries to surface anomalies', 'Build real-time security dashboard tracking failed logins and suspicious IPs'],
      practicalExercises: ['Build a detection alert for 5+ failed SSH attempts within 60 seconds', 'Map detected attacker actions to MITRE ATT&CK framework tactics'],
      portfolioProject: {
        title: 'SOC Detection Rule & SIEM Dashboard Suite',
        description: 'Custom SIEM detection rules mapped to MITRE ATT&CK techniques with an automated alert dashboard.',
        deliverable: 'SIEM query exports, dashboard screenshots, and alerting rule definitions.',
        techStack: ['Splunk / Elastic SIEM', 'MITRE ATT&CK', 'Syslog'],
      },
      verifiedResources: [
        {
          id: 'res-mitre-attack',
          title: 'MITRE ATT&CK Framework',
          provider: 'Official Docs',
          url: 'https://attack.mitre.org/',
          topic: 'Threat Intelligence',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Vulnerability Management & Web Application Security',
      objectives: ['Master OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR, SSRF)', 'Perform automated vulnerability scanning with Nessus / OpenVAS / OWASP ZAP'],
      actionItems: ['Scan test applications for security misconfigurations', 'Author structured vulnerability remediation reports for development teams'],
      practicalExercises: ['Find and remediate an SQL injection and XSS vulnerability in a sample application', 'Configure Content Security Policy (CSP) headers'],
      portfolioProject: {
        title: 'Comprehensive Web Application Vulnerability Assessment',
        description: 'Vulnerability assessment report detailing findings, severity ratings (CVSS v3), evidence, and technical remediation instructions.',
        deliverable: 'Professional PDF security audit report adhering to industry standards.',
        techStack: ['OWASP ZAP', 'Burp Suite Community', 'CVSS'],
      },
      verifiedResources: [
        {
          id: 'res-owasp-top10',
          title: 'OWASP Web Security Testing Guide',
          provider: 'Official Docs',
          url: 'https://owasp.org/www-project-web-security-testing-guide/',
          topic: 'AppSec',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Incident Response, Forensics & Cybersecurity Interviews',
      objectives: ['Follow NIST SP 800-61 incident handling steps: Preparation, Detection, Containment, Eradication, Recovery', 'Master cybersecurity technical and scenario-based interview questions'],
      actionItems: ['Create an incident response playbook for ransomware and phishing attacks', 'Simulate incident triage and post-mortem review with LensBot'],
      practicalExercises: ['Conduct digital forensics triage on a compromised virtual machine disk image', 'Practice responding to live scenario questions ("A server is beaconing to an unknown IP, what do you do?")'],
      portfolioProject: {
        title: 'Incident Response Playbook & Post-Mortem Analysis',
        description: 'Enterprise incident response playbook for compromised credentials and data breach containment.',
        deliverable: 'Complete operational playbook and sample post-incident review.',
        techStack: ['NIST Framework', 'Forensics Tools', 'Incident Response'],
      },
      verifiedResources: [
        {
          id: 'res-nist-ir',
          title: 'NIST Computer Security Incident Handling Guide (SP 800-61)',
          provider: 'Official Docs',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final',
          topic: 'Incident Response',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
  'DevOps Engineer': [
    {
      title: 'Linux Systems Administration, Shell Scripting & Git Ops',
      objectives: ['Master Linux system administration: processes, networking, permissions, cron, systemd', 'Write robust Bash and Python automation scripts for operational tasks'],
      actionItems: ['Automate system maintenance and backup routines with Bash', 'Implement GitOps branching strategies (Trunk-based development, Semantic Versioning)'],
      practicalExercises: ['Write a Bash script that monitors disk usage and automatically cleans old log files', 'Configure custom systemd service with automatic restarts'],
      portfolioProject: {
        title: 'Automated Linux Server Provisioning & Hardening Suite',
        description: 'Shell scripts and Ansible playbooks automating server configuration, firewall setup, and user permissions.',
        deliverable: 'Tested automation repository with automated verification script.',
        techStack: ['Linux', 'Bash', 'Ansible', 'Git'],
      },
      verifiedResources: [
        {
          id: 'res-linux-guide',
          title: 'Debian / Ubuntu Server Administration Guide',
          provider: 'Official Docs',
          url: 'https://ubuntu.com/server/docs',
          topic: 'Linux',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Containerization (Docker) & Continuous Integration (CI/CD)',
      objectives: ['Write optimized multi-stage Dockerfiles with minimal image size and vulnerability surface', 'Build automated CI/CD pipelines with GitHub Actions or GitLab CI'],
      actionItems: ['Scan Docker images for vulnerabilities with Trivy / Snyk', 'Configure automated test execution, linting, and artifact publishing on git push'],
      practicalExercises: ['Reduce a Docker container image size from 800MB to under 80MB using Alpine / Distroless', 'Build a matrix testing pipeline running across multiple Node and Python versions'],
      portfolioProject: {
        title: 'Automated CI/CD Pipeline for Microservices',
        description: 'Production GitHub Actions workflow building Docker images, running unit tests, scanning vulnerabilities, and pushing to Container Registry.',
        deliverable: 'Working GitHub Actions YAML workflows with green build badges.',
        techStack: ['Docker', 'GitHub Actions', 'Trivy', 'Container Registry'],
      },
      verifiedResources: [
        {
          id: 'res-github-actions',
          title: 'GitHub Actions Official Documentation',
          provider: 'Official Docs',
          url: 'https://docs.github.com/en/actions',
          topic: 'CI/CD',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Kubernetes Cluster Management & Helm Deployments',
      objectives: ['Deploy, scale, and update applications using Kubernetes and Helm charts', 'Implement blue-green and canary deployments with zero downtime'],
      actionItems: ['Package complex applications into configurable Helm charts', 'Set up ingress controllers with automated Let\'s Encrypt SSL certificates'],
      practicalExercises: ['Deploy a sample app using Helm with separate values-staging and values-prod files', 'Execute a rolling update and verify zero dropped requests'],
      portfolioProject: {
        title: 'Production Helm Chart & Kubernetes Deployment Suite',
        description: 'Reusable Helm chart supporting custom probes, horizontal autoscaling, and ingress routing.',
        deliverable: 'Helm chart repository and deployment demonstration video.',
        techStack: ['Kubernetes', 'Helm', 'Ingress-NGINX', 'Cert-Manager'],
      },
      verifiedResources: [
        {
          id: 'res-helm-docs',
          title: 'Helm Official Documentation',
          provider: 'Official Docs',
          url: 'https://helm.sh/docs/',
          topic: 'Helm',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
    {
      title: 'Observability (Prometheus, Grafana), SRE & DevOps Interviews',
      objectives: ['Implement end-to-end monitoring, metrics collection, and alerting with Prometheus and Grafana', 'Understand SRE principles: SLIs, SLOs, error budgets, and master DevOps interviews'],
      actionItems: ['Export custom metrics from application services', 'Configure alert rules notifying on elevated HTTP 5xx error rates'],
      practicalExercises: ['Deploy Prometheus and Grafana stack with pre-configured dashboard templates', 'Conduct mock DevOps troubleshooting interview with LensBot'],
      portfolioProject: {
        title: 'Production Observability & SLA Monitoring Stack',
        description: 'Docker Compose and Kubernetes monitoring stack with Prometheus, Grafana, Alertmanager, and Node Exporter.',
        deliverable: 'Grafana dashboards and alerting rule definitions on GitHub.',
        techStack: ['Prometheus', 'Grafana', 'Alertmanager', 'Docker'],
      },
      verifiedResources: [
        {
          id: 'res-sre-book',
          title: 'Google Site Reliability Engineering (SRE) Book',
          provider: 'Official Docs',
          url: 'https://sre.google/sre-book/table-of-contents/',
          topic: 'Site Reliability Engineering',
          type: 'documentation',
          isOfficial: true,
        },
      ],
    },
  ],
};

/**
 * Generates personalized 4-to-8 week learning roadmap tailored to user's target role,
 * missing skills from resume analysis, and weekly availability.
 */
export async function generatePersonalizedRoadmap(
  userId: string,
  targetRole: RoleType,
  missingSkills: string[],
  weeklyHours: number = 10,
  preserveCompleted: boolean = true
): Promise<RoadmapMilestone[]> {
  const templates = ROLE_CURRICULUM_TEMPLATES[targetRole] || ROLE_CURRICULUM_TEMPLATES['Full-Stack Developer'];

  // Check if existing roadmap exists to preserve completed items
  const existingMilestones = await getUserRoadmap(userId);
  const completedMap = new Map<number, boolean>();
  if (preserveCompleted) {
    existingMilestones.forEach((m) => {
      if (m.completed) {
        completedMap.set(m.weekNumber, true);
      }
    });
  }

  // Adjust hours based on user's availability
  const hoursPerWeek = Math.max(5, Math.min(40, weeklyHours));

  const milestones: RoadmapMilestone[] = templates.map((tmpl, index) => {
    const weekNumber = index + 1;
    const isCompleted = completedMap.get(weekNumber) || false;

    // Enhance action items if specific missing skills correspond to this milestone
    const enhancedActions = [...tmpl.actionItems];
    if (index === 0 && missingSkills.length > 0) {
      enhancedActions.unshift(`Target priority skill gap: Master ${missingSkills.slice(0, 2).join(' & ')}`);
    }

    return {
      id: `milestone-week-${weekNumber}`,
      userId,
      weekNumber,
      title: `Week ${weekNumber}: ${tmpl.title}`,
      estimatedHours: hoursPerWeek,
      objectives: tmpl.objectives,
      actionItems: enhancedActions,
      practicalExercises: tmpl.practicalExercises,
      portfolioProject: tmpl.portfolioProject,
      verifiedResources: tmpl.verifiedResources,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
  });

  // Save to Firestore subcollection users/{userId}/roadmap/{milestoneId}
  const batch = writeBatch(db);
  for (const milestone of milestones) {
    const docRef = doc(db, 'users', userId, 'roadmap', milestone.id);
    batch.set(docRef, milestone, { merge: true });
  }
  try {
    const commitPromise = batch.commit();
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore batch commit timeout')), 4000)
    );
    await Promise.race([commitPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Firestore roadmap batch save background queue:', err);
  }

  return milestones;
}

/**
 * Toggle milestone completion status and sync with Firestore
 */
export async function toggleMilestoneCompletion(
  userId: string,
  milestoneId: string,
  completed: boolean
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'roadmap', milestoneId);
  try {
    const savePromise = setDoc(
      docRef,
      {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore toggleMilestone timeout')), 4000)
    );
    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    console.warn('Firestore toggleMilestone background queue:', err);
  }
}

/**
 * Get all roadmap milestones for user
 */
export async function getUserRoadmap(userId: string): Promise<RoadmapMilestone[]> {
  if (!userId) return [];
  const colRef = collection(db, 'users', userId, 'roadmap');
  const q = query(colRef, orderBy('weekNumber', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RoadmapMilestone);
}

/**
 * Real-time listener for user roadmap progress with offline and error resiliency
 */
export function subscribeUserRoadmap(
  userId: string,
  callback: (milestones: RoadmapMilestone[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const colRef = collection(db, 'users', userId, 'roadmap');
  const q = query(colRef, orderBy('weekNumber', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as RoadmapMilestone);
      callback(list);
    },
    (err) => {
      console.warn('Roadmap subscription error (offline or unauthenticated):', err);
      if (onError) onError(err);
      else callback([]);
    }
  );
}
