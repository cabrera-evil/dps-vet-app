import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type KeyboardScreenProps = {
  children: ReactNode;
  header?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

// Full-screen scroller whose focused input stays above the keyboard.
// iOS: ScrollView scrolls the focused input itself (automaticallyAdjustKeyboardInsets).
// Android: edge-to-edge (SDK 57) no longer resizes the window, so KeyboardAvoidingView
// pads the screen instead. Exactly one mechanism per platform, never both.
// The KeyboardAvoidingView must span the whole screen (header included) so no
// keyboardVerticalOffset is needed.
export function KeyboardScreen({
  children,
  header,
  contentContainerStyle,
}: KeyboardScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      {header}
      <ScrollView
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        className="flex-1"
        contentContainerStyle={[
          contentContainerStyle,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
