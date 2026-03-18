import type { ContactItem } from '@/types'

export const contactItems: ContactItem[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/josexcorrea',
    icon: 'GH',
    emblem: 'github',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/josexcorrea',
    icon: 'IN',
    emblem: 'linkedin',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/josexcorrea',
    icon: 'IG',
    emblem: 'instagram',
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:Josexcorrea03@gmail.com',
    icon: 'EM',
    emblem: 'email',
  },
  { id: 'phone', label: 'Phone', href: 'tel:786-241-7763', icon: 'PH', emblem: 'phone' },
  { id: 'resume', label: 'Resume', href: '/resume.pdf', icon: 'CV', emblem: 'resume' },
]
