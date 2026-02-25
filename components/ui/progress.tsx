import * as ProgressPrimitive from "@radix-ui/react-progress";

export function Progress({ value = 0 }: { value?: number }) {
  return (
    <ProgressPrimitive.Root className="relative h-2 w-full overflow-hidden rounded-full bg-muted" value={value}>
      <ProgressPrimitive.Indicator className="h-full bg-primary transition-all" style={{ transform: `translateX(-${100 - value}%)` }} />
    </ProgressPrimitive.Root>
  );
}
