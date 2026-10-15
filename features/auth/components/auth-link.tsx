import { Link, type Href } from "expo-router";
import { Pressable } from "@/components/ui/pressable";

import { Text } from "@/components/ui/text";

// Text link between auth screens (44px tap target).
export function AuthLink({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" className="min-h-11 justify-center active:opacity-60">
        <Text className="text-sm font-sans-semibold text-primary">{label}</Text>
      </Pressable>
    </Link>
  );
}
