import type { SkillBranch } from '@/types'

export const skillBranches: SkillBranch[] = [
  {
    name: 'Frontend',
    color: 'var(--skill)',
    skills: [
      {
        name: 'React',
        proficiency: 'advanced',
        description: 'Component-based UIs, hooks, and state for SPAs and web apps',
        icon: 'react',
      },
      {
        name: 'Next.js',
        proficiency: 'advanced',
        description: 'SSR, static generation, API routes, and file-based routing',
        icon: 'nextdotjs',
      },
      {
        name: 'Tailwind CSS',
        proficiency: 'advanced',
        description: 'Utility-first CSS with responsive breakpoints and design tokens',
        icon: 'tailwindcss',
      },
      {
        name: 'Figma',
        proficiency: 'intermediate',
        description: 'Wireframes, high-fidelity mockups, and interactive prototypes',
        icon: 'figma',
      },
      {
        name: 'TypeScript',
        proficiency: 'advanced',
        description: 'Static typing and interfaces for JavaScript',
        icon: 'typescript',
      },
      {
        name: 'JavaScript',
        proficiency: 'advanced',
        description: 'ES6+, async/await, DOM APIs, and cross-browser scripting',
        icon: 'javascript',
      },
      {
        name: 'HTML5',
        proficiency: 'advanced',
        description: 'Semantic markup, forms, and ARIA for accessibility',
        icon: 'html5',
      },
    ],
  },
  {
    name: 'Backend',
    color: 'var(--project)',
    skills: [
      {
        name: 'Node.js',
        proficiency: 'advanced',
        description: 'Event-driven JavaScript runtime for servers and tooling',
        icon: 'nodedotjs',
      },
      {
        name: 'Express.js',
        proficiency: 'advanced',
        description: 'REST APIs, routing, and middleware for Node backends',
        icon: 'express',
      },
      {
        name: 'FastAPI',
        proficiency: 'advanced',
        description: 'Async Python web framework with OpenAPI and type hints',
        icon: 'fastapi',
      },
      {
        name: 'Flask',
        proficiency: 'intermediate',
        description: 'Lightweight Python web framework for APIs and web apps',
        icon: 'flask',
      },
      {
        name: 'MongoDB',
        proficiency: 'advanced',
        description: 'Document database with flexible schemas and aggregation',
        icon: 'mongodb',
      },
      {
        name: 'Firebase',
        proficiency: 'advanced',
        description: 'Auth, Firestore, and real-time data for web and mobile',
        icon: 'firebase',
      },
      {
        name: 'SQL',
        proficiency: 'advanced',
        description: 'Relational databases, queries, joins, and reporting',
        icon: 'postgresql',
      },
    ],
  },
  {
    name: 'Machine Learning',
    color: 'var(--experience)',
    skills: [
      {
        name: 'Python',
        proficiency: 'advanced',
        description: 'Scripting, data pipelines, and data science workflows',
        icon: 'python',
      },
      {
        name: 'PyTorch',
        proficiency: 'advanced',
        description: 'Deep learning with tensors, autograd, and custom training',
        icon: 'pytorch',
      },
      {
        name: 'TensorFlow',
        proficiency: 'intermediate',
        description: 'Deep learning framework with Keras and model deployment',
        icon: 'tensorflow',
      },
      {
        name: 'scikit-learn',
        proficiency: 'advanced',
        description: 'Classical ML: classification, regression, and evaluation',
        icon: 'scikitlearn',
      },
      {
        name: 'NumPy & Pandas',
        proficiency: 'advanced',
        description: 'Numerical arrays, DataFrames, and data preprocessing',
        icon: 'numpy',
      },
      {
        name: 'Feature Engineering',
        proficiency: 'advanced',
        description: 'Designing and transforming features for ML models',
        icon: 'pandas',
      },
      {
        name: 'Neural Networks',
        proficiency: 'intermediate',
        description: 'Architecture design, training, and hyperparameter tuning',
        icon: 'keras',
      },
    ],
  },
]
