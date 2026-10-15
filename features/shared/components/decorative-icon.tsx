import type { ComponentProps } from "react";

import { Icon } from "@/components/ui/icon";

// gluestack's Icon types omit a11y props, but they reach the underlying SVG.
// Icons next to visible text carry no information, so hide them from screen readers.
const hidden = {
  accessibilityElementsHidden: true,
  importantForAccessibility: "no",
};

export function DecorativeIcon(props: ComponentProps<typeof Icon>) {
  return <Icon {...hidden} {...props} />;
}
