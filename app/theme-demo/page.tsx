import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { theme } from '@/src/styles/theme';

export default function ThemeDemoPage() {
  return (
    <div
      className="min-h-screen space-y-xl bg-bg-base p-md tablet:p-xl"
      style={{ backgroundColor: theme.colors.bgBase }}
    >
      <h1
        className="font-heading text-heading text-text-primary"
        style={{ fontFamily: theme.font.heading }}
      >
        Global Theme Configuration Demo
      </h1>

      <section className="space-y-md">
        <h2 className="font-heading text-xl font-semibold text-text-secondary">
          Primary Components
        </h2>
        <div className="flex flex-wrap gap-md">
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-lg tablet:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sample Form</CardTitle>
            <CardDescription>A demonstration of inputs and textareas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-md">
            <div className="space-y-sm">
              <label className="text-sm font-medium text-text-primary">Email Address</label>
              <Input type="email" placeholder="hello@example.com" />
            </div>
            <div className="space-y-sm">
              <label className="text-sm font-medium text-text-primary">Feedback</label>
              <Textarea placeholder="Share your thoughts..." />
            </div>
            <Button className="w-full">Submit</Button>
          </CardContent>
        </Card>

        <Card className="bg-bg-elevated border-border-subtle">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Visualizing our design tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-1 gap-sm text-sm font-medium mobile:grid-cols-2"
              style={{ fontFamily: theme.font.mono }}
            >
              <div className="flex justify-between rounded-lg border border-border-default bg-bg-surface p-sm">
                <span>Surface</span> <span className="text-text-muted">bg-surface</span>
              </div>
              <div className="flex justify-between rounded-lg bg-bg-subtle p-sm text-text-primary">
                <span>Subtle</span> <span className="text-text-muted">bg-subtle</span>
              </div>
              <div className="flex justify-between rounded-lg bg-accent-primary p-sm text-primary-foreground">
                <span>Primary</span>
                <span className="text-primary-foreground/80">accent-primary</span>
              </div>
              <div className="flex justify-between rounded-lg bg-accent-ai p-sm text-primary-foreground">
                <span>AI</span> <span className="text-primary-foreground/80">accent-ai</span>
              </div>
              <div className="flex justify-between rounded-lg bg-state-error p-sm text-destructive-foreground">
                <span>Error</span>
                <span className="text-destructive-foreground/80">state-error</span>
              </div>
              <div className="flex justify-between rounded-lg bg-state-success p-sm text-primary-foreground">
                <span>Success</span>
                <span className="text-primary-foreground/80">state-success</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-border-subtle bg-accent-primary-dim p-lg">
        <h2 className="mb-sm font-heading text-xl font-bold text-accent-primary">
          Accent Highlight Section
        </h2>
        <p className="mb-md text-text-secondary">
          This container uses the dim accent background token for subtle emphasis without
          overwhelming the page.
        </p>
        <Button
          variant="outline"
          className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-foreground"
        >
          Learn More
        </Button>
      </section>
    </div>
  );
}
