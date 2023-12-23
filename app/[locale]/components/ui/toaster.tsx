//
// Composant d'affichage des notifications.
//  Source : https://ui.shadcn.com/docs/components/toast
//

"use client";

import { useToast } from "./use-toast";
import { Toast,
	ToastClose,
	ToastTitle,
	ToastViewport,
	ToastProvider,
	ToastDescription } from "./toast";

export default function Toaster()
{
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map( ( {
				id,
				title,
				description,
				action,
				...props
			} ) => (
				<Toast key={id} {...props}>
					<div className="grid gap-1">
						{title && <ToastTitle>{title}</ToastTitle>}
						{description && (
							<ToastDescription>
								{description}
							</ToastDescription>
						)}
					</div>
					{action}
					<ToastClose />
				</Toast>
			) )}
			<ToastViewport />
		</ToastProvider>
	);
}