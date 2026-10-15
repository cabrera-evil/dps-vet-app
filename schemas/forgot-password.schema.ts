import { z } from 'zod';

export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'El correo electrónico es obligatorio' })
		.max(254, { message: 'El correo electrónico es demasiado largo' })
		.email({ message: 'Ingresa un correo electrónico válido' }),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
