//
// Composant de modification de l'apparence du site.
//  Source : https://github.com/pacocoursey/next-themes/blob/cd67bfa20ef6ea78a814d65625c530baae4075ef/packages/next-themes/src/index.tsx
//

"use client";

import { useMemo,
	useState,
	useEffect,
	useContext,
	useCallback,
	createContext,
	type ReactNode } from "react";

// Déclaration des types.
interface UseLayoutProps {
	font: string;
	theme: string;
	color: string;
	fonts: string[];
	themes: string[];
	colors: string[];
	setFont: ( value: string ) => void;
	setTheme: ( value: string ) => void;
	setColor: ( value: string ) => void;
}

interface LayoutProviderProps {
	children?: ReactNode;
}

// Déclaration des constantes globales.
const fonts = [ "inter", "poppins", "roboto" ];
const themes = [ "light", "dark" ];
const colors = [
	"zinc",
	"slate",
	"stone",
	"gray",
	"neutral",
	"red",
	"rose",
	"orange",
	"green",
	"blue",
	"yellow",
	"violet"
];
const storageKey = "NEXT_LAYOUT";
const LayoutContext = createContext<UseLayoutProps | undefined>( undefined );
const defaultContext: UseLayoutProps = {
	font: "inter",
	theme: "light",
	color: "blue",
	fonts,
	themes,
	colors,
	setFont: () =>
	{},
	setTheme: () =>
	{},
	setColor: () =>
	{}
};

