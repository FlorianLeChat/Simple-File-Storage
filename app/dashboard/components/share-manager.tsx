//
// Composant de gestion des partages d'un fichier.
//  Source : https://ui.shadcn.com/themes
//

"use client";

import { useState } from "react";
import { ClipboardCopy, Loader2 } from "lucide-react";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";
import { useToast } from "../../components/ui/use-toast";
import { Avatar,
	AvatarImage,
	AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";

export default function ShareManager()
{
	// Déclaration des constantes.
	const { toast } = useToast();

	// Déclaration des variables d'état.
	const [ isLoading, setIsLoading ] = useState( false );

	// Requête de connexion d'un compte utilisateur par protocole OAuth.
	const updateSharing = ( value: string ) =>
	{
		setIsLoading( true );

		setTimeout( () =>
		{
			toast( {
				title: "Vous avez soumis les informations suivantes :",
				description: (
					<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
						<code className="text-white">
							{JSON.stringify( value, null, 4 )}
						</code>
					</pre>
				)
			} );

			setIsLoading( false );
		}, 3000 );
	};

	// Affichage du rendu HTML du composant.
	return (
		<>
			{/* Lien de partage */}
			<div className="flex space-x-2">
				<Input value="http://example.com/link/to/document" readOnly />

				<Button variant="secondary" className="shrink-0">
					<ClipboardCopy className="mr-2 h-4 w-4" />
					Copier
				</Button>
			</div>

			{/* Séparateur horizontal */}
			<Separator className="my-2" />

			<div>
				{/* Liste des utilisateurs partagés */}
				<h4 className="text-sm font-medium">Utilisateurs partagés</h4>

				<div className="mt-4 grid gap-6">
					<div className="flex items-center justify-between space-x-4">
						{/* Informations de l'utilisateur */}
						<div className="flex items-center space-x-4">
							<Avatar>
								<AvatarImage src="/avatars/03.png" />
								<AvatarFallback>OM</AvatarFallback>
							</Avatar>

							<div>
								<p className="text-sm font-medium leading-none">
									Olivia Martin
								</p>

								<p className="text-sm text-muted-foreground">
									m@example.com
								</p>
							</div>
						</div>

						{/* Autorisations accordées */}
						<Select
							disabled={isLoading}
							defaultValue="edit"
							onValueChange={updateSharing}
						>
							<SelectTrigger className="ml-auto w-auto">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="edit">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Éditer</span>
								</SelectItem>

								<SelectItem value="view">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Voir</span>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-4">
							<Avatar>
								<AvatarImage src="/avatars/05.png" />
								<AvatarFallback>IN</AvatarFallback>
							</Avatar>

							<div>
								<p className="text-sm font-medium leading-none">
									Isabella Nguyen
								</p>

								<p className="text-sm text-muted-foreground">
									b@example.com
								</p>
							</div>
						</div>

						<Select
							disabled={isLoading}
							defaultValue="view"
							onValueChange={updateSharing}
						>
							<SelectTrigger className="ml-auto w-auto">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="edit">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Éditer</span>
								</SelectItem>

								<SelectItem value="view">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Voir</span>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-4">
							<Avatar>
								<AvatarImage src="/avatars/01.png" />
								<AvatarFallback>SD</AvatarFallback>
							</Avatar>

							<div>
								<p className="text-sm font-medium leading-none">
									Sofia Davis
								</p>

								<p className="text-sm text-muted-foreground">
									p@example.com
								</p>
							</div>
						</div>

						<Select
							disabled={isLoading}
							defaultValue="view"
							onValueChange={updateSharing}
						>
							<SelectTrigger className="ml-auto w-auto">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="edit">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Éditer</span>
								</SelectItem>

								<SelectItem value="view">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Voir</span>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</>
	);
}