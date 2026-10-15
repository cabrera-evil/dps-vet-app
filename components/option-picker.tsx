import { Modal, Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";

type PickerOption = {
  label: string;
  value: string;
};

type OptionPickerProps = {
  visible: boolean;
  title: string;
  options: readonly PickerOption[];
  selectedValue?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function OptionPicker({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: OptionPickerProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable accessibilityLabel="Cerrar selector" className="flex-1" onPress={onClose} />
        <View className="max-h-[70%] rounded-t-3xl bg-card px-6 pb-10 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="font-heading text-xl text-foreground">{title}</Text>
            <Pressable accessibilityLabel="Cerrar" hitSlop={12} onPress={onClose}>
              <Text className="text-xl text-muted-foreground">×</Text>
            </Pressable>
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
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
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
      </View>
    </Modal>
  );
}
