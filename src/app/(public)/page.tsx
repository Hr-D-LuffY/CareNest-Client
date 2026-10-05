import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_BADGES = [
  { label: 'Confirmed', className: 'bg-success-soft text-success' },
  { label: 'Waitlisted', className: 'bg-warning-soft text-warning' },
  { label: 'In progress', className: 'bg-info-soft text-info' },
] as const

// Temporary foundation page. Replaced by the real landing page in Phase 1.
export default function HomePage() {
  return (
    <div className="page-container flex max-w-3xl flex-col gap-8 py-16">
      <h1 className="text-4xl">CareNest</h1>

      <Reveal>
        <p className="text-lg text-muted-foreground">
          Trusted childcare and supervised transport for your little ones.
        </p>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-2">
        <StaggerItem>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Primary, call-to-action and quiet variants.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button className="bg-cta text-cta-foreground hover:bg-cta/90">Book now</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Status colours</CardTitle>
              <CardDescription>One palette for every status in the app.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {STATUS_BADGES.map((badge) => (
                <Badge key={badge.label} className={badge.className}>
                  {badge.label}
                </Badge>
              ))}
              <Badge variant="destructive">Cancelled</Badge>
            </CardContent>
          </Card>
        </StaggerItem>
      </Stagger>
    </div>
  )
}
