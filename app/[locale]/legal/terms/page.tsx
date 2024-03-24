//
// Route vers la page des conditions d'utilisation.
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
		title: `${ messages( "header.terms_of_service" ) } – ${ metadata.title }`
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
	const url = new URL( ( await getMetadata() )?.metadataBase ?? "" ).href;

	// Affichage du rendu HTML de la page.
	return (
		<main className="container mx-auto max-w-[1440px] p-8 max-md:p-4 max-md:pb-8">
			{/* En-tête de la page */}
			<header>
				<h2 className="text-2xl font-bold tracking-tight">
					Conditions d&lsquo;utilisation
				</h2>

				<p className="text-muted-foreground">
					Curieux de connaître les conditions d&lsquo;utilisation du
					site ? C&lsquo;est par ici !
				</p>
			</header>

			{/* Barre verticale de séparation */}
			<Separator className="mb-6 mt-4 md:mb-8 md:mt-6" />

			{/* Contenu principal */}
			<section className="flex flex-col space-y-6 text-justify text-sm">
				<h3 className="text-2xl font-bold tracking-tight">
					Définitions
				</h3>
				<p>
					<strong>Client :</strong> tout professionnel ou personne
					physique capable au sens des articles 1123 et suivants du
					Code civil, ou personne morale, qui visite le Site objet des
					présentes conditions générales.
					<br />
					<strong>Prestations et Services :</strong>{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					met à disposition des Clients :
				</p>
				<p>
					<strong>Contenu :</strong> Ensemble des éléments
					constituants l&lsquo;information présente sur le Site,
					notamment textes – images – vidéos.
				</p>
				<p>
					<strong>Informations clients :</strong> Ci après dénommé «
					Information(s) » qui correspondent à l&lsquo;ensemble des
					données personnelles susceptibles d&lsquo;être détenues par{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					pour la gestion de votre compte, de la gestion de la
					relation client et à des fins d&lsquo;analyses et de
					statistiques.
				</p>
				<p>
					<strong>Utilisateur :</strong> Internaute se connectant,
					utilisant le site susnommé.
				</p>
				<p>
					<strong>Informations personnelles :</strong> « Les
					informations qui permettent, sous quelque forme que ce soit,
					directement ou non, l&lsquo;identification des personnes
					physiques auxquelles elles s&lsquo;appliquent » (article 4
					de la loi n° 78-17 du 6 janvier 1978).
				</p>
				<p>
					Les termes « données à caractère personnel », « personne
					concernée », « sous traitant » et « données sensibles » ont
					le sens défini par le Règlement Général sur la Protection
					des Données (RGPD : n° 2016-679).
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					1. Présentation du site internet.
				</h3>
				<p>
					En vertu de l&lsquo;article 6 de la loi n° 2004-575 du 21
					juin 2004 pour la confiance dans l&lsquo;économie numérique,
					il est précisé aux utilisateurs du site internet{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					l&lsquo;identité des différents intervenants dans le cadre
					de sa réalisation et de son suivi :
				</p>
				<p>
					<strong>Propriétaire</strong> : Florian Trayon
					<br />
					<strong>Responsable publication</strong> : Florian Trayon –
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>
					<br />
					Le responsable publication est une personne physique ou une
					personne morale.
					<br />
					<strong>Webmaster</strong> : Florian Trayon –
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>
					<br />
					<strong>Hébergeur</strong> : OVH – 2 rue Kellermann 59100
					Roubaix 1007
					<br />
					<strong>Délégué à la protection des données</strong> :
					Florian Trayon –{" "}
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>
					<br />
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					2. Conditions générales d&lsquo;utilisation du site et des
					services proposés.
				</h3>
				<p>
					Le Site constitue une œuvre de l&lsquo;esprit protégée par
					les dispositions du Code de la Propriété Intellectuelle et
					des Réglementations Internationales applicables. Le Client
					ne peut en aucune manière réutiliser, céder ou exploiter
					pour son propre compte tout ou partie des éléments ou
					travaux du Site.
				</p>
				<p>
					L&lsquo;utilisation du site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					implique l&lsquo;acceptation pleine et entière des
					conditions générales d&lsquo;utilisation ci-après décrites.
					Ces conditions d&lsquo;utilisation sont susceptibles
					d&lsquo;être modifiées ou complétées à tout moment, les
					utilisateurs du site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					sont donc invités à les consulter de manière régulière.
				</p>
				<p>
					Ce site internet est normalement accessible à tout moment
					aux utilisateurs. Une interruption pour raison de
					maintenance technique peut être toutefois décidée par{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					, qui s&lsquo;efforcera alors de communiquer préalablement
					aux utilisateurs les dates et heures de
					l&lsquo;intervention. Le site Internet{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est mis à jour régulièrement par{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					responsable. De la même façon, les mentions légales peuvent
					être modifiées à tout moment : elles s&lsquo;imposent
					néanmoins à l&lsquo;utilisateur qui est invité à s&lsquo;y
					référer le plus souvent possible afin d&lsquo;en prendre
					connaissance.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					3. Description des services fournis.
				</h3>
				<p>
					Le site internet{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					a pour objet de fournir une information concernant
					l&lsquo;ensemble des activités de la société.
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					s&lsquo;efforce de fournir sur le site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					des informations aussi précises que possible. Toutefois, il
					ne pourra être tenu responsable des oublis, des
					inexactitudes et des carences dans la mise à jour,
					qu&lsquo;elles soient de son fait ou du fait des tiers
					partenaires qui lui fournissent ces informations.
				</p>
				<p>
					Toutes les informations indiquées sur le site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					sont données à titre indicatif, et sont susceptibles
					d&lsquo;évoluer. Par ailleurs, les renseignements figurant
					sur le site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ne sont pas exhaustifs. Ils sont donnés sous réserve de
					modifications ayant été apportées depuis leur mise en ligne.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					4. Limitations contractuelles sur les données techniques.
				</h3>
				<p>
					Le site utilise la technologie JavaScript. Le site Internet
					ne pourra être tenu responsable de dommages matériels liés à
					l&lsquo;utilisation du site. De plus, l&lsquo;utilisateur du
					site s&lsquo;engage à accéder au site en utilisant un
					matériel récent, ne contenant pas de virus et avec un
					navigateur de dernière génération mis-à-jour. Le site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est hébergé chez un prestataire sur le territoire de
					l&lsquo;Union Européenne conformément aux dispositions du
					Règlement Général sur la Protection des Données (RGPD : n°
					2016-679).
				</p>
				<p>
					L&lsquo;objectif est d&lsquo;apporter une prestation qui
					assure le meilleur taux d&lsquo;accessibilité.
					L&lsquo;hébergeur assure la continuité de son service 24
					Heures sur 24, tous les jours de l&lsquo;année. Il se
					réserve néanmoins la possibilité d&lsquo;interrompre le
					service d&lsquo;hébergement pour les durées les plus courtes
					possibles notamment à des fins de maintenance,
					d&lsquo;amélioration de ses infrastructures, de défaillance
					de ses infrastructures ou si les Prestations et Services
					génèrent un trafic réputé anormal.
				</p>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					et l&lsquo;hébergeur ne pourront être tenus responsables en
					cas de dysfonctionnement du réseau Internet, des lignes
					téléphoniques ou du matériel informatique et de téléphonie
					lié notamment à l&lsquo;encombrement du réseau empêchant
					l&lsquo;accès au serveur.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					5. Propriété intellectuelle et contrefaçons.
				</h3>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est propriétaire des droits de propriété intellectuelle et
					détient les droits d&lsquo;usage sur tous les éléments
					accessibles sur le site internet, notamment les textes,
					images, graphismes, logos, vidéos, icônes et sons. Toute
					reproduction, représentation, modification, publication,
					adaptation de tout ou partie des éléments du site, quel que
					soit le moyen ou le procédé utilisé, est interdite, sauf
					autorisation écrite préalable de :{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					.
				</p>
				<p>
					Toute exploitation non autorisée du site ou de l&lsquo;un
					quelconque des éléments qu&lsquo;il contient sera considérée
					comme constitutive d&lsquo;une contrefaçon et poursuivie
					conformément aux dispositions des articles L.335-2 et
					suivants du Code de Propriété Intellectuelle.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					6. Limitations de responsabilité.
				</h3>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					agit en tant qu&lsquo;éditeur du site.{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est responsable de la qualité et de la véracité du Contenu
					qu&lsquo;il publie.
				</p>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ne pourra être tenu responsable des dommages directs et
					indirects causés au matériel de l&lsquo;utilisateur, lors de
					l&lsquo;accès au site internet{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					, et résultant soit de l&lsquo;utilisation d&lsquo;un
					matériel ne répondant pas aux spécifications indiquées au
					point 4, soit de l&lsquo;apparition d&lsquo;un bug ou
					d&lsquo;une incompatibilité.
				</p>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ne pourra également être tenu responsable des dommages
					indirects (tels par exemple qu&lsquo;une perte de marché ou
					perte d&lsquo;une chance) consécutifs à l&lsquo;utilisation
					du site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					. Des espaces interactifs (possibilité de poser des
					questions dans l&lsquo;espace contact) sont à la disposition
					des utilisateurs.{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					se réserve le droit de supprimer, sans mise en demeure
					préalable, tout contenu déposé dans cet espace qui
					contreviendrait à la législation applicable en France, en
					particulier aux dispositions relatives à la protection des
					données. Le cas échéant,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					se réserve également la possibilité de mettre en cause la
					responsabilité civile et/ou pénale de l&lsquo;utilisateur,
					notamment en cas de message à caractère raciste, injurieux,
					diffamant, ou pornographique, quel que soit le support
					utilisé (texte, photographie …).
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					7. Gestion des données personnelles.
				</h3>
				<p>
					Le Client est informé des réglementations concernant la
					communication marketing, la loi du 21 Juin 2014 pour la
					confiance dans l&lsquo;Économie Numérique, la Loi
					Informatique et Liberté du 06 Août 2004 ainsi que du
					Règlement Général sur la Protection des Données (RGPD : n°
					2016-679).
				</p>
				<h4 className="text-xl font-medium">
					7.1 Responsables de la collecte des données personnelles
				</h4>
				<p>
					Pour les Données Personnelles collectées dans le cadre de la
					création du compte personnel de l&lsquo;Utilisateur et de sa
					navigation sur le Site, le responsable du traitement des
					Données Personnelles est : Florian Trayon.{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					est représenté par Florian Trayon, son représentant légal.
				</p>
				<p>
					En tant que responsable du traitement des données
					qu&lsquo;il collecte,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					s&lsquo;engage à respecter le cadre des dispositions légales
					en vigueur. Il lui appartient notamment au Client
					d&lsquo;établir les finalités de ses traitements de données,
					de fournir à ses prospects et clients, à partir de la
					collecte de leurs consentements, une information complète
					sur le traitement de leurs données personnelles et de
					maintenir un registre des traitements conforme à la réalité.
					Chaque fois que{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					traite des Données Personnelles,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					prend toutes les mesures raisonnables pour s&lsquo;assurer
					de l&lsquo;exactitude et de la pertinence des Données
					Personnelles au regard des finalités pour lesquelles{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					les traite.
				</p>
				<h4 className="text-xl font-medium">
					7.2 Finalité des données collectées
				</h4>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est susceptible de traiter tout ou partie des données :
				</p>
				<ul className="list-inside list-disc">
					<li>
						pour permettre la navigation sur le Site et la gestion
						et la traçabilité des prestations et services commandés
						par l&lsquo;utilisateur : données de connexion et
						d&lsquo;utilisation du Site, facturation, historique des
						commandes, etc.
					</li>

					<li>
						pour prévenir et lutter contre la fraude informatique
						(spamming, hacking…) : matériel informatique utilisé
						pour la navigation, l&lsquo;adresse IP, le mot de passe
						(hashé)
					</li>

					<li>
						pour améliorer la navigation sur le Site : données de
						connexion et d&lsquo;utilisation
					</li>

					<li>
						pour mener des enquêtes de satisfaction facultatives sur{" "}
						<a
							rel="noopener noreferrer"
							href={url}
							target="_blank"
							className="underline decoration-dotted underline-offset-4"
						>
							{url}
						</a>{" "}
						: adresse électronique
					</li>

					<li>
						pour mener des campagnes de communication (sms,
						courriel) : numéro de téléphone, adresse électronique
					</li>
				</ul>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ne commercialise pas vos données personnelles qui sont donc
					uniquement utilisées par nécessité ou à des fins
					statistiques et d&lsquo;analyses.
				</p>
				<h4 className="text-xl font-medium">
					7.3 Droit d&lsquo;accès, de rectification et
					d&lsquo;opposition
				</h4>
				<p>
					Conformément à la réglementation européenne en vigueur, les
					Utilisateurs de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					disposent des droits suivants :
				</p>
				<ul className="list-inside list-disc">
					<li>
						droit d&lsquo;accès (article 15 RGPD) et de
						rectification (article 16 RGPD), de mise à jour, de
						complétude des données des Utilisateurs droit de
						verrouillage ou d&lsquo;effacement des données des
						Utilisateurs à caractère personnel (article 17 du RGPD),
						lorsqu&lsquo;elles sont inexactes, incomplètes,
						équivoques, périmées, ou dont la collecte,
						l&lsquo;utilisation, la communication ou la conservation
						est interdite
					</li>

					<li>
						droit de retirer à tout moment un consentement (article
						13-2c RGPD)
					</li>

					<li>
						droit à la limitation du traitement des données des
						Utilisateurs (article 18 RGPD)
					</li>

					<li>
						droit d&lsquo;opposition au traitement des données des
						Utilisateurs (article 21 RGPD)
					</li>

					<li>
						droit à la portabilité des données que les Utilisateurs
						auront fournies, lorsque ces données font l&lsquo;objet
						de traitements automatisés fondés sur leur consentement
						ou sur un contrat (article 20 RGPD)
					</li>

					<li>
						droit de définir le sort des données des Utilisateurs
						après leur mort et de choisir à qui{" "}
						<a
							rel="noopener noreferrer"
							href={url}
							target="_blank"
							className="underline decoration-dotted underline-offset-4"
						>
							{url}
						</a>{" "}
						devra communiquer (ou non) ses données à un tiers
						qu&lsquo;ils aura préalablement désigné
					</li>
				</ul>
				<p>
					Dès que{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					a connaissance du décès d&lsquo;un Utilisateur et à défaut
					d&lsquo;instructions de sa part,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					s&lsquo;engage à détruire ses données, sauf si leur
					conservation s&lsquo;avère nécessaire à des fins probatoires
					ou pour répondre à une obligation légale.
				</p>
				<p>
					Si l&lsquo;Utilisateur souhaite savoir comment{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					utilise ses Données Personnelles, demander à les rectifier
					ou s&lsquo;oppose à leur traitement, l&lsquo;Utilisateur
					peut contacter{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					par écrit à l&lsquo;adresse suivante :
				</p>
				Florian Trayon – DPO, Florian Trayon <br />
				98 bd Édouard Herriot 06204 Nice Cedex 3.
				<p>
					Dans ce cas, l&lsquo;Utilisateur doit indiquer les Données
					Personnelles qu&lsquo;il souhaiterait que{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					corrige, mette à jour ou supprime, en s&lsquo;identifiant
					précisément avec une copie d&lsquo;une pièce
					d&lsquo;identité (carte d&lsquo;identité ou passeport).
				</p>
				<p>
					Les demandes de suppression de Données Personnelles seront
					soumises aux obligations qui sont imposées à{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					par la loi, notamment en matière de conservation ou
					d&lsquo;archivage des documents. Enfin, les Utilisateurs de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					peuvent déposer une réclamation auprès des autorités de
					contrôle, et notamment de la CNIL
					(https://www.cnil.fr/fr/plaintes).
				</p>
				<h4 className="text-xl font-medium">
					7.4 Non-communication des données personnelles
				</h4>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					s&lsquo;interdit de traiter, héberger ou transférer les
					Informations collectées sur ses Clients vers un pays situé
					en dehors de l&lsquo;Union européenne ou reconnu comme « non
					adéquat » par la Commission européenne sans en informer
					préalablement le client. Pour autant,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					reste libre du choix de ses sous-traitants techniques et
					commerciaux à la condition qu&lsquo;il présentent les
					garanties suffisantes au regard des exigences du Règlement
					Général sur la Protection des Données (RGPD : n° 2016-679).
				</p>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					s&lsquo;engage à prendre toutes les précautions nécessaires
					afin de préserver la sécurité des Informations et notamment
					qu&lsquo;elles ne soient pas communiquées à des personnes
					non autorisées. Cependant, si un incident impactant
					l&lsquo;intégrité ou la confidentialité des Informations du
					Client est portée à la connaissance de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					, celle-ci devra dans les meilleurs délais informer le
					Client et lui communiquer les mesures de corrections prises.
					Par ailleurs{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ne collecte aucune « données sensibles ».
				</p>
				<p>
					Les Données Personnelles de l&lsquo;Utilisateur peuvent être
					traitées par des filiales de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					et des sous-traitants (prestataires de services),
					exclusivement afin de réaliser les finalités de la présente
					politique.
				</p>
				<p>
					Dans la limite de leurs attributions respectives et pour les
					finalités rappelées ci-dessus, les principales personnes
					susceptibles d&lsquo;avoir accès aux données des
					Utilisateurs de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					sont principalement les agents de notre service client.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					8. Notification d&lsquo;incident
				</h3>
				<p>
					Quels que soient les efforts fournis, aucune méthode de
					transmission sur Internet et aucune méthode de stockage
					électronique n&lsquo;est complètement sûre. Nous ne pouvons
					en conséquence pas garantir une sécurité absolue. Si nous
					prenions connaissance d&lsquo;une brèche de la sécurité,
					nous avertirions les utilisateurs concernés afin
					qu&lsquo;ils puissent prendre les mesures appropriées. Nos
					procédures de notification d&lsquo;incident tiennent compte
					de nos obligations légales, qu&lsquo;elles se situent au
					niveau national ou européen. Nous nous engageons à informer
					pleinement nos clients de toutes les questions relevant de
					la sécurité de leur compte et à leur fournir toutes les
					informations nécessaires pour les aider à respecter leurs
					propres obligations réglementaires en matière de reporting.
				</p>
				<p>
					Aucune information personnelle de l&lsquo;utilisateur du
					site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					n&lsquo;est publiée à l&lsquo;insu de l&lsquo;utilisateur,
					échangée, transférée, cédée ou vendue sur un support
					quelconque à des tiers. Seule l&lsquo;hypothèse du rachat de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					et de ses droits permettrait la transmission des dites
					informations à l&lsquo;éventuel acquéreur qui serait à son
					tour tenu de la même obligation de conservation et de
					modification des données vis à vis de l&lsquo;utilisateur du
					site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					.
				</p>
				<h4 className="text-xl font-medium">Sécurité</h4>
				<p>
					Pour assurer la sécurité et la confidentialité des Données
					Personnelles et des Données Personnelles de Santé,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					utilise des réseaux protégés par des dispositifs standards
					tels que par pare-feu, la pseudonymisation,
					l&lsquo;encryption et mot de passe.
				</p>
				<p>
					Lors du traitement des Données Personnelles,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					prend toutes les mesures raisonnables visant à les protéger
					contre toute perte, utilisation détournée, accès non
					autorisé, divulgation, altération ou destruction.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					9. Liens hypertextes « cookies » et balises (« tags »)
					internet
				</h3>
				<p>
					Le site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					contient un certain nombre de liens hypertextes vers
					d&lsquo;autres sites, mis en place avec l&lsquo;autorisation
					de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					. Cependant,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					n&lsquo;a pas la possibilité de vérifier le contenu des
					sites ainsi visités, et n&lsquo;assumera en conséquence
					aucune responsabilité de ce fait.
				</p>
				<p>
					Sauf si vous décidez de désactiver les cookies, vous
					acceptez que le site puisse les utiliser. Vous pouvez à tout
					moment désactiver ces cookies et ce gratuitement à partir
					des possibilités de désactivation qui vous sont offertes et
					rappelées ci-après, sachant que cela peut réduire ou
					empêcher l&lsquo;accessibilité à tout ou partie des Services
					proposés par le site.
				</p>
				<h4 className="text-xl font-medium">9.1. « COOKIES »</h4>
				<p>
					Un « cookie » est un petit fichier d&lsquo;information
					envoyé sur le navigateur de l&lsquo;Utilisateur et
					enregistré au sein du terminal de l&lsquo;Utilisateur (ex :
					ordinateur, smartphone), (ci-après « Cookies »). Ce fichier
					comprend des informations telles que le nom de domaine de
					l&lsquo;Utilisateur, le fournisseur d&lsquo;accès Internet
					de l&lsquo;Utilisateur, le système d&lsquo;exploitation de
					l&lsquo;Utilisateur, ainsi que la date et l&lsquo;heure
					d&lsquo;accès. Les Cookies ne risquent en aucun cas
					d&lsquo;endommager le terminal de l&lsquo;Utilisateur.
				</p>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est susceptible de traiter les informations de
					l&lsquo;Utilisateur concernant sa visite du Site, telles que
					les pages consultées, les recherches effectuées. Ces
					informations permettent à{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					d&lsquo;améliorer le contenu du Site, de la navigation de
					l&lsquo;Utilisateur.
				</p>
				<p>
					Les Cookies facilitant la navigation et/ou la fourniture des
					services proposés par le Site, l&lsquo;Utilisateur peut
					configurer son navigateur pour qu&lsquo;il lui permette de
					décider s&lsquo;il souhaite ou non les accepter de manière à
					ce que des Cookies soient enregistrés dans le terminal ou,
					au contraire, qu&lsquo;ils soient rejetés, soit
					systématiquement, soit selon leur émetteur.
					L&lsquo;Utilisateur peut également configurer son logiciel
					de navigation de manière à ce que l&lsquo;acceptation ou le
					refus des Cookies lui soient proposés ponctuellement, avant
					qu&lsquo;un Cookie soit susceptible d&lsquo;être enregistré
					dans son terminal.{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					informe l&lsquo;Utilisateur que, dans ce cas, il se peut que
					les fonctionnalités de son logiciel de navigation ne soient
					pas toutes disponibles.
				</p>
				<p>
					Si l&lsquo;Utilisateur refuse l&lsquo;enregistrement de
					Cookies dans son terminal ou son navigateur, ou si
					l&lsquo;Utilisateur supprime ceux qui y sont enregistrés,
					l&lsquo;Utilisateur est informé que sa navigation et son
					expérience sur le Site peuvent être limitées. Cela pourrait
					également être le cas lorsque{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ou l&lsquo;un de ses prestataires ne peut pas reconnaître, à
					des fins de compatibilité technique, le type de navigateur
					utilisé par le terminal, les paramètres de langue et
					d&lsquo;affichage ou le pays depuis lequel le terminal
					semble connecté à Internet.
				</p>
				<p>
					Le cas échéant,{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					décline toute responsabilité pour les conséquences liées au
					fonctionnement dégradé du Site et des services
					éventuellement proposés par{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					, résultant (i) du refus de Cookies par l&lsquo;Utilisateur
					(ii) de l&lsquo;impossibilité pour{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					d&lsquo;enregistrer ou de consulter les Cookies nécessaires
					à leur fonctionnement du fait du choix de
					l&lsquo;Utilisateur. Pour la gestion des Cookies et des
					choix de l&lsquo;Utilisateur, la configuration de chaque
					navigateur est différente. Elle est décrite dans le menu
					d&lsquo;aide du navigateur, qui permettra de savoir de
					quelle manière l&lsquo;Utilisateur peut modifier ses
					souhaits en matière de Cookies.
				</p>
				<p>
					À tout moment, l&lsquo;Utilisateur peut faire le choix
					d&lsquo;exprimer et de modifier ses souhaits en matière de
					Cookies.{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					pourra en outre faire appel aux services de prestataires
					externes pour l&lsquo;aider à recueillir et traiter les
					informations décrites dans cette section.
				</p>
				<p>
					Enfin, en cliquant sur les icônes dédiées aux réseaux
					sociaux Twitter, Facebook, Linkedin et Google Plus figurant
					sur le Site de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					ou dans son application mobile et si l&lsquo;Utilisateur a
					accepté le dépôt de cookies en poursuivant sa navigation sur
					le Site Internet ou l&lsquo;application mobile de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					, Twitter, Facebook, Linkedin et Google Plus peuvent
					également déposer des cookies sur vos terminaux (ordinateur,
					tablette, téléphone portable).
				</p>
				<p>
					Ces types de cookies ne sont déposés sur vos terminaux
					qu&lsquo;à condition que vous y consentiez, en continuant
					votre navigation sur le Site Internet ou l&lsquo;application
					mobile de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					. À tout moment, l&lsquo;Utilisateur peut néanmoins revenir
					sur son consentement à ce que{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					dépose ce type de cookies.
				</p>
				<h4 className="text-xl font-medium">
					9.2. BALISES (« TAGS ») INTERNET
				</h4>
				<p>
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					peut employer occasionnellement des balises Internet
					(également appelées « tags », ou balises d&lsquo;action, GIF
					à un pixel, GIF transparents, GIF invisibles et GIF un à un)
					et les déployer par l&lsquo;intermédiaire d&lsquo;un
					partenaire spécialiste d&lsquo;analyses Web susceptible de
					se trouver (et donc de stocker les informations
					correspondantes, y compris l&lsquo;adresse IP de
					l&lsquo;Utilisateur) dans un pays étranger.
				</p>
				<p>
					Ces balises sont placées à la fois dans les publicités en
					ligne permettant aux internautes d&lsquo;accéder au Site, et
					sur les différentes pages de celui-ci.
				</p>
				<p>
					Cette technologie permet à{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					d&lsquo;évaluer les réponses des visiteurs face au Site et
					l&lsquo;efficacité de ses actions (par exemple, le nombre de
					fois où une page est ouverte et les informations
					consultées), ainsi que l&lsquo;utilisation de ce Site par
					l&lsquo;Utilisateur.
				</p>
				<p>
					Le prestataire externe pourra éventuellement recueillir des
					informations sur les visiteurs du Site et d&lsquo;autres
					sites Internet grâce à ces balises, constituer des rapports
					sur l&lsquo;activité du Site à l&lsquo;attention de{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>
					, et fournir d&lsquo;autres services relatifs à
					l&lsquo;utilisation de celui-ci et d&lsquo;Internet.
				</p>
				<h3 className="text-2xl font-bold tracking-tight">
					10. Droit applicable et attribution de juridiction.
				</h3>
				<p>
					Tout litige en relation avec l&lsquo;utilisation du site{" "}
					<a
						rel="noopener noreferrer"
						href={url}
						target="_blank"
						className="underline decoration-dotted underline-offset-4"
					>
						{url}
					</a>{" "}
					est soumis au droit français. En dehors des cas où la loi ne
					le permet pas, il est fait attribution exclusive de
					juridiction aux tribunaux compétents de Cannes.
				</p>
			</section>
		</main>
	);
}