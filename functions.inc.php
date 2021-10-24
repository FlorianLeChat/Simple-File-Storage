<?php
	include("constants.inc.php");

	// Signalement des erreurs.
	ini_set("display_errors", 1);
	ini_set("display_startup_errors", 1);

	error_reporting(E_ALL);

	// Permet de convertir une taille binaire en taille lisible par l'homme.
	// Source : https://browse-tutorials.com/snippet/convert-file-size-bytes-nice-human-readable-format-php
	function formatSize($size)
	{
		$power = $size > 0 ? floor(log($size, 1024)) : 0;
		return number_format($size / pow(1024, $power), 2, ",", " ") . " " . UNITS[$power];
	}

	// Permet de demander tous les fichiers sauvegardés sur le serveur.
	function requestAllFiles($password)
	{
		// On vérifie la validité du mot de passe.
		if ($password != PASSWORD)
			return "Le mot de passe est manquant ou incorrect.";

		// On vérifie si le répertoire de sauvegarde est manquant.
		if (!is_dir("./public"))
			return "Le répertoire de stockage « public » est manquant.";

		// On vérifie ensuite si des fichiers sont présents dans le répertoire de stockage.
		$files = array_diff(scandir("./public"), array("..", "."));

		if (count($files) == 0)
			return "";

		// Enfin, on les affiche si possible.
		$html = "<ul>\n";

		foreach ($files as $index => $name)
		{
			$html .= <<<FILE
				<li>
					<a href="public/{$name}" target="_blank">{$name}</a>

					<input type="submit" value="Supprimer" />

					<input type="hidden" name="password" value={$password} />
					<input type="hidden" name="identifier" value={$name} />
				</li>\n
			FILE;
		}

		$html .= "</ul>\n";

		return $html;
	}

	// Permet de demander la suppression d'un fichier hébergé précédemment.
	function requestFileDeletion($password, $identifier)
	{
		// On vérifie la présence du répertoire de stockage et la validité du mot de passe.
		if (is_dir("./public") && $password == PASSWORD)
			unlink("./public/$identifier");

		// On revient à la fin au point de départ.
		return requestAllFiles($password);
	}

	// Permet de demander la sauvegarde d'un fichier depuis la page principal.
	function requestSave($password, $file)
	{
		// On vérifie si des données ont été télécharges.
		if (empty($file))
			return "Les données de téléchargement sont manquants.";

		// On vérifie si le mot de passe d'utilisation est correct.
		if ($password != PASSWORD)
			return "Le mot de passe est manquant ou incorrect.";

		// On vérifie si le fichier a bien été téléchargé via la méthode POST HTTP.
		if (!is_uploaded_file($file["tmp_name"]))
			return "Le fichier sélectionné n'a pas été téléchargé par le serveur.";

		// On vérifie si le répertoire de sauvegarde est manquant.
		if (!is_dir("./public") && !mkdir("./public", 0755, true))
			return "Le répertoire de stockage « public » est manquant.";

		// On vérifie ensuite les données du fichier.
		$real_name = $file["name"];							// Nom réel du fichier
		$temp_name = $file["tmp_name"];						// Nom temporaire du fichier

		$size = filesize($temp_name);						// Taille réelle du fichier

		$type = new finfo(FILEINFO_MIME_TYPE);				// Type & extension
		$type = $type ? $type->file($temp_name) : "";		// du fichier

		$state = checkFile($size, $type, $file["error"]);

		// On vérifie alors si les données ont été vérifiée avec succès.
		if (is_bool($state))
		{
			$url = "public/" . sha1_file($temp_name) . "." . explode("/", $type)[1];

			if (move_uploaded_file($temp_name, $url))
			{
				// On déplace enfin le fichier en indiquant ses informations.
				$size = formatSize($size);

				return <<<RESULT
					<ul>
						<li>Nom du fichier : $real_name</li>
						<li>Taille du fichier : $size</li>
						<li>Type du fichier : $type</li>
						<li>URL final : <a href="$url" target="_blank">$_SERVER[HTTP_HOST]/$url</a></li>
					</ul>
				RESULT;
			}
			else
			{
				// Dans le cas contraire, on affiche un message d'erreur.
				return "Il est impossible de déplacer le fichier temporaire.";
			}
		}

		// On retourne le message d'erreur en tout dernière possibilité.
		return $state;
	}

	// Permet de vérifier la validité d'un fichier téléchargé.
	function checkFile($size, $type, $error)
	{
		// On vérifie si le téléchargement s'est effectué sans problème.
		if ($error != UPLOAD_ERR_OK)
			return ERROR_MESSAGES[$error];

		// On vérifie ensuite si le fichier ne dépasse par la limite imposée.
		// Note : on évite d'utiliser la taille envoyée par le client (risque de manipulation).
		if ($size == 0)
			return "Le fichier ne contient rien ou vide de tout contenu.";
		else if ($size > MAX_SIZE)
			return "Le fichier dépasse la taille limite de " . formatSize(MAX_SIZE) . ".";

		// On vérifie alors si l'extension du fichier est autorisée.
		// Note : on évite d'utiliser l'extension/le type envoyé par le client (risque de manipulation).
		if (!array_search($type, EXTENSIONS, true))
			return "L'extension du fichier n'est pas autorisée. Liste des extensions autorisées : " . implode(", ", array_keys(EXTENSIONS)) . ".";

		// On indique enfin que les données sont valides.
		return true;
	}
?>