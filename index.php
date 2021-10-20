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
		<!-- HTML -->
		<meta charset="utf-8">
		<meta name="Author" content="Florian Trayon" />
		<meta name="description" content="Site d'hébergement de fichiers en ligne." />
		<meta name="keywords" lang="fr" content="storage, files, images" />
		<meta name="robots" content="noindex" />
		<title>Hébergement de fichiers</title>
		<!-- JavaScript -->
		<script defer src="script.js"></script>
		<!-- CSS -->
		<link rel="stylesheet" href="style.css" />
		<link href="favicon.ico" rel="icon" type="image/x-icon" />
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

				<input type="text" name="password" autocomplete="off" maxlength="5">

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
			<p>Réalisé par <a href="https://github.com/FlorianLeChat">Florian</a> !</p>
		</footer>
	</body>
</html>