//
// Composant de téléversement des fichiers.
//

"use client";

import * as v from "valibot";
import schema from "@/schemas/file-upload";
import { toast } from "sonner";
import { merge } from "@/utilities/tailwind";
import { useForm } from "react-hook-form";
import serverAction from "@/utilities/recaptcha";
import { enGB, fr } from "date-fns/locale";
import { Loader2,
	FileArchive,
	ShieldCheck,
	UploadCloud,
	CalendarDays,
	ClipboardCopy,
	PlusCircleIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatSize } from "@/utilities/react-table";
import { useFormState } from "react-dom";
import type { TableMeta } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useEffect, useState } from "react";
import { type FileAttributes } from "@/interfaces/File";
import { useLocale, useTranslations } from "next-intl";

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
import { uploadFiles } from "../actions/file-upload";
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
	const formMessages = useTranslations( "form" );
	const modalMessages = useTranslations( "modals" );
	const [ key, setKey ] = useState( "" );
	const [ quota, setQuota ] = useState( 0 );
	const [ isOpen, setOpen ] = useState( false );
	const [ isLoading, setLoading ] = useState( false );
	const [ isEncrypted, setEncrypted ] = useState( false );
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
	const fileSchema = v.object( {
		// Modification de la vérification du fichier pour prendre en compte
		//  la différence entre les données côté client et celles envoyées
		//  côté serveur.
		...v.omit( schema, [ "upload" ] ).entries,
		...v.object( { upload: v.pipe( v.string(), v.minLength( 1 ) ) } ).entries
	} );
	const { setFiles } = states;

	// Déclaration du formulaire.
	const percent = Number( ( ( quota / maxQuota ) * 100 ).toFixed( 2 ) );
	const form = useForm<v.InferOutput<typeof fileSchema>>( {
		resolver: valibotResolver( fileSchema ),
		defaultValues: {
			upload: "",
			expiration: "",
			encryption: false,
			compression: false
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

			toast.error( formMessages( "infos.action_failed" ), {
				description: formMessages( "errors.server_error" )
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
					} ) ),
					expiration: json.expiration
						? new Date( json.expiration )
						: undefined
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
			setEncrypted( false );

			form.reset();

			toast.success( formMessages( "infos.action_success" ), {
				description: reason
			} );
		}
		else
		{
			toast.error( formMessages( "infos.action_failed" ), {
				description: reason
			} );
		}
	}, [ form, setFiles, formMessages, uploadState ] );

	// Affichage de la fenêtre modale de clé de déchiffrement.
	if ( key && !isOpen )
	{
		return (
			<Dialog defaultOpen open onOpenChange={() => setKey( "" )}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<ShieldCheck className="mr-2 inline h-5 w-5 align-text-top" />
							{modalMessages( "decryption_key.title" )}
						</DialogTitle>

						<DialogDescription>
							{modalMessages.rich( "decryption_key.description", {
								b: ( chunks ) => <strong>{chunks}</strong>
							} )}
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
						{modalMessages( "decryption_key.copy" )}
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

				<span id="file-upload" className="max-md:hidden">
					{modalMessages( "file-upload.trigger" )}
				</span>
			</DialogTrigger>

			<DialogContent className="h-fit max-h-[calc(100%-2rem)] overflow-auto max-sm:max-w-[calc(100%-2rem)] md:max-h-[75%]">
				<DialogHeader className="sr-only">
					<DialogTitle>
						{modalMessages( "file-upload.title" )}
					</DialogTitle>

					<DialogDescription>
						{modalMessages( "file-upload.description" )}
					</DialogDescription>
				</DialogHeader>

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

										{formMessages( "fields.upload_label" )}
									</FormLabel>

									<FormDescription>
										{formMessages.rich(
											"fields.upload_description",
											{
												b: ( chunks ) => (
													<strong
														hidden={
															!session.data?.user
																.preferences
																.versions
														}
													>
														{chunks}
													</strong>
												)
											}
										)}
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

											<p
												className="!mt-1 text-sm text-muted-foreground"
												suppressHydrationWarning
											>
												{modalMessages(
													"file-upload.quota",
													{
														percent:
															percent.toLocaleString(),
														current:
															formatSize( quota ),
														max: formatSize(
															maxQuota
														)
													}
												)}
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
								{modalMessages( "file-upload.advanced" )}
							</summary>

							{/* Compression */}
							<FormField
								name="compression"
								control={form.control}
								render={( { field } ) => (
									<FormItem className="mt-4">
										<FormLabel htmlFor={field.name}>
											<FileArchive className="mr-2 inline h-6 w-6" />

											{formMessages.rich(
												"fields.compression_label",
												{
													i: ( chunks ) => (
														<em>{chunks}</em>
													)
												}
											)}
										</FormLabel>

										<FormDescription>
											{formMessages.rich(
												"fields.compression_description",
												{
													b: ( chunks ) => (
														<strong>
															{chunks}
														</strong>
													)
												}
											)}
										</FormDescription>

										<div className="flex items-center space-x-2">
											<FormControl>
												<Switch
													id={field.name}
													name={field.name}
													checked={field.value}
													disabled={
														isLoading || isEncrypted
													}
													onCheckedChange={
														field.onChange
													}
												/>
											</FormControl>

											<Label
												htmlFor={field.name}
												className="leading-5"
											>
												{formMessages(
													"fields.compression_trigger"
												)}
											</Label>
										</div>

										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Chiffrement renforcé */}
							<FormField
								name="encryption"
								control={form.control}
								render={( { field } ) => (
									<FormItem className="mt-4">
										<FormLabel htmlFor={field.name}>
											<ShieldCheck className="mr-2 inline h-6 w-6" />

											{formMessages.rich(
												"fields.encryption_label",
												{
													i: ( chunks ) => (
														<em>{chunks}</em>
													)
												}
											)}
										</FormLabel>

										<FormDescription>
											{formMessages.rich(
												"fields.encryption_description",
												{
													b: ( chunks ) => (
														<strong>
															{chunks}
														</strong>
													)
												}
											)}
										</FormDescription>

										<div className="flex items-center space-x-2">
											<FormControl>
												<Switch
													id={field.name}
													name={field.name}
													checked={field.value}
													disabled={isLoading}
													onCheckedChange={( value ) =>
													{
														if ( value )
														{
															// Désactivation de la compression si
															//  le fichier est chiffré avant envoi.
															form.setValue(
																"compression",
																false
															);
														}

														// Mise à jour de l'état de chiffrement.
														field.onChange( value );

														setEncrypted( value );
													}}
												/>
											</FormControl>

											<Label
												htmlFor={field.name}
												className="leading-5"
											>
												{formMessages(
													"fields.encryption_trigger"
												)}
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

											{formMessages.rich(
												"fields.expiration_label",
												{
													i: ( chunks ) => (
														<em>{chunks}</em>
													)
												}
											)}
										</FormLabel>

										<FormDescription>
											{formMessages.rich(
												"fields.expiration_description",
												{
													b: ( chunks ) => (
														<strong>
															{chunks}
														</strong>
													)
												}
											)}
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

													{field.value
														? format(
															new Date(
																field.value
															),
															"PPP",
															{
																locale: dateFormat
															}
														)
														: formMessages(
															"fields.expiration_trigger"
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
														<SelectValue
															placeholder={formMessages(
																"fields.expiration_preset"
															)}
														/>
													</SelectTrigger>

													<SelectContent position="popper">
														<SelectItem value="1">
															{formMessages(
																"fields.expiration_tomorrow"
															)}
														</SelectItem>

														<SelectItem value="3">
															{formMessages(
																"fields.expiration_three_days"
															)}
														</SelectItem>

														<SelectItem value="7">
															{formMessages(
																"fields.expiration_week"
															)}
														</SelectItem>

														<SelectItem value="31">
															{formMessages(
																"fields.expiration_month"
															)}
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
														value?.toISOString() ?? ""
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
									{formMessages( "loading" )}
								</>
							) : (
								<>
									<PlusCircleIcon className="mr-2 h-4 w-4" />
									{modalMessages( "file-upload.submit" )}
								</>
							)}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}