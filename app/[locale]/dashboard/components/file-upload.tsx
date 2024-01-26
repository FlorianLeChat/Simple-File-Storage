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
import { Ban,
	Loader2,
	ShieldCheck,
	UploadCloud,
	CalendarDays,
	PlusCircleIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { formatSize } from "@/utilities/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { type FileAttributes } from "@/interfaces/File";
import type { Table, TableMeta } from "@tanstack/react-table";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Dialog,
	DialogClose,
	DialogTrigger,
	DialogContent } from "../../components/ui/dialog";
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
import { Button, buttonVariants } from "../../components/ui/button";

export default function FileUpload( {
	table
}: {
	table: Table<FileAttributes>;
} )
{
	// Déclaration des constantes.
	const today = new Date();
	const locale = useLocale();
	const states = table.options.meta as TableMeta<FileAttributes>;
	const oneYear = addDays( today, 365 );
	const maxQuota = Number( process.env.NEXT_PUBLIC_MAX_QUOTA ?? 0 );
	const dateFormat = locale === "fr" ? fr : enGB;
	const fileSchema = schema.omit( { upload: true } ).extend( {
		// Modification de la vérification du fichier pour prendre en compte
		//  la différence entre les données côté client et celles envoyées
		//  côté serveur.
		upload: z.string().min( 1 )
	} );

	// Déclaration des variables d'état.
	const session = useSession();
	const loading = states.loading.length !== 0;
	const [ open, setOpen ] = useState( false );
	const [ uploadState, uploadAction ] = useFormState( uploadFiles, {
		success: true,
		reason: "",
		data: []
	} );

	// Déclaration du formulaire.
	const percent = Number( ( ( states.quota / maxQuota ) * 100 ).toFixed( 2 ) );
	const form = useForm<z.infer<typeof fileSchema>>( {
		resolver: zodResolver( fileSchema ),
		defaultValues: {
			upload: "",
			encryption: false,
			expiration: ""
		}
	} );

	// Vérification de la response du serveur après l'envoi du formulaire.
	useEffect( () =>
	{
		// On vérifie d'abord si la variable d'état liée à l'action
		//  du formulaire est encore définie.
		if ( !uploadState )
		{
			// Si ce n'est pas le cas, quelque chose s'est mal passé au
			//  niveau du serveur.
			states.setLoading( [ "modal" ] );

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
				const json = JSON.parse( file ) as FileAttributes & {
					key?: string;
				};

				// Récupération de la clé de chiffrement si elle existe.
				if ( json.key )
				{
					toast.warning( "form.info.upload_encrypted", {
						action: {
							label: "Copier",
							onClick: ( event ) =>
							{
								// Suppression de la fermeture automatique.
								event.preventDefault();

								// Copie dans le presse-papier.
								navigator.clipboard.writeText(
									json.key as string
								);
							}
						},
						duration: 60 * 1000, // 1 minute.
						dismissible: false,
						description: "form.info.encryption_success"
					} );
				}

				// Ajout du fichier à la liste des fichiers téléversés.
				uploaded.push( {
					uuid: json.uuid,
					name: json.name,
					type: json.type,
					path: new URL( json.path, window.location.href ).href,
					status: json.status,
					encrypted: json.encrypted,
					versions: json.versions.map( ( version ) => ( {
						...version,
						date: new Date( version.date )
					} ) )
				} );
			} );

			// On filtre les fichiers déjà existants pour éviter
			//  les doublons avant de mettre à jour la liste des
			//  fichiers et le quota utilisateur.
			let newFiles: FileAttributes[] = [];

			states.setFiles( ( previous ) =>
			{
				newFiles = [
					...previous.filter(
						( value ) => uploaded.filter( ( file ) => file.uuid === value.uuid )
							.length === 0
					),
					...uploaded
				];

				return newFiles;
			} );

			states.setQuota(
				newFiles.reduce(
					( total, file ) => total
						+ file.versions.reduce(
							( size, version ) => size + version.size,
							0
						),
					0
				)
			);
		}

		// On réinitialise après une partie du formulaire en cas
		//  de succès avant de le fermer.
		if ( success )
		{
			form.reset();

			setOpen( false );
		}

		// On affiche enfin le message correspondant avant
		//  d'indiquer que le traitement est terminé.
		uploadState.reason = "";
		uploadState.data = undefined;

		states.setLoading( [] );

		if ( success )
		{
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
	}, [ form, states, uploadState ] );

	// Affichage du rendu HTML du composant.
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				className={buttonVariants( { variant: "default" } )}
				aria-controls="file-upload"
			>
				<PlusCircleIcon className="inline h-4 w-4 sm:mr-2" />

				<span id="file-upload" className="max-sm:hidden">
					Ajouter un fichier
				</span>
			</DialogTrigger>

			<DialogContent className="h-fit max-h-full overflow-auto">
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
							states.setLoading( [ "modal" ] );

							// Récupération des données du formulaire.
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
											disabled={loading}
											className="file:mr-2 file:cursor-pointer file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
										/>
									</FormControl>

									{session.data?.user?.role !== "admin" && (
										<>
											<Progress
												value={percent}
												className="h-1"
											/>

											<FormDescription className="!mt-1 text-sm text-muted-foreground">
												{percent.toLocaleString()}% du
												quota actuellement utilisés (
												{formatSize( states.quota )} /{" "}
												{formatSize( maxQuota )})
											</FormDescription>
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
										<FormLabel>
											<ShieldCheck className="mr-2 inline h-6 w-6" />
											Chiffrement renforcé{" "}
											<em>(optionnel)</em>
										</FormLabel>

										<FormDescription>
											Les fichiers sont chiffrés avec une
											clé de chiffrement connue uniquement
											par le serveur. Si vous activez
											cette option, le fichier sera
											chiffré avec une clé générée
											aléatoirement et ne sera pas
											enregistrée sur le serveur.{" "}
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

										<FormControl>
											<div className="flex items-center space-x-2">
												<Switch
													id="encryption"
													name="encryption"
													checked={field.value}
													disabled={loading}
													onCheckedChange={
														field.onChange
													}
												/>

												<Label
													htmlFor="encryption"
													className="leading-5"
												>
													Activer le chiffrement
													renforcé
												</Label>
											</div>
										</FormControl>

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

										<FormControl>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														disabled={loading}
														className={merge(
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
															<span>
																Sélectionner une
																date
															</span>
														)}
													</Button>
												</PopoverTrigger>

												<PopoverContent className="flex w-auto flex-col space-y-2 p-2">
													<Select
														onValueChange={(
															value
														) => field.onChange(
															addDays(
																new Date(),
																Number(
																	value
																)
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
															new Date(
																field.value
															)
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
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</details>

						{/* Bouton de validation du formulaire */}
						<Button
							disabled={loading}
							className="float-right ml-1 max-sm:w-[calc(50%-0.25rem)] sm:ml-2"
						>
							{loading ? (
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

						{/* Bouton de fermeture du formulaire */}
						<DialogClose
							onClick={() => form.reset()}
							disabled={loading}
							className={merge(
								buttonVariants( {
									variant: "outline"
								} ),
								"float-right max-sm:mr-1 max-sm:w-[calc(50%-0.25rem)]"
							)}
						>
							<Ban className="mr-2 h-4 w-4" />
							Annuler
						</DialogClose>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}