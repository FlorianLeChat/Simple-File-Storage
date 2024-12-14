//
// Composant de l'en-tête du site.
//

"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { showPreferences } from "vanilla-cookieconsent";
import { LogIn, Cookie, LayoutDashboard } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";

export default function Header( {
	meta,
	session
}: Readonly<{
	meta: Metadata & { source: string };
	session: Session | null;
}> )
{
	// Déclaration des variables d'état.
	const headerMessages = useTranslations( "header" );
	const navigationMessages = useTranslations( "navigation" );

	// Affichage du rendu HTML du composant.
	return (
		<header className="mb-auto flex items-center gap-4 p-4 max-sm:mt-4 max-sm:flex-col">
			{/* Titre du site */}
			<h1 className="text-2xl font-semibold max-sm:w-full max-sm:max-w-fit max-sm:truncate">
				<Link href="/">💾 {meta.title as string}</Link>
			</h1>

			<nav className="flex gap-4 sm:ml-auto">
				{/* Bouton vers l'authentification */}
				{session ? (
					<Link
						href="/dashboard"
						className={buttonVariants( { variant: "outline" } )}
					>
						<LayoutDashboard className="size-5" />

						<span className="max-sm:sr-only sm:ml-2">
							{headerMessages( "dashboard" )}
						</span>
					</Link>
				) : (
					<Link
						href="/authentication"
						className={buttonVariants( { variant: "outline" } )}
					>
						<LogIn className="size-5" />

						<span className="max-sm:sr-only sm:ml-2">
							{headerMessages( "authenticate" )}
						</span>
					</Link>
				)}

				{/* Gestion des cookies */}
				<Button
					type="button"
					variant="outline"
					onClick={() => showPreferences()}
					className="justify-start text-left sm:mr-16"
				>
					<Cookie />

					<span className="sr-only">
						{navigationMessages( "cookies_title" )}

						<small className="hidden lg:block">
							{navigationMessages.rich( "cookies_description", {
								u: ( chunks ) => <u>{chunks}</u>
							} )}
						</small>
					</span>
				</Button>
			</nav>

			{/* Affichage de l'animation du logo vers le dépôt GitHub */}
			{/* Source : https://tholman.com/github-corners/ */}
			<a
				rel="noopener noreferrer"
				href={meta.source}
				title="GitHub"
				target="_blank"
				className="group fixed bottom-auto left-auto right-0 top-0 [clip-path:polygon(0_0,100%_0,100%_100%)] max-sm:hidden"
				aria-label="GitHub"
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
						className="origin-[130px_106px] fill-current max-md:motion-safe:animate-github md:motion-safe:group-hover:animate-github"
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
	);
}