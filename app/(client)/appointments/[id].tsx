import { useLocalSearchParams } from "expo-router";

import { AppointmentDetail } from "@/features/appointments/components/appointment-detail";

export default function AppointmentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AppointmentDetail id={id} />;
}
