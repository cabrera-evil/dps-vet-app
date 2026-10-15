import { Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";

type AppointmentOption = {
  label: string;
  value: string;
};

type AppointmentOptionListProps = {
  title: string;
  options: readonly AppointmentOption[];
  selectedValue: string;
  onBack: () => void;
  onSelect: (value: string) => void;
};

export function AppointmentOptionList({
  title,
  options,
  selectedValue,
  onBack,
  onSelect,
}: AppointmentOptionListProps) {
  return (
    <View className="max-h-[70%] px-5 py-5">
      <View className="mb-5 flex-row items-center">
        <Pressable accessibilityLabel="Volver al formulario" hitSlop={12} onPress={onBack}>
          <Text className="text-2xl text-foreground">‹</Text>
        </Pressable>
        <Text className="ml-4 font-heading text-xl text-foreground">{title}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {options.map((option) => {
          const selected = option.value === selectedValue;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`mb-2 min-h-13 justify-center rounded-2xl px-4 ${
                selected ? "bg-secondary" : "bg-background"
              }`}
              onPress={() => onSelect(option.value)}
            >
              <Text
                className={`font-semibold ${
                  selected ? "text-secondary-foreground" : "text-foreground"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
