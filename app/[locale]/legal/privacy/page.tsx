//
// Route vers la page de la politique de confidentialité.
//

// Importation des dépendances.
import type { Metadata } from "next";
import { unstable_setRequestLocale, getTranslations } from "next-intl/server";

// Importation des fonctions utilitaires.
import { generateMetadata as getMetadata } from "../../layout";

// Importation des composants.
import { Separator } from "../../components/ui/separator";

// Déclaration des propriétés de la page.
export async function generateMetadata(): Promise<Metadata>
{
	const metadata = await getMetadata();
	const messages = await getTranslations();

	return {
		title: `${ messages( "header.privacy_policy" ) } – ${ metadata.title }`
	};
}

// Affichage de la page.
export default async function Page( {
	params: { locale }
}: {
	params: { locale: string };
} )
{
	// Définition de la langue de la page.
	unstable_setRequestLocale( locale );

	// Déclaration des constantes.
	const title = ( await getMetadata() ).title as string;

	// Affichage du rendu HTML de la page.
	return (
		<main className="container mx-auto max-w-[1440px] p-8 max-md:p-4 max-md:pb-8">
			{/* En-tête de la page */}
			<header>
				<h2 className="text-2xl font-bold tracking-tight">
					Politique de confidentialité
				</h2>

				<p className="text-muted-foreground">
					Vous voulez en savoir plus sur la manière dont nous traitons
					vos données personnelles ? C&lsquo;est bien par là !
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator className="mb-6 mt-4 md:mb-8 md:mt-6" />

			{/* Contenu principal */}
			<section className="flex flex-col space-y-6 text-justify text-sm">
				<h3 className="text-2xl font-bold tracking-tight">
					Introduction
				</h3>
				<p>
					Le site Internet {title} est détenu par Florian Trayon, qui
					est un contrôleur de données de vos données personnelles.
				</p>
				<p>
					Nous avons adopté cette politique de confidentialité, qui
					détermine la manière dont nous traitons les informations
					collectées par {title}, qui fournit également les raisons
					pour lesquelles nous devons collecter certaines données
					personnelles vous concernant. Par conséquent, vous devez
					lire cette politique de confidentialité avant
					d&lsquo;utiliser le site Internet de {title}.
				</p>
				<p>
					Nous prenons soin de vos données personnelles et nous nous
					engageons à en garantir la confidentialité et la sécurité.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Les informations personnelles que nous collectons :
				</h3>
				<p>
					Lorsque vous visitez le {title}, nous recueillons
					automatiquement certaines informations sur votre appareil,
					notamment des informations sur votre navigateur, votre
					adresse IP, votre fuseau horaire et certains des cookies
					installés sur votre appareil. En outre, lorsque vous
					naviguez sur le site, nous recueillons des informations sur
					les pages ou les produits individuels que vous consultez,
					sur les sites Internet ou les termes de recherche qui vous
					ont renvoyé au site et sur la manière dont vous interagissez
					avec le site. Nous désignons ces informations collectées
					automatiquement par le terme « informations sur les
					appareils ». En outre, nous pourrions collecter les données
					personnelles que vous nous fournissez (y compris, mais sans
					s&lsquo;y limiter, le nom, le prénom, l&lsquo;adresse, les
					informations de paiement, etc.) lors de l&lsquo;inscription
					afin de pouvoir exécuter le contrat.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Pourquoi traitons-nous vos données ?
				</h3>
				<p>
					Notre priorité absolue est la sécurité des données des
					clients et, à ce titre, nous ne pouvons traiter que des
					données minimales sur les utilisateurs, uniquement dans la
					mesure où cela est absolument nécessaire pour maintenir le
					site Internet. Les informations collectées automatiquement
					sont utilisées uniquement pour identifier les cas potentiels
					d&lsquo;abus et établir des informations statistiques
					concernant l&lsquo;utilisation du site Internet. Ces
					informations statistiques ne sont pas autrement agrégées de
					manière à identifier un utilisateur particulier du système.
				</p>
				<p>
					Vous pouvez visiter le site Internet sans nous dire qui vous
					êtes ni révéler d&lsquo;informations, par lesquelles
					quelqu&lsquo;un pourrait vous identifier comme un individu
					spécifique et identifiable. Toutefois, si vous souhaitez
					utiliser certaines fonctionnalités du site Internet, ou si
					vous souhaitez recevoir notre lettre d&lsquo;information ou
					fournir d&lsquo;autres détails en remplissant un formulaire,
					vous pouvez nous fournir des données personnelles, telles
					que votre e-mail, votre prénom, votre nom, votre ville de
					résidence, votre organisation, votre numéro de téléphone.
					Vous pouvez choisir de ne pas nous fournir vos données
					personnelles, mais il se peut alors que vous ne puissiez pas
					profiter de certaines fonctionnalités du site Internet. Par
					exemple, vous ne pourrez pas recevoir notre bulletin
					d&lsquo;information ou nous contacter directement à partir
					du site Internet. Les utilisateurs qui ne savent pas quelles
					informations sont obligatoires sont invités à nous contacter
					via{" "}
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>
					.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Vos droits :
				</h3>
				<p>
					Si vous êtes un résident européen, vous disposez des droits
					suivants liés à vos données personnelles :
				</p>
				<ul className="list-inside list-disc">
					<li>Le droit d&lsquo;être informé.</li>
					<li>Le droit d&lsquo;accès.</li>
					<li>Le droit de rectification.</li>
					<li>Le droit à l&lsquo;effacement.</li>
					<li>Le droit de restreindre le traitement.</li>
					<li>Le droit à la portabilité des données.</li>
					<li>Le droit d&lsquo;opposition.</li>
					<li>
						Les droits relatifs à la prise de décision automatisée
						et au profilage.
					</li>
				</ul>
				<p>
					Si vous souhaitez exercer ce droit, veuillez nous contacter
					via les coordonnées ci-dessous.
				</p>
				<p>
					En outre, si vous êtes un résident européen, nous notons que
					nous traitons vos informations afin d&lsquo;exécuter les
					contrats que nous pourrions avoir avec vous (par exemple, si
					vous passez une commande par le biais du site), ou autrement
					pour poursuivre nos intérêts commerciaux légitimes énumérés
					ci-dessus. En outre, veuillez noter que vos informations
					pourraient être transférées en dehors de l&lsquo;Europe, y
					compris au Canada et aux États-Unis.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Liens vers d&lsquo;autres sites Internet :
				</h3>
				<p>
					Notre site Internet peut contenir des liens vers
					d&lsquo;autres sites Internet qui ne sont pas détenus ou
					contrôlés par nous. Sachez que nous ne sommes pas
					responsables de ces autres sites Internet ou des pratiques
					de confidentialité des tiers. Nous vous encourageons à être
					attentif lorsque vous quittez notre site Internet et à lire
					les déclarations de confidentialité de chaque site Internet
					susceptible de collecter des informations personnelles.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Sécurité de l&lsquo;information :
				</h3>

				<p>
					Nous sécurisons les informations que vous fournissez sur des
					serveurs informatiques dans un environnement contrôlé et
					sécurisé, protégé contre tout accès, utilisation ou
					divulgation non autorisés. Nous conservons des garanties
					administratives, techniques et physiques raisonnables pour
					nous protéger contre tout accès, utilisation, modification
					et divulgation non autorisés des données personnelles sous
					son contrôle et sa garde. Toutefois, aucune transmission de
					données sur Internet ou sur un réseau sans fil ne peut être
					garantie.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Divulgation légale :
				</h3>
				<p>
					Nous divulguerons toute information que nous collectons,
					utilisons ou recevons si la loi l&lsquo;exige ou
					l&lsquo;autorise, par exemple pour nous conformer à une
					citation à comparaître ou à une procédure judiciaire
					similaire, et lorsque nous pensons de bonne foi que la
					divulgation est nécessaire pour protéger nos droits, votre
					sécurité ou celle d&lsquo;autrui, enquêter sur une fraude ou
					répondre à une demande du gouvernement.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					Informations de contact :
				</h3>
				<p>
					Si vous souhaitez nous contacter pour comprendre davantage
					la présente politique ou si vous souhaitez nous contacter
					concernant toute question relative aux droits individuels et
					à vos informations personnelles, vous pouvez envoyer un
					courriel à{" "}
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>
					.
				</p>
			</section>
		</main>
	);
}