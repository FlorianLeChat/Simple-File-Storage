//
// Route vers la page principale du site.
//  Source : https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
//

// Importation des dépendances.
import { lazy } from "react";

const AuthForm = lazy( () => import( "./components/auth-form" ) );

// Affichage de la page.
export default function Page()
{
	// Affichage du rendu HTML de la page.
	return (
		<>
			<header>
				{/* Titre du site */}
				<h1 className="absolute left-4 top-4 text-xl font-semibold">
					💾 Simple File Storage
				</h1>

				{/* Affichage de l'animation du logo vers le dépôt GitHub */}
				{/* Source : https://tholman.com/github-corners/ */}
				<a
					rel="noopener noreferrer"
					href="https://github.com/FlorianLeChat/Simple-File-Storage"
					target="_blank"
					className="group fixed bottom-auto left-auto right-0 top-0 hidden sm:inline"
				>
					<svg
						width="80"
						height="80"
						viewBox="0 0 250 250"
						className="fill-primary text-background"
					>
						<path d="M0 0l115 115h15l12 27 108 108V0z" />
						<path
							d="M128 109c-15-9-9-19-9-19 3-7 2-11 2-11-1-7 3-2 3-2 4 5 2 11 2 11-3 10 5 15 9 16"
							className="md:motion-safe:animate-github group-hover:md:motion-safe:animate-github origin-[130px_106px] fill-current"
						/>
						<path
							d="M115 115s4 2 5 0l14-14c3-2 6-3 8-3-8-11-15-24 2-41 5-5 10-7 16-7 1-2 3-7 12-11 0 0
							5 3 7 16 4 2 8 5 12 9s7 8 9 12c14 3 17 7 17 7-4 8-9 11-11 11 0 6-2 11-7 16-16 16-30 10-41
							2 0 3-1 7-5 11l-12 11c-1 1 1 5 1 5z"
							className="fill-current"
						/>
					</svg>
				</a>
			</header>

			{/* Vidéo en arrière-plan */}
			<video
				className="absolute -z-10 h-full object-none opacity-10"
				autoPlay
				muted
				loop
			>
				<source
					src={`${ process.env.__NEXT_ROUTER_BASEPATH }/assets/videos/login.mp4`}
					type="video/mp4"
				/>
			</video>

			{/* Contenu de la page */}
			<main className="flex h-screen items-center">
				<AuthForm />
			</main>

			<blockquote className="absolute bottom-4 left-4">
				<q className="text-md">
					{" "}
					A simple file storage system using HTML 5/CSS 3 and PHP 8
					vanilla.{" "}
				</q>

				<footer className="text-sm">FlorianLeChat</footer>
			</blockquote>
		</>
	);
}