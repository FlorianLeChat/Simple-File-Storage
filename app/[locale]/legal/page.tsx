//
// Route vers la page des mentions légales.
//

// Importation des dépendances.
import { setRequestLocale } from "next-intl/server";

// Affichage de la page.
export default async function Page( {
	params
}: Readonly<{
	params: Promise<{ locale: string }>;
}> )
{
	// Définition de la langue de la page.
	const { locale } = await params;

	setRequestLocale( locale );

	// Affichage conditionnel du rendu HTML de la page.
	if ( locale === "fr" )
	{
		return (
			<>
				<em>Applicable à partir du 1er janvier 2025.</em>

				<h3 className="text-2xl font-bold tracking-tight">Crédits</h3>

				<p>
					Le site de téléversement de fichiers en ligne accessible à
					l&lsquo;adresse{" "}
					<a
						href="https://files.florian-dev.fr/"
						className="underline decoration-dotted underline-offset-4"
					>
						https://files.florian-dev.fr/
					</a>{" "}
					a été créée et est maintenue par Florian Trayon (personne
					physique). Le site Internet est hébergé par OVH – 2 rue
					Kellermann – 59100 Roubaix – France.
				</p>

				<p>
					Le responsable du traitement, de la publication et des
					données personnelles (DPO) est Florian Trayon. Pour toute
					question relative à la gestion de vos données personnelles
					par ce site, veuillez nous contacter à l&lsquo;adresse
					suivante :{" "}
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>{" "}
					ou via le formulaire de contact intégré.
				</p>

				<h3 className="text-2xl font-bold tracking-tight">
					Respect de la vie privée
				</h3>

				<p>
					Le service proposé par Simple File Storage se veut
					exemplaire en matière de respect de la vie privée.
					C&lsquo;est pourquoi la collecte de données personnelles est
					limitée au strict nécessaire.
				</p>

				<p>
					<strong>Premièrement</strong>, l&lsquo;utilisation de Google
					Analytics est restreinte au strict nécessaire et requiert
					explicitement votre consentement. Vous pouvez désactiver
					Google Analytics sans affecter le fonctionnement du site,
					celui-ci est utilisé pour obtenir des statistiques de
					fréquentation. Notez que les scripts de Google ne sont pas
					chargés si vous refusez leur utilisation. Si vous les
					acceptez, ces scripts sont alors chargés depuis les serveurs
					de Google et soumis à leur politique de confidentialité
					ainsi qu&lsquo;à leurs conditions générales
					d&lsquo;utilisation.
				</p>

				<p>
					<strong>Deuxièmement</strong>, les mots de passe, données
					sensibles, fichiers téléversés sont hachés, chiffrés et
					salés conformément aux normes de sécurité les plus récentes
					et aux bonnes pratiques avant d&lsquo;être enregistrés dans
					la base de données. Nous mettons tout en œuvre pour garantir
					l&lsquo;intégrité des données transmises et pour empêcher
					tout accès non autorisé par des tiers. Si vous avez des
					interrogations quant à la manière dont nous utilisons ou
					traitons vos données, sachez que le code source complet du
					site est accessible sur GitHub.
				</p>

				<p>
					<strong>Enfin</strong>, en ce qui concerne la
					journalisation, nous limitons la collecte des données au
					strict nécessaire. Ces dernières sont utilisées uniquement à
					des fins de débogage et de surveillance technique.
				</p>

				<h3 className="text-2xl font-bold tracking-tight">
					Conditions d&lsquo;utilisation
				</h3>

				<p>
					Toute personne utilisant les services de Simple File Storage
					s&lsquo;engage à respecter les présentes conditions
					générales d&lsquo;utilisation. L&lsquo;utilisation de Simple
					File Storage est libre et gratuite, quel que soit le cadre,
					le code source du projet étant disponible sur GitHub.
					Néanmoins, toute activité malveillante ou illicite est
					strictement interdite.
				</p>

				<p>
					Nous nous réservons le droit de supprimer, sans préavis, le
					service ou l&lsquo;accès aux comptes utilisateurs ou des
					fichiers téléversés, en cas d&lsquo;utilisation abusive. En
					cas de perte de l&lsquo;accès à votre compte utilisateur,
					nous ne pourrons pas vous restituer un mot de passe oublié,
					car nous n&lsquo;en connaissons pas la valeur. Ce principe
					s&lsquo;applique également aux fichiers téléversés avec une
					clé de chiffrement différente de celle utilisée par le
					serveur.
				</p>

				<p>
					Conformément au Règlement Général sur la Protection des
					Données, vous disposez d&lsquo;un droit d&lsquo;accès, de
					rectification, de modification et de suppression des données
					personnelles que vous nous avez communiquées. Vous pouvez
					exercer ce droit à tout moment en écrivant à :{" "}
					<a
						href="mailto:contact@florian-dev.fr"
						className="underline decoration-dotted underline-offset-4"
					>
						contact@florian-dev.fr
					</a>{" "}
					.
				</p>

				<h3 className="text-2xl font-bold tracking-tight">
					Responsabilité
				</h3>

				<p>
					Le service est fourni tel quel. L&lsquo;utilisation du
					service relève de la seule responsabilité de
					l&lsquo;utilisateur, et nous ne saurions être tenus
					responsables de tout préjudice résultant de son utilisation.
					Nous ne pourrons pas être tenus responsables de toute
					indisponibilité du service, nous nous efforçons de le
					maintenir en ligne 24h/24 et 7j/7 jusqu&lsquo;à sa mise hors
					service.
				</p>

				<h3 className="text-2xl font-bold tracking-tight">
					Droit applicable
				</h3>

				<p>
					Les présentes conditions générales d&lsquo;utilisation ainsi
					que l&lsquo;ensemble du contenu du site sont soumis à la
					législation française. Tout litige relatif à leur
					interprétation relèvera de la compétence exclusive du
					tribunal de commerce de Nice.
				</p>
			</>
		);
	}

	return (
		<>
			<em>Effective from January 1, 2025.</em>

			<h3 className="text-2xl font-bold tracking-tight">Credits</h3>

			<p>
				The online file upload site accessible at{" "}
				<a
					href="https://files.florian-dev.fr/"
					className="underline decoration-dotted underline-offset-4"
				>
					https://files.florian-dev.fr/
				</a>{" "}
				was created and is maintained by Florian Trayon (an individual).
				The website is hosted by OVH – 2 rue Kellermann – 59100 Roubaix
				– France.
			</p>

			<p>
				The data controller, publisher, and Data Protection Officer
				(DPO) is Florian Trayon. For any questions regarding the
				management of your personal data by this site, please contact us
				at the following address:{" "}
				<a
					href="mailto:contact@florian-dev.fr"
					className="underline decoration-dotted underline-offset-4"
				>
					contact@florian-dev.fr
				</a>{" "}
				or via the integrated contact form.
			</p>

			<h3 className="text-2xl font-bold tracking-tight">
				Privacy Policy
			</h3>

			<p>
				The service offered by Simple File Storage strives to be
				exemplary in terms of privacy. That is why the collection of
				personal data is limited to what is strictly necessary.
			</p>

			<p>
				<strong>Firstly</strong>, the use of Google Analytics is
				restricted to what is strictly necessary and explicitly requires
				your consent. You can disable Google Analytics without affecting
				the functionality of the site, as it is used to obtain traffic
				statistics. Please note that Google’s scripts are not loaded if
				you refuse their use. If you accept them, these scripts are then
				loaded from Google’s servers and are subject to their privacy
				policy as well as their terms of use.
			</p>

			<p>
				<strong>Secondly</strong>, passwords, sensitive data, and
				uploaded files are hashed, encrypted, and salted in accordance
				with the latest security standards and best practices before
				being stored in the database. We do everything possible to
				ensure the integrity of the transmitted data and to prevent any
				unauthorized access by third parties. If you have any questions
				about how we use or process your data, please note that the
				complete source code of the site is available on GitHub.
			</p>

			<p>
				<strong>Finally</strong>, regarding logging, we limit data
				collection to what is strictly necessary. This data is used
				solely for debugging and technical monitoring purposes.
			</p>

			<h3 className="text-2xl font-bold tracking-tight">Terms of Use</h3>

			<p>
				Any person using the services of Simple File Storage agrees to
				abide by these general terms of use. The use of Simple File
				Storage is free and unrestricted, regardless of the context,
				with the project&lsquo;s source code being available on GitHub.
				However, any malicious or illegal activity is strictly
				prohibited.
			</p>

			<p>
				We reserve the right to delete, without notice, the service or
				access to user accounts or uploaded files in the event of
				abusive use. In the event of losing access to your user account,
				we will not be able to recover a forgotten password, as we do
				not know its value. This principle also applies to files
				uploaded with an encryption key different from the one used by
				the server.
			</p>

			<p>
				In accordance with the General Data Protection Regulation
				(GDPR), you have the right to access, rectify, modify, and
				delete the personal data you have provided to us. You can
				exercise this right at any time by writing to:{" "}
				<a
					href="mailto:contact@florian-dev.fr"
					className="underline decoration-dotted underline-offset-4"
				>
					contact@florian-dev.fr
				</a>{" "}
				.
			</p>

			<h3 className="text-2xl font-bold tracking-tight">Liability</h3>

			<p>
				The service is provided as is. The website may interact with or
				communicate with third-party servers and external services. The
				use of the service is solely the responsibility of the user, and
				we cannot be held liable for any damage resulting from its use.
				We cannot be held responsible for any unavailability of the
				service; we strive to keep it online 24/7 until it is
				decommissioned.
			</p>

			<h3 className="text-2xl font-bold tracking-tight">
				Applicable Law
			</h3>

			<p>
				These terms of use and all content on the site are subject to
				French law. Any dispute regarding their interpretation will fall
				under the exclusive jurisdiction of the Commercial Court of
				Nice.
			</p>
		</>
	);
}