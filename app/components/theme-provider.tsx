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
	type Dispatch,
	type ReactNode,
	type SetStateAction } from "react";

// Déclaration des types.
interface UseThemeProps {
	theme?: string;
	setTheme: Dispatch<SetStateAction<string>>;
}

interface ThemeProviderProps {
	children?: ReactNode;
}

// Déclaration des constantes globales.
const storageKey = "NEXT_THEME";
const defaultTheme = "system";
const ThemeContext = createContext<UseThemeProps | undefined>( undefined );
const defaultContext: UseThemeProps = { setTheme: () =>
{} };

// Définition du fonctionnement du composant.
function Theme( { children = null }: ThemeProviderProps )
{
	// Récupération du thème choisi par l'utilisateur.
	const getCurrentTheme = ( key: string ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return defaultTheme;
		}

		return sessionStorage.getItem( key ) ?? defaultTheme;
	};

	// Récupération du thème du système d'exploitation.
	const getSystemTheme = ( event?: MediaQueryList | MediaQueryListEvent ) =>
	{
		if ( typeof window === "undefined" )
		{
			// Valeur par défaut pour le serveur.
			return defaultTheme;
		}

		// Détermination du thème par défaut.
		const media = event
			? null
			: window.matchMedia( "(prefers-color-scheme: dark)" );

		return media?.matches ? "dark" : "light";
	};

	// Déclaration des variables d'état.
	const [ theme, setCurrentTheme ] = useState( () => getCurrentTheme( storageKey ) );
	const [ resolvedTheme, setResolvedTheme ] = useState( () => getCurrentTheme( storageKey ) );

	// Application du thème choisi par l'utilisateur sur le DOM.
	const applyTheme = useCallback(
		( value: string ) =>
		{
			// On récupère d'abord le thème résolu précédemment
			//  avant de l'appliquer dans les classes du DOM.
			const resolved = value === defaultTheme ? resolvedTheme : value;
			const element = document.documentElement;
			element.classList.remove( "light", "dark" );
			element.classList.add( resolved );
			element.style.colorScheme = resolved;

			// On insère après des règles CSS temporaires
			//  pour désactiver les transitions.
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
		[ resolvedTheme ]
	);

	// Définition et sauvegarde du thème choisi par l'utilisateur.
	const setTheme = useCallback( ( value: string ) =>
	{
		// On vérifie d'abord si la valeur choisie est valide.
		if ( value !== "light" && value !== "dark" && value !== defaultTheme )
		{
			return;
		}

		// On définit enfin cette même valeur avant de
		//  la sauvegarder dans le stockage local.
		setCurrentTheme( value );

		sessionStorage.setItem( storageKey, value );
	}, [] );

	// Basculement entre les thèmes clair et sombre
	//  en fonction du système d'exploitation.
	const handleMedia = useCallback(
		( event: MediaQueryListEvent | MediaQueryList ) =>
		{
			// On détermine d'abord le thème du système
			//  d'exploitation ou du navigateur.
			const resolved = getSystemTheme( event );

			// On définit enfin le thème résolu avant de
			//  l'appliquer si celui-ci n'est pas clairement
			//  défini par l'utilisateur.
			setResolvedTheme( resolved );

			if ( theme === defaultTheme )
			{
				applyTheme( theme );
			}
		},
		[ theme, applyTheme ]
	);

	// Détection des changements du thème du système
	//  d'exploitation ou du navigateur.
	useEffect( () =>
	{
		// On récupère d'abord le thème par défaut.
		const media = window.matchMedia( "(prefers-color-scheme: dark)" );

		// On exécute une première fois la fonction
		//  pour récupérer le thème par défaut.
		handleMedia( media );

		// On exécute enfin la fonction à chaque
		//  changement du thème par défaut.
		media.addEventListener( "change", handleMedia );

		return () => media.removeEventListener( "change", handleMedia );
	}, [ handleMedia ] );

	// Détection des changements du thème choisi par
	//  l'utilisateur dans le stockage local.
	useEffect( () =>
	{
		// On vérifie puis on récupère d'abord la valeur
		//  modifiée dans le stockage local.
		const handleStorage = ( event: StorageEvent ) =>
		{
			if ( event.key !== storageKey )
			{
				return;
			}

			setTheme( event.newValue || defaultTheme );
		};

		// On écoute enfin les changements du stockage local
		//  afin de répercuter les changements sur le DOM.
		window.addEventListener( "storage", handleStorage );

		return () => window.removeEventListener( "storage", handleStorage );
	}, [ setTheme ] );

	// Mise à jour automatique du thème en cas de
	//  changement par l'utilisateur.
	useEffect( () =>
	{
		applyTheme( theme );
	}, [ theme, applyTheme ] );

	// Affichage du rendu HTML du composant.
	const value = useMemo(
		() => ( { theme, setTheme: setCurrentTheme } ),
		[ theme, setCurrentTheme ]
	);

	return (
		<ThemeContext.Provider value={value}>
			<script
				dangerouslySetInnerHTML={{
					__html: `
						// Récupération du thème choisi par l'utilisateur
						//  précédemment sauvegardé dans le stockage local.
						const theme = sessionStorage.getItem("${ storageKey }");
						const element = document.documentElement;
						const classes = element.classList;

						classes.remove("light", "dark");

						if (theme)
						{
							// Ajout de la classe du thème choisi par l'utilisateur.
							classes.add(theme)
						}
						else if (!theme || theme === defaultTheme)
						{
							// Récupération du thème du système d'exploitation
							//  avant application sur le DOM.
							const target = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

							classes.add(target);

							element.style.colorScheme = target;
						}

						if (theme === "light" || theme === "dark")
						{
							// Indication du thème choisi par l'utilisateur
							//  sur le DOM.
							element.style.colorScheme = theme;
						}
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