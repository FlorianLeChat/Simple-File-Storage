//
// Composant de téléversement des fichiers.
//

"use client";

import { z } from "zod";
import schema from "@/schemas/file-upload";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { enGB, fr } from "date-fns/locale";
import { Loader2,
	ShieldCheck,
	UploadCloud,
	CalendarDays,
	ClipboardCopy,
	PlusCircleIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { formatSize } from "@/utilities/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import type { TableMeta } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { type FileAttributes } from "@/interfaces/File";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Progress } from "../../components/ui/progress";
import { Calendar } from "../../components/ui/calendar";
import { Select,
	SelectItem,
	SelectValue,
	SelectTrigger,
	SelectContent } from "../../components/ui/select";
import { Popover,
	PopoverTrigger,
	PopoverContent } from "../../components/ui/popover";
import { Form,
	FormItem,
	FormField,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription } from "../../components/ui/form";
import { uploadFiles } from "../actions";
import { Dialog,
	DialogClose,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription } from "../../components/ui/dialog";
import { Button, buttonVariants } from "../../components/ui/button";

export default function FileUpload( {
	states
}: {
	states: TableMeta<FileAttributes>;
} )
{
	// Déclaration des variables d'état.
	const session = useSession();
	const [ key, setKey ] = useState( "" );
	const [ quota, setQuota ] = useState( 0 );
	const [ isOpen, setOpen ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ uploadState, uploadAction ] = useFormState( uploadFiles, {
		success: true,
		reason: "",
		data: []
	} );

	// Déclaration des constantes.
	const today = new Date();
	const locale = useLocale();
	const oneYear = addDays( today, 365 );
	const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA ?? 0 );
	const dateFormat = locale === "fr" ? fr : enGB;
	const fileSchema = schema.omit( { upload: true } ).extend( {
		// Modification de la vérification du fichier pour prendre en compte
		//  la différence entre les données côté client et celles envoyées
		//  côté serveur.
		upload: z.string().min( 1 )
	} );
	const { setFiles } = states;

	// Déclaration du formulaire.
	const percent = Number( ( ( quota / maxQuota ) * 100 ).toFixed( 2 ) );
	const form = useForm<z.infer<typeof fileSchema>>( {
		resolver: zodResolver( fileSchema ),
		defaultValues: {
			upload: "",
			encryption: false,
			expiration: ""
		}
	} );

	// Chiffrement des fichiers à téléverser.
	const encryptFiles = async ( formData: FormData ) =>
	{
		// Génération d'une clé de chiffrement et
		//  sauvegarde dans une variable d'état.
		const decryptionKey = Buffer.from(
			crypto.getRandomValues( new Uint8Array( 32 ) )
		).toString( "base64" );

		setKey( decryptionKey );

		// Génération d'un vecteur d'initialisation.
		const iv = crypto.getRandomValues( new Uint8Array( 16 ) );

		// Importation de la clé de chiffrement.
		const cipher = await crypto.subtle.importKey(
			"raw",
			Buffer.from( decryptionKey, "base64" ),
			{
				name: "AES-GCM",
				length: 256
			},
			true,
			[ "encrypt", "decrypt" ]
		);

		// Récupération des fichiers à téléverser et
		//  suppression de ces derniers de la liste
		//  des fichiers à téléverser.
		const files = formData.getAll( "upload" ) as File[];

		formData.delete( "upload" );

		// Chiffrement des fichiers.
		await Promise.all(
			files.map( async ( file ) =>
			{
				// Récupération du contenu du fichier.
				const buffer = new Uint8Array( await file.arrayBuffer() );

				// Chiffrement du contenu du fichier.
				const encrypted = Buffer.concat( [
					iv,
					new Uint8Array(
						await crypto.subtle.encrypt(
							{
								iv,
								name: "AES-GCM"
							},
							cipher,
							buffer
						)
					)
				] );

				// Ajout du fichier chiffré à la liste
				//  des fichiers à téléverser.
				formData.append(
					"upload",
					new File( [ encrypted ], file.name, {
						type: file.type
					} )
				);
			} )
		);
	};

	// Mise à jour automatique du quota utilisateur.
	useEffect( () =>
	{
		setQuota(
			states.files.reduce(
				( total, file ) => total
					+ file.versions.reduce(
						( size, version ) => size + version.size,
						0
					),
				0
			)
		);
	}, [ states ] );

	// Vérification de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !uploadState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			setLoading( false );

			toast.error( "form.errors.update_failed", {
				description: "form.errors.server_error"
			} );

			return;
		}

		// On récupère ensuite une possible raison d'échec ainsi que
		//  l'état associé.
		const { success, reason, data } = uploadState;

		if ( reason === "" )
		{
			return;
		}

		// On vérifie également si le serveur a renvoyé la liste des
		//  fichiers téléversés avec succès.
		if ( data && data.length > 0 )
		{
			// Si c'est le cas, on ajoute les fichiers à la liste
			//  des fichiers déjà existants.
			const uploaded: FileAttributes[] = [];

			data.forEach( ( file ) =>
			{
				// Transformation de la chaîne JSON en objet.
				const json = JSON.parse( file ) as FileAttributes;

				// Ajout du fichier à la liste des fichiers téléversés.
				uploaded.push( {
					uuid: json.uuid,
					name: json.name,
					type: json.type,
					path: new URL( json.path, window.location.href ).href,
					owner: json.owner,
					status: json.status,
					shares: json.shares,
					versions: json.versions.map( ( version ) => ( {
						...version,
						date: new Date( version.date )
					} ) )
				} );
			} );

			// On filtre les fichiers déjà existants pour éviter les
			//  doublons avant de mettre à jour la liste des fichiers.
			setFiles( ( previous ) => [
				...previous.filter(
					( value ) => !uploaded.find( ( file ) => file.uuid === value.uuid )
				),
				...uploaded
			] );
		}

		// On informe après qu'une réponse a été reçue.
		setLoading( false );

		// On affiche enfin une notification avec la raison fournie
		//  avant de réinitialiser le formulaire en cas de succès.
		if ( success )
		{
			setOpen( false );

			form.reset();

			toast.success( "form.info.upload_success", {
				description: reason
			} );
		}
		else
		{
			toast.error( "form.errors.upload_failed", {
				description: reason
			} );
		}
	}, [ form, setFiles, uploadState ] );

	// Affichage de la fenêtre modale de clé de déchiffrement.
	if ( key && !isOpen )
	{
		return (
			<Dialog open onOpenChange={() => setKey( "" )}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<ShieldCheck className="mr-2 inline h-5 w-5 align-text-top" />
							Clé de déchiffrement
						</DialogTitle>

						<DialogDescription>
							Vous avez activé le chiffrement renforcé pour ce
							téléversement. Vos fichiers ont été chiffrés dans
							votre navigateur avec une clé de chiffrement
							aléatoire que vous seul pouvez utiliser pour les
							déchiffrer.
							<br />
							<br />
							Vous trouverez ci-dessous la clé de déchiffrement
							que vous devez conserver précieusement pour pouvoir
							accéder à vos fichiers ultérieurement.{" "}
							<strong>
								Si vous perdez cette clé, vous ne pourrez plus
								accéder à vos fichiers.
							</strong>
							<br />
							<br />
							<code>{key}</code>
						</DialogDescription>
					</DialogHeader>

					<DialogClose
						onClick={() =>
						{
							// Copie dans le presse-papiers.
							navigator.clipboard.writeText( key );

							// Réinitialisation de la variable d'état.
							setKey( "" );
						}}
						className={merge( buttonVariants(), "w-full" )}
					>
						<ClipboardCopy className="mr-2 h-4 w-4" />
						Copier dans le presse-papiers
					</DialogClose>
				</DialogContent>
			</Dialog>
		);
	}

	// Affichage du rendu HTML du composant.
	return (
		<Dialog
			open={isOpen}
			onOpenChange={( state ) =>
			{
				if ( !isLoading )
				{
					form.reset();
					setOpen( state );
				}
			}}
		>
			<DialogTrigger
				className={buttonVariants()}
				aria-controls="file-upload"
			>
				<PlusCircleIcon className="inline h-4 w-4 md:mr-2" />

				<p id="file-upload" className="max-md:hidden">
					Ajouter un fichier
				</p>
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[75%]">
				<Form {...form}>
					<form
						action={async ( formData: FormData ) =>
						{
							// Vérifications côté client.
							const state = await form.trigger();

							if ( !state )
							{
								return false;
							}

							// Activation de l'état de chargement.
							setLoading( true );

							// Vérification de l'activation du chiffrement
							//  renforcé (côté client).
							if ( formData.get( "encryption" ) === "on" )
							{
								await encryptFiles( formData );
							}

							// Récupération des données manquantes
							//  du formulaire.
							formData.set(
								"expiration",
								form.getValues( "expiration" )
							);

							// Exécution de l'action côté serveur.
							return serverAction( uploadAction, formData );
						}}
					>
						{/* Fichier(s) à téléverser */}
						<FormField
							name="upload"
							control={form.control}
							render={( { field } ) => (
								<FormItem>
									<FormLabel>
										<UploadCloud className="mr-2 inline h-6 w-6" />
										Téléversement de fichiers
									</FormLabel>

									<FormDescription>
										Tous les formats de fichiers sont
										acceptés. La vitesse de téléversement
										dépend de votre connexion Internet et
										des capacités matérielles de votre
										ordinateur.{" "}
										<strong>
											Si un fichier du même nom existe
											déjà, il sera remplacé et une
											nouvelle révision sera créée pour
											être restaurée ultérieurement si
											besoin.
										</strong>
									</FormDescription>

									<FormControl>
										<Input
											{...field}
											type="file"
											accept={
												process.env
													.NEXT_PUBLIC_ACCEPTED_FILE_TYPES
											}
											multiple
											disabled={isLoading}
											className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
										/>
									</FormControl>

									{session.data?.user?.role !== "admin" && (
										<>
											<Progress
												value={percent}
												className="h-1"
											/>

											<p className="!mt-1 text-sm text-muted-foreground">
												{percent.toLocaleString()}% du
												quota actuellement utilisés (
												{formatSize( quota )} /{" "}
												{formatSize( maxQuota )})
											</p>
										</>
									)}

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Paramètres avancés */}
						<details className="my-4">
							<summary className="cursor-pointer text-sm">
								Cliquez ici pour afficher les paramètres avancés
							</summary>

							{/* Chiffrement renforcé */}
							<FormField
								name="encryption"
								control={form.control}
								render={( { field } ) => (
									<FormItem className="mt-4">
										<FormLabel htmlFor={field.name}>
											<ShieldCheck className="mr-2 inline h-6 w-6" />
											Chiffrement renforcé{" "}
											<em>(optionnel)</em>
										</FormLabel>

										<FormDescription>
											Les fichiers sont chiffrés avec une
											clé de chiffrement connue uniquement
											par le serveur. Si vous activez
											cette option, le fichier sera
											chiffré dans votre navigateur avec
											une clé générée aléatoirement et ne
											sera pas transmise au serveur.{" "}
											<strong>
												Attention, une fois le fichier
												téléversé, une clé de
												déchiffrement sera affichée et
												vous devrez la conserver afin de
												pouvoir accéder au fichier. Si
												vous perdez cette clé, vous ne
												pourrez plus accéder au fichier.
											</strong>
										</FormDescription>

										<div className="flex items-center space-x-2">
											<FormControl>
												<Switch
													id={field.name}
													name={field.name}
													checked={field.value}
													disabled={isLoading}
													onCheckedChange={
														field.onChange
													}
												/>
											</FormControl>

											<Label
												htmlFor={field.name}
												className="leading-5"
											>
												Activer le chiffrement renforcé
											</Label>
										</div>

										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Date d'expiration */}
							<FormField
								name="expiration"
								control={form.control}
								render={( { field } ) => (
									<FormItem className="mt-4">
										<FormLabel>
											<CalendarDays className="mr-2 inline h-6 w-6" />
											Date d&lsquo;expiration{" "}
											<em>(optionnel)</em>
										</FormLabel>

										<FormDescription>
											Les nouveaux fichiers téléversés
											n&lsquo;ont pas de date
											d&lsquo;expiration par défaut. Si
											vous souhaitez que le fichier soit
											supprimé automatiquement après une
											certaine durée, entrez une date
											d&lsquo;expiration ici.{" "}
											<strong>
												Attention, une fois le fichier
												téléversé, vous ne pourrez plus
												changer sa date
												d&lsquo;expiration. La
												suppression du fichier sera
												effectuée à minuit le jour de
												l&lsquo;expiration.
											</strong>
										</FormDescription>

										<Popover>
											<FormControl>
												<PopoverTrigger
													disabled={isLoading}
													className={merge(
														buttonVariants( {
															variant: "outline"
														} ),
														"w-full justify-start text-left font-normal",
														!field.value
															&& "text-muted-foreground"
													)}
												>
													<CalendarDays className="mr-2 h-4 w-4" />

													{field.value ? (
														format(
															new Date(
																field.value
															),
															"PPP",
															{
																locale: dateFormat
															}
														)
													) : (
														<>
															Sélectionner une
															date
															d&lsquo;expiration
														</>
													)}
												</PopoverTrigger>
											</FormControl>

											<PopoverContent className="flex w-auto flex-col space-y-2 p-2">
												<Select
													onValueChange={( value ) => field.onChange(
														addDays(
															new Date(),
															Number( value )
														).toISOString()
													)}
												>
													<SelectTrigger>
														<SelectValue placeholder="Sélectionner une présélection" />
													</SelectTrigger>

													<SelectContent position="popper">
														<SelectItem value="1">
															Demain
														</SelectItem>

														<SelectItem value="3">
															Dans trois jours
														</SelectItem>

														<SelectItem value="7">
															Dans une semaine
														</SelectItem>

														<SelectItem value="31">
															Dans un mois
														</SelectItem>
													</SelectContent>
												</Select>

												<Calendar
													mode="single"
													locale={dateFormat}
													selected={
														new Date( field.value )
													}
													disabled={( date ) => date > oneYear
														|| date < today}
													onSelect={( value ) => field.onChange(
														value?.toISOString()
													)}
													className="rounded-md border"
													initialFocus
												/>
											</PopoverContent>
										</Popover>

										<FormMessage />
									</FormItem>
								)}
							/>
						</details>

						{/* Bouton de validation du formulaire */}
						<Button disabled={isLoading} className="w-full">
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Téléversement...
								</>
							) : (
								<>
									<PlusCircleIcon className="mr-2 h-4 w-4" />
									Téléverser
								</>
							)}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}