// Définition du fonctionnement du composant.
function Layout( { children = null }: LayoutProviderProps )
{
	// Récupération de la police de caractères actuellement utilisée.
	const getCurrentFont = ( key: string ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return "inter";
		}

		return sessionStorage.getItem( key )?.split( ";" )[ 0 ] ?? "inter";
	};

	// Récupération du thème actuellement utilisé.
	const getCurrentTheme = ( key: string ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return "light";
		}

		return sessionStorage.getItem( key )?.split( ";" )[ 1 ] ?? "light";
	};

	// Récupération de la couleur actuellement utilisée.
	const getCurrentColor = ( key: string ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return "blue";
		}

		return sessionStorage.getItem( key )?.split( ";" )[ 2 ] ?? "blue";
	};

	// Récupération du thème du navigateur.
	const getSystemTheme = ( event?: MediaQueryList | MediaQueryListEvent ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return "light";
		}

		// Détermination du thème par défaut.
		const media = event
			? null
			: window.matchMedia( "(prefers-color-scheme: dark)" );

		return media?.matches ? "dark" : "light";
	};

	// Déclaration des variables d'état.
	const [ font, setFont ] = useState( () => getCurrentFont( storageKey ) );
	const [ theme, setTheme ] = useState( () => getCurrentTheme( storageKey ) );
	const [ color, setColor ] = useState( () => getCurrentColor( storageKey ) );

	// Application de la nouvelle police de caractères.
	const applyFont = useCallback(
		( value: string ) =>
		{
			// On vérifie d'abord si la valeur choisie est valide.
			if ( !fonts.includes( value ) )
			{
				return;
			}

			// On applique ensuite les classes CSS correspondantes
			//  sur le DOM.
			const element = document.documentElement;
			element.classList.replace( font, value );

			// On définit enfin cette même valeur avant de
			//  la sauvegarder dans le stockage de session.
			const cache = sessionStorage.getItem( storageKey )?.split( ";" ) ?? [];

			setFont( value );

			sessionStorage.setItem(
				storageKey,
				`${ value };${ cache[ 1 ] ?? theme };${ cache[ 2 ] ?? color }`
			);
		},
		[ font, theme, color ]
	);

	// Application du nouveau thème.
	const applyTheme = useCallback(
		( value: string ) =>
		{
			// On vérifie d'abord si la valeur choisie est valide.
			if ( !themes.includes( value ) )
			{
				return;
			}

			// On applique ensuite les classes CSS correspondantes
			//  sur le DOM.
			const element = document.documentElement;
			element.classList.replace( theme, value );
			element.style.colorScheme = value;

			// On définit après cette même valeur avant de
			//  la sauvegarder dans le stockage de session.
			const cache = sessionStorage.getItem( storageKey )?.split( ";" ) ?? [];

			setTheme( value );

			sessionStorage.setItem(
				storageKey,
				`${ cache[ 0 ] ?? font };${ value };${ cache[ 2 ] ?? color }`
			);

			// On insère des règles CSS temporaires afin de
			//  désactiver les transitions.
			const style = document.createElement( "style" );
			style.appendChild(
				document.createTextNode(
					"*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
				)
			);

			document.head.appendChild( style );

			// On marque enfin un délai de 1 milliseconde
			//  avant de supprimer les règles CSS temporaires.
			setTimeout( () =>
			{
				document.head.removeChild( style );
			}, 1 );
		},
		[ font, theme, color ]
	);

	// Application de la nouvelle couleur.
	const applyColor = useCallback(
		( value: string ) =>
		{
			// On vérifie d'abord si la valeur choisie est valide.
			if ( !colors.includes( value ) )
			{
				return;
			}

			// On applique ensuite les classes CSS correspondantes
			//  sur le DOM.
			const element = document.documentElement;
			element.classList.replace( color, value );

			// On définit enfin cette même valeur avant de
			//  la sauvegarder dans le stockage de session.
			const cache = sessionStorage.getItem( storageKey )?.split( ";" ) ?? [];

			setColor( value );

			sessionStorage.setItem(
				storageKey,
				`${ cache[ 0 ] ?? font };${ cache[ 1 ] ?? theme };${ value }`
			);
		},
		[ font, theme, color ]
	);

	// Application du nouveau thème détecté précédemment.
	const detectMedia = useCallback(
		( event: MediaQueryListEvent | MediaQueryList ) =>
		{
			applyTheme( getSystemTheme( event ) );
		},
		[ applyTheme ]
	);

	// Application du nouveau thème modifié précédemment.
	const detectStorage = useCallback(
		( event: StorageEvent ) =>
		{
			if ( event.key !== storageKey )
			{
				return;
			}

			applyTheme( event.newValue ?? theme );
		},
		[ applyTheme, theme ]
	);

	// Détection et mise à jour du thème préférée par
	//  le navigateur.
	useEffect( () =>
	{
		// On récupère d'abord le thème par défaut.
		const media = window.matchMedia( "(prefers-color-scheme: dark)" );

		// On exécute enfin la fonction à chaque
		//  changement du thème par défaut.
		media.addEventListener( "change", detectMedia );

		return () => media.removeEventListener( "change", detectMedia );
	}, [ detectMedia ] );

	// Détection des modifications du stockage de session
	//  pour le thème choisi par l'utilisateur.
	useEffect( () =>
	{
		window.addEventListener( "storage", detectStorage );

		return () => window.removeEventListener( "storage", detectStorage );
	}, [ detectStorage ] );

	// Affichage du rendu HTML du composant.
	const value = useMemo(
		() => ( {
			font,
			theme,
			color,
			fonts,
			themes,
			colors,
			setFont: applyFont,
			setTheme: applyTheme,
			setColor: applyColor
		} ),
		[ font, theme, color, applyFont, applyTheme, applyColor ]
	);

	return (
		<LayoutContext.Provider value={value}>
			<script
				dangerouslySetInnerHTML={{
					__html: `
						const element = document.documentElement;
						const classes = element.classList;
						const [font, theme, color] = sessionStorage.getItem("${ storageKey }")?.split(";") ?? [];

						let newFont = font;
						let newTheme = theme;
						let newColor = color;

						if ([${ themes.map( ( name ) => `"${ name }"` ) }].includes(theme))
						{
							// Application du thème choisi par l'utilisateur.
							classes.add(theme)

							element.style.colorScheme = theme;
						}
						else
						{
							// Application du thème préféré par le navigateur.
							const target = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

							newTheme = target;

							classes.add(target);

							element.style.colorScheme = target;
						}

						if ([${ colors.map( ( name ) => `"${ name }"` ) }].includes(color))
						{
							// Application de la couleur choisie par l'utilisateur.
							classes.add(color)
						}
						else
						{
							// Application de la couleur par défaut.
							newColor = "blue";

							classes.add("blue");
						}

						if ([${ fonts.map( ( name ) => `"${ name }"` ) }].includes(font))
						{
							// Application de la police de caractères choisie par l'utilisateur.
							classes.add(font)
						}
						else
						{
							// Application de la police de caractères par défaut.
							newFont = "inter";

							classes.add("inter");
						}

						sessionStorage.setItem("${ storageKey }", newFont + ";" + newTheme + ";" + newColor);
					`
				}}
			/>

			{children}
		</LayoutContext.Provider>
	);
}

// Exportation du context du composant.
export const useLayout = () => useContext( LayoutContext ) ?? defaultContext;

// Exportation du composant.
export default function LayoutProvider( {
	children = null
}: LayoutProviderProps )
{
	return <Layout>{children}</Layout>;
}