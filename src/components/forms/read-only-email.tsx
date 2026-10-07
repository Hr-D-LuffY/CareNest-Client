import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// The email on a profile form: shown but not editable, because it is how the person signs in.
export function ReadOnlyEmail({ id, email }: { id: string; email: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm">
        Email
      </Label>
      <Input
        id={id}
        type="email"
        value={email}
        readOnly
        aria-describedby={`${id}-hint`}
        className="h-12 rounded-xl bg-muted/60"
      />
      <p id={`${id}-hint`} className="text-sm text-muted-foreground">
        Your email is how you sign in, so it cannot be changed here.
      </p>
    </div>
  )
}
