/* eslint-disable react-refresh/only-export-components -- module shares icon SVGs + MacIcon + dock config */
import type { ReactNode } from 'react'
import type { AppId } from './types'

/** Shared wrapper for dock / iOS home SVG icons */
export function MacIcon({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {children}
    </div>
  )
}

export const DOCK_APP_ENTRIES: readonly { id: string; label: string; appId: AppId }[] = [
  { id: 'finder', label: 'Finder', appId: 'finder' },
  { id: 'about', label: 'About', appId: 'about' },
  { id: 'projects', label: 'Projects', appId: 'projects' },
  { id: 'experience', label: 'Experience', appId: 'experience' },
  { id: 'skills', label: 'Skills', appId: 'skills' },
  { id: 'resume', label: 'Resume', appId: 'resume' },
  { id: 'contact', label: 'Contact', appId: 'contact' },
  { id: 'chat', label: 'AI Chat', appId: 'chat' },
] as const

export const DOCK_ICONS: Record<AppId | 'github' | 'linkedin', React.ReactNode> = {
  finder: (
    <MacIcon>
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="ic-finder-gr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa" />
            <stop offset="100%" stopColor="#007aff" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-finder-gr)" />
        <path d="M7 21 L7 13 Q7 10 10 10 L23 10 Q26.5 10 28 13 L30.5 21 Z" fill="rgba(255,255,255,0.88)" />
        <rect x="7" y="21" width="46" height="30" rx="4" fill="rgba(255,255,255,0.93)" />
        <circle cx="37" cy="35" r="8.5" fill="none" stroke="#1d4ed8" strokeWidth="2.8" />
        <line x1="43" y1="41" x2="49" y2="48" stroke="#1d4ed8" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </MacIcon>
  ),
  about: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="ic-about-gr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa" />
            <stop offset="100%" stopColor="#007aff" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-about-gr)" />
        <rect x="9" y="10" width="42" height="40" rx="6" fill="rgba(255,255,255,0.13)" />
        <circle cx="30" cy="26" r="10" fill="rgba(255,255,255,0.92)" />
        <path d="M14 52 Q14 39 30 39 Q46 39 46 52" fill="rgba(255,255,255,0.92)" />
      </svg>
    </MacIcon>
  ),
  projects: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="ic-projects-gr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-projects-gr)" />
        <rect x="7" y="10" width="46" height="38" rx="7" fill="rgba(255,255,255,0.12)" />
        <rect x="7" y="10" width="46" height="13" rx="7" fill="rgba(255,255,255,0.22)" />
        <rect x="7" y="17" width="46" height="6" fill="rgba(255,255,255,0.22)" />
        <circle cx="15" cy="17" r="2.5" fill="#ff5f57" />
        <circle cx="22" cy="17" r="2.5" fill="#febc2e" />
        <circle cx="29" cy="17" r="2.5" fill="#28c840" />
        <rect x="13" y="28" width="15" height="2.5" rx="1.2" fill="rgba(255,255,255,0.8)" />
        <rect x="13" y="33" width="26" height="2.5" rx="1.2" fill="rgba(255,255,255,0.5)" />
        <rect x="13" y="38" width="11" height="2.5" rx="1.2" fill="rgba(255,255,255,0.65)" />
        <rect x="33" y="28" width="13" height="2.5" rx="1.2" fill="rgba(255,255,255,0.4)" />
      </svg>
    </MacIcon>
  ),
  experience: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="60" height="60" fill="#f2f2f7" />
        <rect x="7" y="10" width="46" height="40" rx="8" fill="white" />
        <rect x="7" y="10" width="46" height="15" rx="8" fill="#ff3b30" />
        <rect x="7" y="18" width="46" height="7" fill="#ff3b30" />
        <text x="30" y="22" fontFamily="-apple-system,'SF Pro Display',sans-serif" fontSize="7.5" fontWeight="600" fill="rgba(255,255,255,0.92)" textAnchor="middle" letterSpacing="0.5">APRIL</text>
        <text x="30" y="44" fontFamily="-apple-system,'SF Pro Display',sans-serif" fontSize="22" fontWeight="700" fill="#1c1c1e" textAnchor="middle">8</text>
      </svg>
    </MacIcon>
  ),
  skills: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <radialGradient id="ic-skills-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d1b3e" />
            <stop offset="100%" stopColor="#020510" />
          </radialGradient>
          <radialGradient id="ic-skills-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-skills-bg)" />
        <circle cx="8" cy="7" r="0.7" fill="white" opacity="0.7" />
        <circle cx="19" cy="4" r="0.5" fill="white" opacity="0.5" />
        <circle cx="48" cy="9" r="0.7" fill="white" opacity="0.6" />
        <circle cx="54" cy="5" r="0.5" fill="white" opacity="0.4" />
        <circle cx="5" cy="52" r="0.6" fill="white" opacity="0.5" />
        <circle cx="55" cy="50" r="0.7" fill="white" opacity="0.6" />
        <circle cx="43" cy="55" r="0.5" fill="white" opacity="0.4" />
        <circle cx="30" cy="31" r="17" fill="url(#ic-skills-glow)" />
        <circle cx="30" cy="31" r="15" fill="none" stroke="#9FB0CC" strokeWidth="1.1" opacity="0.9" />
        <ellipse cx="30" cy="31" rx="15" ry="5.5" fill="none" stroke="#9FB0CC" strokeWidth="0.7" opacity="0.55" />
        <ellipse cx="30" cy="31" rx="15" ry="10.5" fill="none" stroke="#9FB0CC" strokeWidth="0.7" opacity="0.4" />
        <ellipse cx="30" cy="31" rx="6" ry="15" fill="none" stroke="#9FB0CC" strokeWidth="0.7" opacity="0.55" />
        <ellipse cx="30" cy="31" rx="11.5" ry="15" fill="none" stroke="#9FB0CC" strokeWidth="0.7" opacity="0.4" />
        <line x1="6" y1="12" x2="14" y2="18" stroke="#6dd4a8" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
        <line x1="8" y1="12" x2="14" y2="17" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
        <line x1="44" y1="6" x2="50" y2="13" stroke="#7ec8e8" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <line x1="46" y1="6" x2="50" y2="12" stroke="white" strokeWidth="0.4" strokeLinecap="round" opacity="0.45" />
        <line x1="3" y1="38" x2="9" y2="43" stroke="#e87a6e" strokeWidth="1.0" strokeLinecap="round" opacity="0.75" />
      </svg>
    </MacIcon>
  ),
  resume: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="ic-resume-gr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7b733" />
            <stop offset="100%" stopColor="#fc4a1a" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-resume-gr)" />
        <rect x="13" y="8" width="34" height="44" rx="4" fill="white" />
        <path d="M36 8 L47 8 L36 19 Z" fill="rgba(0,0,0,0.09)" />
        <circle cx="24" cy="22" r="5.5" fill="rgba(0,0,0,0.07)" />
        <rect x="33" y="19" width="10" height="2" rx="1" fill="rgba(0,0,0,0.18)" />
        <rect x="33" y="23" width="7" height="2" rx="1" fill="rgba(0,0,0,0.12)" />
        <rect x="16" y="32" width="28" height="2" rx="1" fill="rgba(0,0,0,0.18)" />
        <rect x="16" y="37" width="24" height="2" rx="1" fill="rgba(0,0,0,0.12)" />
        <rect x="16" y="42" width="20" height="2" rx="1" fill="rgba(0,0,0,0.12)" />
      </svg>
    </MacIcon>
  ),
  contact: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="ic-mail-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a73e8" />
            <stop offset="100%" stopColor="#0d47a1" />
          </linearGradient>
          <linearGradient id="ic-mail-flap" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.97)" />
            <stop offset="100%" stopColor="rgba(220,235,255,0.95)" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-mail-bg)" />
        <rect x="7" y="17" width="46" height="30" rx="5" fill="url(#ic-mail-flap)" />
        <path d="M7 17 Q7 15 10 15 L50 15 Q53 15 53 17 L30 34 Z" fill="rgba(255,255,255,0.72)" />
        <path d="M7 17 L30 34 L53 17" stroke="rgba(13,71,161,0.22)" strokeWidth="1.2" fill="none" />
        <path d="M7 47 L22 33" stroke="rgba(13,71,161,0.15)" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M53 47 L38 33" stroke="rgba(13,71,161,0.15)" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="46" cy="14" r="7" fill="#ea4335" />
        <text x="46" y="18" fontFamily="'SF Pro Display',-apple-system,sans-serif" fontSize="8.5" fontWeight="700" fill="white" textAnchor="middle">1</text>
      </svg>
    </MacIcon>
  ),
  chat: (
    <MacIcon>
      <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="ic-chat-gr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#5824b9" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" fill="url(#ic-chat-gr)" />
        <path d="M10 13 Q10 9 14 9 L46 9 Q50 9 50 13 L50 35 Q50 39 46 39 L26 39 L16 50 L16 39 L14 39 Q10 39 10 35 Z" fill="white" />
        <circle cx="24" cy="24" r="3" fill="rgba(140,80,240,0.65)" />
        <circle cx="30" cy="24" r="3" fill="rgba(140,80,240,0.65)" />
        <circle cx="36" cy="24" r="3" fill="rgba(140,80,240,0.65)" />
      </svg>
    </MacIcon>
  ),
  github: (
    <MacIcon>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg,#24292e,#1a1e22)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '19%', boxSizing: 'border-box' }}>
        <svg viewBox="0 0 24 24" fill="rgba(249,245,255,0.9)" style={{ width: '100%', height: '100%' }} aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      </div>
    </MacIcon>
  ),
  linkedin: (
    <MacIcon>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg,#0077b5,#005885)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '19%', boxSizing: 'border-box' }}>
        <svg viewBox="0 0 24 24" fill="rgba(249,245,255,0.9)" style={{ width: '100%', height: '100%' }} aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </div>
    </MacIcon>
  ),
}
