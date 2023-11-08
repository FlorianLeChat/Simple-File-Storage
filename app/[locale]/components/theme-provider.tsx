//
// Composant de basculement entre les thèmes clair et sombre.
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
interface UseThemeProps {
	theme: string;
	color: string;
	themes: string[];
	colors: string[];
	setTheme: ( value: string ) => void;
	setColor: ( value: string ) => void;
}

interface ThemeProviderProps {
	children?: ReactNode;
}

// Déclaration des constantes globales.
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
const storageKey = "NEXT_THEME";
const ThemeContext = createContext<UseThemeProps | undefined>( undefined );
const defaultContext: UseThemeProps = {
	theme: "light",
	color: "blue",
	themes,
	colors,
	setTheme: () =>
	{},
	setColor: () =>
	{}
};

// Définition du fonctionnement du composant.
function Theme( { children = null }: ThemeProviderProps )
{
	// Récupération du thème choisi par l'utilisateur.
	const getCurrentTheme = ( key: string ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return "light";
		}

		return sessionStorage.getItem( key )?.split( ";" )[ 0 ] ?? "light";
	};

	// Récupération de la couleur choisie par l'utilisateur.
	const getCurrentColor = ( key: string ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return "blue";
		}

		return sessionStorage.getItem( key )?.split( ";" )[ 1 ] ?? "blue";
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
	const [ theme, setTheme ] = useState( () => getCurrentTheme( storageKey ) );
	const [ color, setColor ] = useState( () => getCurrentColor( storageKey ) );

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
			element.classList.remove( "cc--darkmode" );
			element.classList.add( value );
			element.style.colorScheme = value;

			if ( value === "dark" )
			{
				// Support pour le thème sombre pour les fenêtres
				//  de consentement des cookies.
				element.classList.add( "cc--darkmode" );
			}

			// On définit après cette même valeur avant de
			//  la sauvegarder dans le stockage de session.
			setTheme( value );

			sessionStorage.setItem( storageKey, `${ value };${ color }` );

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
		[ theme, color ]
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
			element.classList.add( value );

			// On définit enfin cette même valeur avant de
			//  la sauvegarder dans le stockage de session.
			setColor( value );

			sessionStorage.setItem( storageKey, `${ theme };${ value }` );
		},
		[ theme, color ]
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
			theme,
			color,
			themes,
			colors,
			setTheme: applyTheme,
			setColor: applyColor
		} ),
		[ theme, color, applyTheme, applyColor ]
	);

	return (
		<ThemeContext.Provider value={value}>
			<script
				dangerouslySetInnerHTML={{
					__html: `
						const element = document.documentElement;
						const classes = element.classList;
						const [theme, color] = sessionStorage.getItem("${ storageKey }")?.split(";") ?? [];

						let newTheme = theme;
						let newColor = color;

						classes.remove("light", "dark");

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

						sessionStorage.setItem("${ storageKey }", newTheme + ";" + newColor);
					`
				}}
			/>

			{children}
		</ThemeContext.Provider>
	);
}

// Exportation du context du composant.
export const useTheme = () => useContext( ThemeContext ) ?? defaultContext;

// Exportation du composant.
export function ThemeProvider( { children = null }: ThemeProviderProps )
{
	return <Theme>{children}</Theme>;
}