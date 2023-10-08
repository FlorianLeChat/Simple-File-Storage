//
// Composant de gestion des partages d'un fichier.
//  Source : https://ui.shadcn.com/themes
//

"use client";

import { merge } from "@/utilities/tailwind";
import { useState } from "react";
import { Trash, Loader2, CalendarDays, ClipboardCopy } from "lucide-react";

import { Input } from "../../components/ui/input";
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
import { HoverCard,
	HoverCardContent,
	HoverCardTrigger } from "../../components/ui/hover-card";
import { Button, buttonVariants } from "../../components/ui/button";

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

				<Button variant="secondary">
					<ClipboardCopy className="mr-2 h-4 w-4" />
					Copier
				</Button>
			</div>

			{/* Séparateur horizontal */}
			<Separator className="my-2" />

			{/* Liste des utilisateurs partagés */}
			<section>
				<h4 className="text-center text-sm font-medium sm:text-left">
					Utilisateurs partagés
				</h4>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-normal">
					{/* Avatar de l'utilisateur */}
					<Avatar>
						<AvatarImage src="/avatars/03.png" />
						<AvatarFallback>OM</AvatarFallback>
					</Avatar>

					<div>
						{/* Informations complètes de l'utilisateur */}
						<HoverCard>
							<HoverCardTrigger
								className={merge(
									buttonVariants( { variant: "link" } ),
									"h-auto p-0 text-secondary-foreground"
								)}
							>
								Olivia Martin
							</HoverCardTrigger>

							<HoverCardContent className="flex justify-between space-x-4">
								<Avatar>
									<AvatarImage src="https://github.com/vercel.png" />
									<AvatarFallback>VC</AvatarFallback>
								</Avatar>

								<div className="space-y-1">
									<h4 className="text-sm font-medium leading-none">
										@olivia2033
									</h4>

									<p className="text-sm text-muted-foreground">
										olivia@example.com
									</p>

									<div className="flex items-center pt-1">
										<CalendarDays className="mr-2" />

										<span className="text-xs text-muted-foreground">
											Inscription le 4 décembre 2023
										</span>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>

						<p className="text-sm text-muted-foreground">
							olivia@example.com
						</p>
					</div>

					<div className="flex gap-3 sm:ml-auto">
						{/* Autorisations accordées */}
						<Select
							disabled={isLoading}
							defaultValue="write"
							onValueChange={updateSharing}
						>
							<SelectTrigger className="ml-auto w-auto">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="write">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Écriture</span>
								</SelectItem>

								<SelectItem value="read">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Lecture</span>
								</SelectItem>

								<SelectItem value="admin">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Gestion</span>
								</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="destructive">
							<Trash className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-normal">
					{/* Avatar de l'utilisateur */}
					<Avatar>
						<AvatarImage src="/avatars/05.png" />
						<AvatarFallback>IN</AvatarFallback>
					</Avatar>

					{/* Informations complètes de l'utilisateur */}
					<div>
						<HoverCard>
							<HoverCardTrigger
								className={merge(
									buttonVariants( { variant: "link" } ),
									"h-auto p-0 text-secondary-foreground"
								)}
							>
								Isabella Nguyen
							</HoverCardTrigger>

							<HoverCardContent className="flex justify-between space-x-4">
								<Avatar>
									<AvatarImage src="https://github.com/vercel.png" />
									<AvatarFallback>IN</AvatarFallback>
								</Avatar>

								<div className="space-y-1">
									<h4 className="text-sm font-medium leading-none">
										@isabella4542
									</h4>

									<p className="text-sm text-muted-foreground">
										isa@example.com
									</p>

									<div className="flex items-center pt-1">
										<CalendarDays className="mr-2" />

										<span className="text-xs text-muted-foreground">
											Inscription le 23 janvier 2021
										</span>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>

						<p className="text-sm text-muted-foreground">
							isa@example.com
						</p>
					</div>

					<div className="flex gap-3 sm:ml-auto">
						<Select
							disabled={isLoading}
							defaultValue="read"
							onValueChange={updateSharing}
						>
							<SelectTrigger className="ml-auto w-auto">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="write">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Écriture</span>
								</SelectItem>

								<SelectItem value="read">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Lecture</span>
								</SelectItem>

								<SelectItem value="admin">
									{isLoading && (
										<Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
									)}

									<span className="mr-2">Gestion</span>
								</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="destructive">
							<Trash className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</section>
		</>
	);
}