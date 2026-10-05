// Site-wide facts shown in the footer. Only real values belong here: a link that is not filled in
// is simply not shown.

export const SITE_AUTHOR = 'Habibur Rahmann'

export type SocialId = 'github' | 'linkedin' | 'portfolio'

export type SocialLink = {
  id: SocialId
  label: string
  href: string
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/Hr-D-LuffY' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/md-habib-ur-rahman/' },
  { id: 'portfolio', label: 'Portfolio', href: 'https://md-habibur-rahman-17.vercel.app/' },
]
