//
// Composant de gestion des partages d'un fichier.
//  Source : https://ui.shadcn.com/themes
//

"use client";

import { merge } from "@/utilities/tailwind";
import { useState } from "react";
import { Trash,
	Users,
	Loader2,
	UserCog,
	UserPlus,
	CalendarDays,
	ClipboardCopy } from "lucide-react";

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
import { ScrollArea } from "../../components/ui/scroll-area";
import { HoverCard,
	HoverCardContent,
	HoverCardTrigger } from "../../components/ui/hover-card";
import { Button, buttonVariants } from "../../components/ui/button";

const users = [
	{
		public_name: "John Doe",
		user_name: "johndoe245",
		email: "johndoe@gmail.com"
	},
	{
		public_name: "Jane Doe",
		user_name: "janedoe015",
		email: "janedoe@gmail.com"
	},
	{
		public_name: "Monroe Johnson",
		user_name: "monroejohn453",
		email: "monjohn@gmail.com"
	},
	{
		public_name: "William Smith",
		user_name: "willsmith963",
		email: "wsmith@gmail.com"
	}
];

export default function ShareManager()
{
	// Déclaration des constantes.
	const { toast } = useToast();

	// Déclaration des variables d'état.
	const [ search, setSearch ] = useState( "" );
	const [ isLoading, setIsLoading ] = useState( false );

	// Met à jour les informations de partage d'un utilisateur.
	const updateSharing = ( data: string ) =>
	{
		setIsLoading( true );

		setTimeout( () =>
		{
			toast( {
				title: "Vous avez soumis les informations suivantes :",
				description: (
					<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
						<code className="text-white">
							{JSON.stringify( data, null, 4 )}
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
			<Separator />

			{/* Liste des utilisateurs partagés */}
			<section>
				<h4 className="text-sm font-medium max-sm:text-center">
					<Users className="mr-2 inline h-4 w-4" />

					<span className="align-middle">Utilisateurs partagés</span>
				</h4>

				<div className="mt-3 flex flex-wrap items-center gap-3 max-sm:justify-center">
					{/* Avatar de l'utilisateur */}
					<Avatar>
						<AvatarImage src="/avatars/03.png" />
						<AvatarFallback>OM</AvatarFallback>
					</Avatar>

					{/* Informations complètes de l'utilisateur */}
					<div>
						<HoverCard>
							<HoverCardTrigger
								className={merge(
									buttonVariants( { variant: "link" } ),
									"h-auto cursor-pointer p-0 text-secondary-foreground"
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

					{/* Autorisations accordées */}
					<div className="flex gap-3 sm:ml-auto">
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

						<Button variant="destructive" disabled={isLoading}>
							<Trash className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap items-center gap-3 max-sm:justify-center">
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
									"h-auto cursor-pointer p-0 text-secondary-foreground"
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

					{/* Autorisations accordées */}
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

						<Button variant="destructive" disabled={isLoading}>
							<Trash className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</section>

			{/* Séparateur horizontal */}
			<Separator />

			{/* Ajout de nouveaux utilisateurs */}
			<section>
				<h4 className="text-sm font-medium max-sm:text-center">
					<UserCog className="mr-2 inline h-4 w-4" />

					<span className="align-middle">
						Recherche d&lsquo;utilisateurs
					</span>
				</h4>

				<Input
					type="text"
					value={search}
					onChange={( event ) => setSearch( event.target.value )}
					disabled={isLoading}
					minLength={1}
					maxLength={50}
					className="mt-3"
					spellCheck="false"
					placeholder="Rechercher..."
					autoComplete="off"
					autoCapitalize="off"
				/>

				<span className="my-4 ml-1 inline-block text-sm text-muted-foreground">
					{users.length} résultat(s) trouvés dans la base de données.
				</span>

				{/* Résultats de la recherche */}
				<ScrollArea className="h-24">
					<ul>
						{users.map( ( user, index ) => (
							<li
								key={user.user_name}
								className="flex flex-wrap items-center gap-3 max-sm:justify-center"
							>
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
												buttonVariants( {
													variant: "link"
												} ),
												"h-auto cursor-pointer p-0 text-secondary-foreground"
											)}
										>
											{user.public_name}
										</HoverCardTrigger>

										<HoverCardContent className="flex justify-between space-x-4">
											<Avatar>
												<AvatarImage src="https://github.com/vercel.png" />
												<AvatarFallback>
													IN
												</AvatarFallback>
											</Avatar>

											<div className="space-y-1">
												<h4 className="text-sm font-medium leading-none">
													{user.user_name}
												</h4>

												<p className="text-sm text-muted-foreground">
													{user.email}
												</p>

												<div className="flex items-center pt-1">
													<CalendarDays className="mr-2" />

													<span className="text-xs text-muted-foreground">
														Inscription le 23
														janvier 2021
													</span>
												</div>
											</div>
										</HoverCardContent>
									</HoverCard>

									<p className="text-sm text-muted-foreground">
										{user.email}
									</p>
								</div>

								{/* Bouton d'ajout de l'utilisateur */}
								<Button
									disabled={isLoading}
									className="mr-4 sm:ml-auto"
								>
									<UserPlus className="mr-2 h-4 w-4" />
									Ajouter
								</Button>

								{/* Séparateur horizontal */}
								{index !== users.length - 1 && (
									<Separator className="mb-3 mt-1" />
								)}
							</li>
						) )}
					</ul>
				</ScrollArea>
			</section>
		</>
	);
}