import {
	AlertDialog,
	AlertDialogBackdrop,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

type ConfirmDialogProps = {
	isOpen: boolean;
	title: string;
	message: string;
	cancelLabel: string;
	confirmLabel: string;
	/** Destructive confirmations use the destructive button variant. */
	destructive?: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

// Alert-like confirmation built on the gluestack alert-dialog primitives.
export function ConfirmDialog({
	isOpen,
	title,
	message,
	cancelLabel,
	confirmLabel,
	destructive,
	onClose,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<AlertDialog isOpen={isOpen} onClose={onClose}>
			<AlertDialogBackdrop />
			<AlertDialogContent className="gap-4">
				<AlertDialogHeader>
					<Heading className="text-foreground" size="lg">
						{title}
					</Heading>
				</AlertDialogHeader>
				<AlertDialogBody>
					<Text className="text-muted-foreground">{message}</Text>
				</AlertDialogBody>
				<AlertDialogFooter className="gap-3">
					<Button className="flex-1" onPress={onClose} variant="outline">
						<ButtonText>{cancelLabel}</ButtonText>
					</Button>
					<Button
						className="flex-1"
						onPress={() => {
							onClose();
							onConfirm();
						}}
						variant={destructive ? 'destructive' : 'default'}
					>
						<ButtonText>{confirmLabel}</ButtonText>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
