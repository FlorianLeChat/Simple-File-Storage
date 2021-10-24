<?php
	// Unité de mesure pour la conversion vers lisible par l'homme.
	const UNITS = array("B", "KB", "MB", "GB", "TB");

	// Mot de passe pour utiliser le service.
	const PASSWORD = "password";

	// Nom du répertoire de sauvegarde des fichiers.
	const STORAGE_FOLDER = "public";

	// Taille maximale des fichiers.
	// Note : ne doit pas dépasser le paramètre suivant : https://www.php.net/manual/fr/ini.core.php#ini.upload-max-filesize
	const MAX_SIZE = 2097152;

	// Extensions et types MIME autorisés.
	const EXTENSIONS = [
		"jpg" => "image/jpeg", "jpeg" => "image/jpeg",
		"png" => "image/png",
		"gif" => "image/gif",
	];

	// Messages d'erreurs compréhensible par l'utilisateur final.
	const ERROR_MESSAGES = [
		0 => "Il n'y a pas d'erreur, le fichier a été téléchargé avec succès.",
		1 => "Le poids du fichier téléchargé dépasse la directive « upload_max_filesize » de la configuration php.ini.",
		2 => "Le poids du fichier téléchargé dépasse la directive « MAX_FILE_SIZE » spécifié dans le formulaire HTML.",
		3 => "Le fichier téléchargé n'a été que partiellement transféré.",
		4 => "Aucun fichier n'a été téléchargé.",
		6 => "Le dossier temporaire est introuvable.",
		7 => "Impossible d'écrire le fichier sur le disque.",
		8 => "Une extension PHP a arrêté le téléchargement du fichier.",
	];
?>