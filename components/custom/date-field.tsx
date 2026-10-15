import { DateTimePicker, DateTimePickerTrigger, DateTimePickerInput } from "@/components/ui/date-time-picker";
import { fromIsoDate, toIsoDate } from "@/utils/date";

type DateFieldProps = {
  /** `YYYY-MM-DD`, or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
  placeholder: string;
  invalid?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

/** Date-only picker whose value is a `YYYY-MM-DD` string built from local calendar fields. */
export function DateField({
  value,
  onChange,
  accessibilityLabel,
  placeholder,
  invalid,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  return (
    <DateTimePicker
      format="DD/MM/YYYY"
      maximumDate={maximumDate}
      minimumDate={minimumDate}
      mode="date"
      onChange={(date) => date && onChange(toIsoDate(date))}
      placeholder={placeholder}
      value={fromIsoDate(value)}
    >
      <DateTimePickerTrigger
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        className={invalid ? "border-destructive" : ""}
        size="xl"
      >
        <DateTimePickerInput />
      </DateTimePickerTrigger>
    </DateTimePicker>
  );
}
