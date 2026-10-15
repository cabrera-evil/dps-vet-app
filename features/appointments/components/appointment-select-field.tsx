import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";

type AppointmentSelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onPress: () => void;
};

export function AppointmentSelectField({
  label,
  placeholder,
  value,
  error,
  onPress,
}: AppointmentSelectFieldProps) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <Pressable
        accessibilityLabel={label}
        className={`min-h-12 flex-row items-center justify-between rounded-xl border bg-card px-3 ${
          error ? "border-destructive" : "border-input"
        }`}
        onPress={onPress}
      >
        <Text className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </Text>
        <Text className="text-lg text-muted-foreground">⌄</Text>
      </Pressable>
      {error ? <Text className="mt-2 text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
