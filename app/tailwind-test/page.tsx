export default function TailwindTestPage() {
  return (
    <main className="min-h-screen bg-background p-md text-foreground tablet:p-xl">
      <section className="mx-auto max-w-4xl space-y-lg">
        <div className="space-y-sm rounded-xl border border-border bg-card p-lg text-card-foreground">
          <p className="text-caption font-medium uppercase text-text-muted">Tailwind test</p>
          <h1 className="font-heading text-heading text-text-primary">
            Theme tokens compile across breakpoints
          </h1>
          <p className="max-w-2xl text-body text-text-secondary">
            This page exercises custom colors, spacing, typography, forms, prose styles and
            responsive utilities from the Tailwind and PostCSS setup.
          </p>
        </div>

        <div className="grid gap-md tablet:grid-cols-3">
          <div className="rounded-xl bg-primary p-md text-primary-foreground">Primary</div>
          <div className="rounded-xl bg-secondary p-md text-secondary-foreground">Secondary</div>
          <div className="rounded-xl bg-accent p-md text-accent-foreground">Neutral accent</div>
        </div>

        <form className="space-y-md rounded-xl border border-border-default bg-bg-surface p-lg">
          <label className="block space-y-sm">
            <span className="text-sm font-medium text-text-primary">Example input</span>
            <input
              className="w-full rounded-lg border-input bg-background text-foreground"
              placeholder="Form plugin reset"
              type="text"
            />
          </label>
          <label className="flex items-center gap-sm text-sm text-text-secondary">
            <input className="rounded text-primary" type="checkbox" />
            Forms plugin checkbox styling
          </label>
        </form>

        <article className="prose max-w-none rounded-xl border border-border-subtle bg-bg-elevated p-lg">
          <h2>Typography plugin sample</h2>
          <p>
            The prose class is available while the surrounding surface uses project theme tokens.
          </p>
        </article>

        <section className="dark rounded-xl bg-background p-lg text-foreground">
          <div className="rounded-xl border border-border bg-card p-md text-card-foreground">
            Dark class variant falls back to the MVP light token set.
          </div>
        </section>
      </section>
    </main>
  );
}
