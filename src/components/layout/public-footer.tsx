import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { StripeDivider } from '@/components/motion/stripe-divider'
import { SITE_AUTHOR, SOCIAL_LINKS } from '@/lib/site-config'
import { BrandLogo } from './brand-logo'
import { SocialIcon } from './social-icon'

// Centred footer: logo, tagline, credit and social icons, a sliding striped divider, copyright.
export function PublicFooter() {
  return (
    <footer className="w-full overflow-hidden border-t border-border bg-card pt-10 pb-5 text-foreground">
      <Stagger className="page-container mb-8 flex flex-col items-center gap-6">
        <StaggerItem className="flex flex-col items-center gap-3">
          <BrandLogo size="lg" />
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Trusted care for your little ones
          </p>
        </StaggerItem>

        <StaggerItem className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Made by <span className="font-medium text-foreground">{SITE_AUTHOR}</span>
          </p>
          {SOCIAL_LINKS.length > 0 && (
            <ul className="flex items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    aria-label={`${link.label} (opens in a new tab)`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <SocialIcon id={link.id} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </StaggerItem>
      </Stagger>

      <StripeDivider />

      {/* Plain text on purpose: it is the last line of the page, so a scroll-reveal would never fire. */}
      <p className="page-container mt-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CareNest. All rights reserved.
      </p>
    </footer>
  )
}
