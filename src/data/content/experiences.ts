import type { ExperienceEntry } from '@/types'

export const experiences: ExperienceEntry[] = [
  {
    id: 'jyj',
    type: 'job',
    title: 'Full Stack Engineer (Contract)',
    subtitle: 'JyJ Med Spa — Miami, FL',
    period: 'Mar. – May 2022',
    mission:
      'Translate business goals and day-to-day workflows into production-ready software—building both the public-facing marketing site and an internal inventory system that staff could actually use.',
    system:
      'React/TypeScript website with domain/DNS + hosting setup, plus an Electron + Python (Flask) inventory application. The desktop app integrates Firebase Authentication for access control, enables real-time SKU updates, and provides the workflows needed to replace spreadsheets with a reliable multi-user data source.',
    impact: [
      'Served as the spa’s technical partner—turning branding, services, and operations into software the team used daily.',
      'Delivered a React/TypeScript marketing site with GoDaddy domain, DNS, and hosting; services and pricing worked on desktop and mobile.',
      'Shipped an Electron + Flask inventory app with Firebase auth: searchable SKUs, live counts, low-stock alerts, and multi-user workflows that replaced spreadsheets.',
      'Packaged an installer, documented workflows, and trained staff so adoption didn’t depend on an engineer on call.',
    ],
    keyLearnings: [
      'Small-business software wins when workflows match how staff already work—schema follows the counter, not the other way around.',
      'Splitting a public site from a restricted inventory app keeps marketing flexible without exposing internal data.',
      'Auth and audit trails aren’t bureaucracy—they’re how owners trust the numbers.',
    ],
    badges: ['react', 'typescript', 'tailwindcss', 'electron', 'python', 'flask', 'firebase', 'html5', 'css3'],
  },
  {
    id: 'mercor',
    type: 'job',
    title: 'Software Engineer, AI Evaluation (Contract)',
    subtitle: 'Mercor — Remote',
    period: 'Jan. – Apr. 2023',
    mission:
      'Evaluate whether large language models produce correct, robust solutions—then turn recurring failure patterns into clear feedback and repeatable evaluation criteria.',
    system:
      'A cross-language evaluation workflow using Python/C/C++/Java/TypeScript reference solutions and automated test harnesses. I generated boundary-focused test cases (edge cases, invalid states, concurrency), benchmarked outputs against known-good implementations, and summarized error patterns (off-by-one, incorrect complexity assumptions, missing error handling) into structured guidance for model iteration.',
    impact: [
      'Reviewed 200+ LLM-generated solutions across algorithms, data structures, OS, and databases with code-review rigor—correctness, complexity, readability, and failure modes.',
      'Implemented reference solutions and harnesses in Python, C, C++, Java, and TypeScript for automated comparison to known-good code.',
      'Stress-tested boundary conditions—empty/large/invalid inputs and concurrency—to expose silent failures and unstable behavior.',
      'Documented recurring error patterns and scoring rubrics so evaluation stayed consistent as models iterated.',
    ],
    keyLearnings: [
      'Model evaluation is a systems problem: without harnesses and oracles, “looks right” isn’t evidence.',
      'The same class of bugs repeats—off-by-one, bad assumptions about complexity, missing error handling—until rubrics call them out.',
      'Good feedback to model teams is structured, reproducible, and tied to specific failing tests.',
    ],
    badges: ['python', 'c', 'cplusplus', 'java', 'typescript', 'linux'],
  },
  {
    id: 'fiu',
    type: 'education',
    title: 'Bachelor of Science in Computer Engineering',
    subtitle: 'Florida International University — Miami, FL',
    period: 'Graduated Dec 2025',
    mission:
      'Build strong systems and software foundations by connecting coursework to real projects—especially where reliability, performance, and clear architecture matter.',
    system:
      'A curriculum spanning data structures/algorithms, operating systems, architecture, embedded systems, and cloud fundamentals, applied through team projects and personal builds (sports-betting ML pipeline and Formula SAE telemetry platform). Worked with modern tooling across databases/clouds and used Python/ML and web stacks to build end-to-end solutions rather than isolated assignments.',
    impact: [
      'Combined hardware-aware thinking with modern software: performance, memory, and reliability—not just “it compiles.”',
      'Core depth in data structures, algorithms, OS, architecture, and embedded systems; ML in Python with NumPy and PyTorch on noisy, real-world data.',
      'Team projects linked sensors, microcontrollers, and dashboards—telemetry non-engineers could actually use.',
      'Applied the stack to end-to-end builds: PostgreSQL, AWS, Azure, Firebase, and personal projects like the sports pricing pipeline and Formula SAE telemetry.',
    ],
    keyLearnings: [
      'Theory pays off when it shows up in firmware, kernels, and distributed systems—not only in interviews.',
      'ML is useless without data hygiene: splits, leakage, and knowing what you’re optimizing.',
      'Degree work is a license to build: coursework gave constraints; projects proved I could ship under them.',
    ],
    badges: ['python', 'c', 'cplusplus', 'java', 'typescript', 'react', 'linux', 'pytorch', 'numpy', 'postgresql', 'amazonaws', 'azure', 'fastapi', 'firebase'],
  },
]
