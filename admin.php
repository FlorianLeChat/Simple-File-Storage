<!DOCTYPE html>

<?php
	include("functions.inc.php");

	$password = $_POST["password"];
	$identifier = $_POST["identifier"];

	// Demande de récupération des fichiers ou de suppression d'un fichier.
	$html = empty($identifier) ? requestAllFiles($password) : requestFileDeletion($password, $identifier);

	// Formattage du code en sortie.
	$html = strlen($html) > 0 ? "<div class='result'>$html</div>" : "";
?>

<html lang="fr">
	<head>
		<!-- HTML -->
		<meta charset="utf-8">
		<meta name="Author" content="Florian Trayon" />
		<meta name="description" content="Site d'hébergement de fichiers en ligne." />
		<meta name="keywords" lang="fr" content="storage, files, images" />
		<meta name="robots" content="noindex" />
		<title>Hébergement de fichiers | Admin</title>
		<!-- JavaScript -->
		<script defer src="script.js"></script>
		<!-- CSS -->
		<link rel="stylesheet" href="style.css" />
		<link href="favicon.ico" rel="icon" type="image/x-icon" />
	</head>
	<body>
		<header>
			<h1>Administration</h1>

			<p>
				Ceci est l'interface simplifiée pour l'administration des fichiers.<br />
				Pour accéder à la liste des fichiers enregistrés, veuillez taper le mot de passe comme pour envoyer un fichier.<br />
				Une fois la liste produite, vous aurez l'occasion de supprimer définitivement un fichier.
			</p>

			<hr>

			<br />
		</header>

		<main>
			<form action="" method="POST">
				Mot de passe :

				<br /><br />

				<input type="text" name="password" autocomplete="off">

				<br /><br />

				<input type="submit" />

				<br /><br />

				<form action="" method="POST">
					<?php
						echo($html);
					?>
				</form>
			</form>
		</main>

		<footer>
			<p>Réalisé par <a href="https://github.com/FlorianLeChat/Simple-File-Storage" target="_blank">Florian</a> 🐈 !</p>
		</footer>
	</body>
</html>