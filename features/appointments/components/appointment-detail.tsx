import { Link, router } from "expo-router";
import { useState, type ReactNode } from "react";
import { View } from "react-native";

import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  APPOINTMENT_STATUS_LABEL,
  useAppointment,
  useCancelAppointment,
} from "@/features/appointments/use-appointments";
import { requestErrorMessage } from "@/features/auth/validate";
import { FormScreen } from "@/features/shared/components/form-screen";
import { useNotice } from "@/hooks/use-notice";
import { parseApiError } from "@/lib/api-error";
import { formatClinicLongDate, formatClinicTime } from "@/utils/date";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-1 items-end">{children}</View>
    </View>
  );
}

function Value({ children }: { children: ReactNode }) {
  return <Text className="text-right text-sm font-sans-medium text-foreground">{children}</Text>;
}

function cancelErrorMessage(status?: number) {
  if (status === 422) return "La cita ya inició y no puede cancelarse.";
  if (status === 404) return "Esta cita ya no existe.";
  return requestErrorMessage(status);
}

export function AppointmentDetail({ id }: { id: string }) {
  const notify = useNotice();
  const { appointment, isPending, error, refetch } = useAppointment(id);
  const { cancelAppointment, isPending: cancelling } = useCancelAppointment();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isPending) {
    return (
      <FormScreen backLabel="Volver" subtitle="Cita" title="Detalle de la cita">
        <Spinner accessibilityLabel="Cargando cita" />
      </FormScreen>
    );
  }

  if (!appointment) {
    const { status } = parseApiError(error);
    const notFound = status === 404;
    return (
      <FormScreen backLabel="Volver" subtitle="Cita" title="Detalle de la cita">
        <View className="rounded-xl border border-dashed border-border bg-card p-6">
          <Text className="text-center text-muted-foreground">
            {notFound ? "No encontramos esta cita. Puede que ya no exista." : requestErrorMessage(status)}
          </Text>
          {notFound ? null : (
            <Button className="mt-4 min-h-12 rounded-lg" onPress={() => refetch()} variant="outline">
              <ButtonText>Reintentar</ButtonText>
            </Button>
          )}
        </View>
      </FormScreen>
    );
  }

  const { service } = appointment;

  const cancel = async () => {
    try {
      await cancelAppointment(appointment.id);
    } catch (cause) {
      const { status } = parseApiError(cause);
      notify("No se pudo cancelar", cancelErrorMessage(status));
      // The appointment is gone: nothing left to show here.
      if (status === 404) router.back();
      return;
    }
    notify("Cita cancelada", `Cancelamos la cita de ${appointment.petName}.`);
    router.back();
  };

  return (
    <FormScreen
      backLabel="Volver"
      subtitle={APPOINTMENT_STATUS_LABEL[appointment.status]}
      title="Detalle de la cita"
    >
      <View className="mt-6 gap-3 rounded-xl border border-border bg-card p-4">
        <Row label="Estado">
          <Value>{APPOINTMENT_STATUS_LABEL[appointment.status]}</Value>
        </Row>
        <Row label="Fecha">
          <Value>{formatClinicLongDate(appointment.start)}</Value>
        </Row>
        <Row label="Hora">
          <Value>
            {formatClinicTime(appointment.start)} - {formatClinicTime(appointment.end)}
          </Value>
        </Row>
        <Row label="Mascota">
          <Link
            accessibilityRole="link"
            href={{ pathname: "/(client)/pets/[id]", params: { id: appointment.petId } }}
          >
            <Text className="min-h-11 text-right text-sm font-sans-semibold text-primary">
              {appointment.petName}
            </Text>
          </Link>
        </Row>
        <Row label="Servicio">
          <Value>{appointment.serviceName}</Value>
        </Row>
        {service ? (
          <>
            <Row label="Duración">
              <Value>{service.durationMinutes} min</Value>
            </Row>
            <Row label="Precio">
              <Value>{`$${service.price.toFixed(2)}`}</Value>
            </Row>
          </>
        ) : null}
      </View>

      {appointment.upcoming ? (
        <Button
          accessibilityState={{ busy: cancelling, disabled: cancelling }}
          className="mt-8 min-h-12 rounded-lg"
          disabled={cancelling}
          onPress={() => setConfirmOpen(true)}
          variant="outline"
        >
          <ButtonText className="font-sans-semibold text-destructive">
            {cancelling ? "Cancelando..." : "Cancelar cita"}
          </ButtonText>
        </Button>
      ) : null}

      <ConfirmDialog
        cancelLabel="Conservar"
        confirmLabel="Cancelar cita"
        destructive
        isOpen={confirmOpen}
        message={`¿Quieres cancelar la cita de ${appointment.petName} (${appointment.serviceName})?`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void cancel()}
        title="Cancelar cita"
      />
    </FormScreen>
  );
}
