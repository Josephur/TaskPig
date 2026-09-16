import { Fragment, type ReactNode } from "react";
import type { SlotRegistry } from "./slots.js";

export interface SlotProps<P = Record<string, never>> {
  name: string;
  slots: SlotRegistry;
  slotProps?: P;
  fallback?: ReactNode;
}

/** Renders every contribution to a named slot, in registration order. */
export function Slot<P = Record<string, never>>({
  name,
  slots,
  slotProps = {} as P,
  fallback = null,
}: SlotProps<P>): ReactNode {
  const contributions = slots.getContributions<P>(name);
  if (contributions.length === 0) return fallback;
  return (
    <>
      {contributions.map((contribution) => (
        <Fragment key={`${contribution.pluginId}:${contribution.id}`}>
          {contribution.render(slotProps) as ReactNode}
        </Fragment>
      ))}
    </>
  );
}
