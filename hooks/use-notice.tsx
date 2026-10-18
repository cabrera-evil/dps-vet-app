import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from '@/components/ui/toast';

/** Shows a plain notice as a gluestack toast (the host is mounted by GluestackUIProvider). */
export function useNotice() {
	const toast = useToast();

	return (title: string, description?: string) =>
		toast.show({
			placement: 'top',
			duration: 4000,
			render: ({ id }) => (
				<Toast action="muted" nativeID={`toast-${id}`} variant="outline">
					<ToastTitle>{title}</ToastTitle>
					{description ? (
						<ToastDescription>{description}</ToastDescription>
					) : null}
				</Toast>
			),
		});
}
