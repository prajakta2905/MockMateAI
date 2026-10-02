export const SAMPLE_RESUMES = [
  {
    id: 'fullstack-alex',
    name: 'Alex Rivera',
    targetRole: 'Senior Full Stack Engineer',
    experienceLevel: 'Senior (5+ Years)',
    email: 'alex.rivera@example.com',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    summary: 'Senior Full Stack Engineer with 5+ years of experience designing high-scale React/Next.js and Node.js microservices. Proven track record optimizing web performance and building resilient cloud architectures.',
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2019'
      }
    ],
    skills: {
      frontend: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'WebSockets'],
      backend: ['Node.js', 'Express', 'NestJS', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'RESTful APIs'],
      cloudDevOps: ['AWS (ECS, Lambda, S3)', 'Docker', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Terraform'],
      practices: ['System Design', 'Microservices', 'TDD', 'Agile/Scrum', 'Performance Optimization']
    },
    projects: [
      {
        name: 'JobLynk AI Career Platform',
        description: 'End-to-end recruitment platform with real-time job matching and AI-assisted candidate evaluation.',
        techStack: ['Next.js 14', 'Node.js', 'PostgreSQL', 'Redis', 'JWT Auth', 'Docker'],
        keyAchievements: [
          'Architected stateless JWT authentication with automated token refresh & Redis session blacklist for instant revoking.',
          'Reduced API latency by 45% using Redis caching for high-frequency search queries.',
          'Integrated live WebSocket notifications handling 50k+ concurrent active users.'
        ]
      },
      {
        name: 'CloudPulse Real-time Metrics Dashboard',
        description: 'Distributed monitoring and log visualization platform for Kubernetes clusters.',
        techStack: ['React', 'TypeScript', 'Go', 'TimescaleDB', 'GraphQL', 'Tailwind CSS'],
        keyAchievements: [
          'Rendered 100k+ real-time telemetry data points at 60fps using custom Canvas rendering.',
          'Designed modular GraphQL subscription pipelines for low-latency metric ingestion.'
        ]
      }
    ],
    experience: [
      {
        role: 'Senior Software Engineer',
        company: 'Apex Technologies',
        period: '2022 - Present',
        bullets: [
          'Led core engineering squad of 6 building customer-facing microservices serving 2M+ monthly users.',
          'Spearheaded migration from legacy monolith to Next.js & NestJS microservices, improving Core Web Vitals by 35%.'
        ]
      },
      {
        role: 'Full Stack Developer',
        company: 'Vanguard Systems',
        period: '2019 - 2022',
        bullets: [
          'Built RESTful APIs and responsive React dashboards handling over $12M in monthly e-commerce transactions.',
          'Maintained 99.95% uptime by designing automated failover protocols.'
        ]
      }
    ],
    achievements: [
      'Top Performer Award 2023 at Apex Technologies',
      'Open Source Contributor to Next.js and Tailwind ecosystem',
      'AWS Certified Solutions Architect – Associate'
    ],
    rawText: `ALEX RIVERA - Senior Full Stack Engineer
Email: alex.rivera@example.com | Location: San Francisco, CA

SUMMARY
Senior Full Stack Engineer with 5+ years of experience designing high-scale React/Next.js and Node.js microservices.

EDUCATION
B.S. in Computer Science - UC Berkeley (2019)

TECHNICAL SKILLS
- Frontend: React 19, Next.js, TypeScript, Tailwind CSS, Redux Toolkit, WebSockets
- Backend: Node.js, Express, NestJS, PostgreSQL, MongoDB, Redis, GraphQL
- Cloud & DevOps: AWS (ECS, Lambda, S3), Docker, Kubernetes, GitHub Actions

KEY PROJECTS
1. JobLynk AI Career Platform (Next.js, Node.js, PostgreSQL, Redis, JWT Auth, Docker)
- Architected stateless JWT authentication with automated token refresh and Redis session blacklist.
- Reduced API latency by 45% using Redis multi-tier caching for high-frequency search queries.
- Integrated live WebSocket notifications handling 50k+ concurrent active users.

2. CloudPulse Real-time Metrics Dashboard (React, TypeScript, Go, TimescaleDB, GraphQL)
- Rendered 100k+ real-time telemetry data points at 60fps using custom Canvas rendering.
- Designed modular GraphQL subscription pipelines for low-latency metric ingestion.

WORK EXPERIENCE
Senior Software Engineer | Apex Technologies (2022 - Present)
- Led core engineering squad of 6 building customer-facing microservices serving 2M+ monthly users.
- Spearheaded migration from legacy monolith to Next.js & NestJS microservices, improving Core Web Vitals by 35%.

Full Stack Developer | Vanguard Systems (2019 - 2022)
- Built RESTful APIs and responsive React dashboards handling $12M+ monthly transactions.`
  },
  {
    id: 'ai-maya',
    name: 'Maya Chen',
    targetRole: 'AI / Machine Learning Engineer',
    experienceLevel: 'Mid-Senior (4 Years)',
    email: 'maya.chen@example.com',
    location: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    summary: 'Machine Learning Engineer specializing in LLM fine-tuning, RAG pipelines, and high-throughput model deployment. Experienced in LangChain, PyTorch, Vector DBs, and FastAPI.',
    education: [
      {
        degree: 'M.S. in Artificial Intelligence',
        institution: 'University of Washington',
        year: '2021'
      }
    ],
    skills: {
      aiMl: ['PyTorch', 'Transformers', 'Hugging Face', 'LangChain', 'LlamaIndex', 'vLLM', 'LoRA / QLoRA'],
      vectorData: ['Pinecone', 'Qdrant', 'ChromaDB', 'PostgreSQL pgvector', 'Pandas', 'NumPy'],
      engineering: ['Python', 'FastAPI', 'Docker', 'Kubernetes', 'Triton Inference Server', 'GCP Vertex AI']
    },
    projects: [
      {
        name: 'NeuroFlow Multi-Modal RAG Engine',
        description: 'Enterprise hybrid retrieval system querying 10M+ documents with sub-150ms latency.',
        techStack: ['Python', 'FastAPI', 'Qdrant', 'LlamaIndex', 'Gemini / Claude APIs', 'Docker'],
        keyAchievements: [
          'Engineered hybrid BM25 + dense embedding vector search with reranking using Cohere.',
          'Reduced hallucination rates by 38% through context compression and citation verification filters.'
        ]
      },
      {
        name: 'DocuQuery AI',
        description: 'Automated legal document summarizer and compliance analyzer powered by fine-tuned Mistral 7B.',
        techStack: ['PyTorch', 'Hugging Face', 'QLoRA', 'vLLM', 'FastAPI'],
        keyAchievements: [
          'Fine-tuned open-source LLM using 4-bit QLoRA on domain legal texts, cutting inference cost by 70%.'
        ]
      }
    ],
    experience: [
      {
        role: 'Machine Learning Engineer',
        company: 'Synthetix AI Lab',
        period: '2022 - Present',
        bullets: [
          'Designed scalable RAG pipelines serving 500k queries daily with 99.9% uptime.',
          'Optimized LLM inference throughput 3x using vLLM and dynamic batching on Triton servers.'
        ]
      }
    ],
    achievements: [
      'Published paper on Efficient Vector Search at NeurIPS Workshop 2023',
      '1st Place at GenAI Global Hackathon 2024'
    ],
    rawText: `MAYA CHEN - AI / Machine Learning Engineer
Email: maya.chen@example.com | Location: Seattle, WA

SUMMARY
Machine Learning Engineer specializing in LLM fine-tuning, RAG pipelines, and high-throughput model deployment.

EDUCATION
M.S. in Artificial Intelligence - University of Washington (2021)

TECHNICAL SKILLS
- AI/ML: PyTorch, Transformers, Hugging Face, LangChain, LlamaIndex, vLLM, LoRA/QLoRA
- Vector & Data: Pinecone, Qdrant, ChromaDB, pgvector, Pandas, NumPy
- Backend & Cloud: Python, FastAPI, Docker, Kubernetes, Triton Inference Server, GCP

KEY PROJECTS
1. NeuroFlow Multi-Modal RAG Engine (FastAPI, Qdrant, LlamaIndex, Gemini/Claude APIs)
- Engineered hybrid BM25 + dense embedding vector search with sub-150ms retrieval latency.
- Reduced hallucination rates by 38% through context compression and citation verification filters.

2. DocuQuery AI (PyTorch, Hugging Face, QLoRA, vLLM)
- Fine-tuned open-source LLM using 4-bit QLoRA on domain legal texts, cutting inference cost by 70%.

WORK EXPERIENCE
Machine Learning Engineer | Synthetix AI Lab (2022 - Present)
- Designed scalable RAG pipelines serving 500k queries daily with 99.9% uptime.
- Optimized LLM inference throughput 3x using vLLM and dynamic batching.`
  },
  {
    id: 'frontend-sarah',
    name: 'Sarah Jenkins',
    targetRole: 'Senior Frontend Architect',
    experienceLevel: 'Senior (6 Years)',
    email: 'sarah.j@example.com',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    summary: 'Product-minded Frontend Engineer passionate about design systems, web performance, and accessible, responsive user interfaces. Expert in React, TypeScript, and micro-frontends.',
    education: [
      {
        degree: 'B.S. in Software Engineering',
        institution: 'University of Texas at Austin',
        year: '2018'
      }
    ],
    skills: {
      frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Radix UI', 'Storybook', 'Vite'],
      statePerformance: ['Zustand', 'TanStack Query', 'Web Vitals Optimization', 'Tree Shaking', 'Micro-Frontends'],
      testingTools: ['Jest', 'Vitest', 'Playwright', 'Cypress', 'Git', 'Webpack / Turbopack']
    },
    projects: [
      {
        name: 'OmniUI Design System',
        description: 'Accessible, multi-brand React component library used across 14 product squads.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Storybook', 'npm packages'],
        keyAchievements: [
          'Built 60+ WCAG AAA compliant components with zero external CSS dependencies.',
          'Reduced development cycle time across squads by 40% through unified tokens and documentation.'
        ]
      }
    ],
    experience: [
      {
        role: 'Lead Frontend Engineer',
        company: 'Elevate Digital',
        period: '2021 - Present',
        bullets: [
          'Spearheaded frontend architecture for enterprise SaaS platform with 1M+ active enterprise seats.',
          'Improved Lighthouse performance scores from 54 to 98 across core conversion pages.'
        ]
      }
    ],
    achievements: [
      'Speaker at React Global Summit 2024',
      'Author of open-source headless UI library with 4k+ GitHub stars'
    ],
    rawText: `SARAH JENKINS - Senior Frontend Architect
Email: sarah.j@example.com | Location: Austin, TX

SUMMARY
Product-minded Frontend Engineer passionate about design systems, web performance, and accessible UI.

SKILLS
React, TypeScript, Next.js, Tailwind CSS, Framer Motion, Radix UI, Storybook, TanStack Query, Playwright

PROJECTS
OmniUI Design System (React, TypeScript, Tailwind CSS, Radix UI, Storybook)
- Built 60+ WCAG AAA compliant components with zero external CSS dependencies.
- Reduced development cycle time across squads by 40% through unified tokens.

EXPERIENCE
Lead Frontend Engineer | Elevate Digital (2021 - Present)
- Spearheaded frontend architecture for enterprise SaaS platform with 1M+ active enterprise seats.
- Improved Lighthouse performance scores from 54 to 98 across core conversion pages.`
  },
  {
    id: 'product-marcus',
    name: 'Marcus Vance',
    targetRole: 'Senior Product Manager / Tech Lead',
    experienceLevel: 'Lead (7 Years)',
    email: 'marcus.vance@example.com',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    summary: 'Technical Product Manager with an engineering background. Specialized in AI product roadmaps, cross-functional execution, GTM strategy, and KPI-driven experimentation.',
    education: [
      {
        degree: 'B.S. in Computer Science & Economics',
        institution: 'Columbia University',
        year: '2017'
      }
    ],
    skills: {
      strategy: ['Product Roadmapping', 'User Research', 'GTM Strategy', 'Data-driven Prioritization', 'A/B Testing'],
      techUnderstanding: ['System Architecture', 'APIs & Integrations', 'AI/ML Product Design', 'SQL & Analytics'],
      tools: ['Mixpanel', 'Amplitude', 'Jira', 'Figma', 'Postman', 'Tableau']
    },
    projects: [
      {
        name: 'AI Smart Search & Recommendation Engine',
        description: 'Transformed search UX into conversational intent-based discovery for fintech SaaS.',
        techStack: ['Generative AI', 'Vector Search', 'Mixpanel', 'A/B Testing Framework'],
        keyAchievements: [
          'Drove 28% increase in session search-to-action conversion within 3 months of launch.',
          'Defined user discovery feedback loops that decreased user churn by 14%.'
        ]
      }
    ],
    experience: [
      {
        role: 'Senior Product Manager',
        company: 'Fintech Vanguard',
        period: '2021 - Present',
        bullets: [
          'Owned $20M ARR product line, managing roadmap across 3 distributed engineering squads.',
          'Led launch of automated compliance feature that onboarded 120+ enterprise clients in Q1.'
        ]
      }
    ],
    achievements: [
      'Product of the Year Award 2023 at Fintech Vanguard',
      'Certified Scrum Product Owner (CSPO)'
    ],
    rawText: `MARCUS VANCE - Senior Product Manager / Tech Lead
Email: marcus.vance@example.com | Location: New York, NY

SUMMARY
Technical Product Manager with engineering background. Specialized in AI product roadmaps, GTM, and KPIs.

SKILLS
Product Roadmapping, User Research, GTM Strategy, A/B Testing, System Architecture, SQL, Mixpanel, Figma

PROJECTS
AI Smart Search & Recommendation Engine
- Drove 28% increase in search-to-action conversion within 3 months of launch.
- Decreased user churn by 14% through continuous feedback loops.

EXPERIENCE
Senior Product Manager | Fintech Vanguard (2021 - Present)
- Owned $20M ARR product line across 3 distributed engineering squads.`
  }
];
