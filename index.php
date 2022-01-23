<!DOCTYPE html>

<?php
	include("functions.inc.php");

	// Sauvegarde du fichier.
	$message = requestSave($_POST["password"], $_FILES["upload"]);

	// Formattage du message de sortie.
	$message = strlen($message) > 0 ? "<div class='result'>$message</div>" : "";
?>

<html lang="fr">
	<head>
		<!-- Document metadata -->
		<meta charset="utf-8" />
		<meta name="Author" content="Florian Trayon" />
		<meta name="description" content="Site d'hébergement de fichiers en ligne." />
		<meta name="keywords" lang="fr" content="storage, files, images" />
		<meta name="robots" content="noindex" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />

		<!-- Document title -->
		<title>Hébergement de fichiers | Accueil</title>

		<!-- Pre-connecting external resources -->
		<link rel="preconnect" href="https://fonts.gstatic.com" />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://maxcdn.bootstrapcdn.com" />

		<!-- CSS fonts & stylesheets -->
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" crossorigin="anonymous" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" crossorigin="anonymous" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
		<link rel="stylesheet" href="styles/main.css" media="screen" />

		<!-- JavaScript scripts -->
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" crossorigin="anonymous" async></script>
		<script src="scripts/main.js" defer></script>

		<!-- Document icon (16x16) -->
		<link rel="icon" href="images/favicon.ico" type="image/x-icon" />
	</head>
	<body>
		<header>
			<h1>Hébergement de fichiers</h1>

			<p>
				Ce site vous permet d'héberger des fichiers de manière permanente.<br />
				Chaque fichier ne doit pas dépasser une certaine limite de taille (2 MB) et son extension doit être autorisée.<br />
				De plus, il est nécessaire d'indiquer un mot de passe pour utiliser ce service.
			</p>

			<hr>

			<br />
		</header>

		<main>
			<form action="" method="POST" enctype="multipart/form-data">
				Mot de passe :

				<br /><br />

				<input type="text" name="password" autocomplete="off">

				<br /><br />

				<input type="file" name="upload" />

				<br /><br />

				<input type="submit" />

				<br /><br />

				<?php
					echo($message);
				?>
			</form>
		</main>

		<footer>
			<p>Réalisé par <a href="https://github.com/FlorianLeChat/Simple-File-Storage" target="_blank">Florian</a> 🐈 !</p>
		</footer>
	</body>
</html>