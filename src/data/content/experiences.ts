import type { ExperienceEntry } from '@/types'

export const experiences: ExperienceEntry[] = [
  {
    id: 'jyj',
    type: 'job',
    title: 'Full Stack Engineer (Contract)',
    subtitle: 'JyJ Med Spa — Miami, FL',
    period: 'Mar. – May 2022',
    details: [
      'Joined a small medical spa at an early stage and became their "technical team"—responsible for translating their ideas about branding, services, and operations into real software they could use day to day.',
      'Designed and built the public marketing website using React and TypeScript so new clients could easily see services, pricing, and promotions. I set up domain, DNS, and hosting on GoDaddy so the site was fast, secure, and available on both desktop and mobile.',
      'Spent time with the staff to understand how they were tracking products and supplies (mostly through spreadsheets and memory), then mapped that into a simple but structured inventory system that fit the way they already worked.',
      'Inventory system objective: replace spreadsheet-and-memory tracking with one real-time desktop app—searchable SKUs, low-stock alerts, multi-user workflows, and Firebase login so only approved staff could change counts, giving owners confidence in accurate numbers.',
      'Implemented a cross-platform desktop inventory management application with Electron on the frontend and a Python Flask backend. The app let staff adjust quantities, view low-stock alerts, and search across 20+ product SKUs in real time instead of manually reconciling notes and spreadsheets.',
      'Integrated Firebase Authentication so that only approved users could log in and change inventory, reducing the chance of accidental edits and giving the owners more confidence in their numbers.',
      'Packaged the system as an installer that non-technical staff could run themselves, documented the basic workflows, and walked the team through setup so adoption was smooth and they didn’t need an engineer on call for every small issue.',
    ],
    badges: ['react', 'typescript', 'tailwindcss', 'electron', 'python', 'flask', 'firebase', 'html5', 'css3'],
  },
  {
    id: 'mercor',
    type: 'job',
    title: 'Software Engineer, AI Evaluation (Contract)',
    subtitle: 'Mercor — Remote',
    period: 'Jan. – Apr. 2023',
    details: [
      'Worked with a distributed team to evaluate how well large language models could solve real programming interview-style problems, focusing on both correctness and how robust the solutions were to edge cases.',
      'Reviewed more than 200 AI-generated solutions across algorithms, data structures, operating systems, and databases, treating each one like a code review: I checked logic, performance characteristics, readability, and failure modes.',
      'Implemented clean reference solutions and test harnesses in languages like Python, C, C++, Java, and TypeScript, so I could automatically compare the AI’s answers to known-good implementations instead of eyeballing the results.',
      'Created systematic test cases that stressed boundary conditions (empty inputs, large inputs, invalid states, concurrency issues) to see where the AI’s code would silently fail or behave unpredictably.',
      'Tracked recurring error patterns—such as off-by-one indexing, incorrect complexity assumptions, missing error handling, and unsafe memory usage—and summarized them in structured feedback that helped the team refine evaluation criteria.',
      'Contributed to internal documentation and scoring rubrics so other evaluators could apply the same standards consistently, turning one-off observations into a repeatable evaluation process for future model iterations.',
    ],
    badges: ['python', 'c', 'cplusplus', 'java', 'typescript', 'linux'],
  },
  {
    id: 'fiu',
    type: 'education',
    title: 'Bachelor of Science in Computer Engineering',
    subtitle: 'Florida International University — Miami, FL',
    period: 'Graduated Dec 2025',
    details: [
      'Completed a Computer Engineering degree that combined low-level hardware and systems knowledge with modern software development, giving me a solid understanding of how code actually runs on real machines.',
      'Took core courses in data structures, algorithms, operating systems, computer architecture, and embedded systems, which trained me to think about performance, memory, and reliability—not just getting code to run.',
      'Studied and implemented machine learning techniques in Python, working with libraries like NumPy and PyTorch to build models that could make predictions from noisy, real-world data.',
      'Built team projects that connected sensors, microcontrollers, and software dashboards, such as systems that streamed live telemetry and visualized it in ways that were useful to non-technical teammates.',
      'Gained practical experience with databases and cloud platforms (PostgreSQL, AWS, Azure, Firebase, and modern web stacks) and used them to build end-to-end applications rather than isolated class assignments.',
      'Used what I learned in class to drive personal projects, like a sports-betting pricing engine and a Formula SAE telemetry platform, which helped me move from theory to building tools that people could actually use.',
    ],
    badges: ['python', 'c', 'cplusplus', 'java', 'typescript', 'react', 'linux', 'pytorch', 'numpy', 'postgresql', 'amazonaws', 'azure', 'fastapi', 'firebase'],
  },
]
