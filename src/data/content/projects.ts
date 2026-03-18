import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'sports-betting',
    name: 'Sports Betting EV Screener & ML Pricing Engine',
    tagline: 'Personal Project',
    description:
      'Built a system that looks for betting lines that are mispriced by sportsbooks, treating each game like a data problem instead of a guess. I collected and cleaned historical NBA data, engineered features that capture team strength, recent performance, rest days, and other context, and trained machine learning models using time-series cross-validation so the model never “sees the future” during training. For each game and market, the engine estimates the true probability of an outcome, compares it to the implied odds from the sportsbook, and flags bets where the expected value is positive. On top of the predictions, I added logic for Kelly-criterion stake sizing, simple arbitrage detection, and performance tracking so I can see how the model would have performed over hundreds of past games. The end goal is a React/TypeScript frontend connected to a Python backend that can scan live odds feeds and surface the small number of bets that are mathematically worth paying attention to.',
    badges: ['react', 'typescript', 'tailwindcss', 'python', 'pytorch', 'numpy', 'scikitlearn'],
    previewType: 'video',
    previewUrl: '/sportsCardDemo.mp4',
  },
  {
    id: 'pdm',
    name: 'Power Distribution Module (Senior Design)',
    tagline: 'FIU Formula SAE',
    description:
      'Led the software side of a real-time monitoring platform for an 8-channel Power Distribution Module (PDM) used in an FIU Formula SAE race car, where reliability and fast feedback are critical. I designed a Python (Flask) backend and an Electron-based desktop application built with React and TypeScript that listens to a 58-byte serial data stream roughly 10 times per second, decoding live voltage, current, and temperature readings for each channel. The interface gives the team a clear view of how power is being distributed across the car, highlights abnormal conditions, and lets them toggle channels to test how the system reacts under different scenarios. I implemented checksum validation and defensive parsing so corrupt or partial packets don’t crash the app, and added channel-level control APIs and test modes that make it easy to reproduce and debug failure cases in the garage rather than discovering them on track. The result is a tool that bridges the gap between the electrical system and the race engineers, turning raw bytes into information they can act on quickly.',
    badges: ['python', 'flask', 'react', 'typescript', 'tailwindcss', 'electron'],
    previewType: 'video',
    previewUrl: '/pdmDemo.mp4',
  },
  {
    id: 'netflix-clone',
    name: 'Netflix Clone Application',
    tagline: 'Personal Project',
    description:
      'Built a Netflix-style web application to practice delivering a polished user experience with a modern frontend stack. The app uses React and TypeScript with a responsive layout that adapts from small phones to large desktop screens, and it pulls movie and show data from an API instead of hard-coded lists so it behaves more like a real product. I focused heavily on details like hover states, loading skeletons, and smooth navigation between sections so browsing feels fluid rather than clunky. Under the hood, I structured components and state management in a way that would scale to more complex features (search, user profiles, watchlists), treating the project as a foundation for production-grade apps rather than a one-off tutorial clone.',
    badges: ['react', 'typescript', 'tailwindcss', 'html5', 'css3'],
    previewType: 'video',
    previewUrl: '/netflix-clone-demo.mp4',
  },
]
