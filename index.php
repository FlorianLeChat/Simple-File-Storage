<!DOCTYPE html>

<html lang="fr" class="h-100">
	<head>
		<!-- Document metadata -->
		<meta charset="utf-8" />
		<meta name="Author" content="Florian Trayon" />
		<meta name="description" content="Site d'hébergement de fichiers en ligne." />
		<meta name="keywords" content="storage, files, images" />
		<meta name="robots" content="noindex" />
		<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
		<meta name="theme-color" content="#f2f2f2" />

		<!-- Document title -->
		<title>Hébergement de fichiers | Accueil</title>

		<!-- Pre-connecting external resources -->
		<link rel="preconnect" href="https://maxcdn.bootstrapcdn.com" />

		<!-- CSS fonts & stylesheets -->
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" crossorigin="anonymous" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icon-css@4.1.7/css/flag-icons.min.css" crossorigin="anonymous" />
		<link rel="stylesheet" href="styles/main.css" media="screen" />

		<!-- JavaScript scripts -->
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous" async></script>
		<script src="scripts/main.js" defer></script>

		<!-- Document icons and manifest -->
		<link rel="icon" type="image/webp" sizes="16x16" href="assets/favicons/16x16.webp" />
		<link rel="icon" type="image/webp" sizes="32x32" href="assets/favicons/32x32.webp" />
		<link rel="icon" type="image/webp" sizes="48x48" href="assets/favicons/48x48.webp" />
		<link rel="icon" type="image/webp" sizes="192x192" href="assets/favicons/192x192.webp" />
		<link rel="icon" type="image/webp" sizes="512x512" href="assets/favicons/512x512.webp" />

		<link rel="apple-touch-icon" href="assets/favicons/180x180.webp" />
		<link rel="manifest" href="manifest.json" />
	</head>
	<body class="d-flex flex-column justify-content-center align-items-center text-light h-100 pt-4 pb-4 bg-dark">
		<!-- Document header -->
		<header class="p-4 fw-bold text-center">
			<h1>
				<i class="bi bi-shield-lock"></i>
				<span>Authentification</span>
			</h1>

			<p>Vous devez vous authentifier pour accéder à cette ressource.</p>
		</header>

		<main class="w-100 p-3">
			<!-- Language selector -->
			<nav class="dropdown">
				<!-- Active language -->
				<button class="btn btn-primary dropdown-toggle" type="button" id="language" data-bs-toggle="dropdown" aria-expanded="false">
					<i class="flag-icon flag-icon-gb"></i>
					<span>Anglais</span>
				</button>

				<!-- Available language -->
				<ul class="dropdown-menu dropdown-menu-right text-right" aria-labelledby="language">
					<!-- French -->
					<li class="dropdown-item">
						<i class="flag-icon flag-icon-fr"></i>
						<span>Français</span>
					</li>

					<!-- Italian -->
					<li class="dropdown-item">
						<i class="flag-icon flag-icon-it"></i>
						<span>Italien</span>
					</li>

					<!-- Russian -->
					<li class="dropdown-item">
						<i class="flag-icon flag-icon-ru"></i>
						<span>Russe</span>
					</li>
				</ul>
			</nav>

			<!-- Background video -->
			<video class="position-fixed min-w-100 min-h-100" autoplay muted loop>
				<source src="assets/videos/login.mp4" type="video/mp4" />
			</video>

			<!-- Login form -->
			<form class="needs-validation" method="POST" novalidate>
				<!-- User name -->
				<div class="form-floating mb-2">
					<input type="text" class="form-control" id="login" name="login" placeholder="login" required />
					<label for="login" class="text-body">Nom d'utilisateur</label>

					<p class="valid-feedback">
						Votre nom d'utilisateur est valide.
					</p>

					<p class="invalid-feedback">
						Veuillez saisir un nom d'utilisateur valide.
					</p>
				</div>

				<!-- Password -->
				<div class="form-floating">
					<input type="password" class="form-control" id="password" name="password" placeholder="password" aria-describedby="passwordHelp" required />
					<label for="password" class="text-body">Mot de passe</label>

					<p class="valid-feedback">
						Votre nom d'utilisateur est valide.
					</p>

					<p class="invalid-feedback">
						Veuillez saisir un mot de passe valide.
					</p>

					<p id="passwordHelp" class="form-text text-warning text-justify">
						<i class="bi bi-exclamation-circle"></i>
						<span>Votre mot de passe doit comporter de 8 à 20 caractères, des lettres et des chiffres, et ne doit pas contenir d'espaces, de caractères spéciaux ou d'emoji.</span>
					</p>
				</div>

				<!-- Login reminder -->
				<div class="form-check mt-3 mb-3 text-center">
					<input type="checkbox" class="form-check-input float-none" id="remember" name="remember" />
					<label for="remember" class="form-check-label">Se rappeler de moi</label>
				</div>

				<!-- Validation button -->
				<input type="submit" class="w-100 btn btn-lg btn-primary" value="Valider" />
			</form>
		</main>

		<!-- Document footer -->
		<footer class="p-4 text-center">
			<p>Réalisé par <a href="https://github.com/FlorianLeChat/Simple-File-Storage" target="_blank">Florian</a> 🐈 !</p>
		</footer>
	</body>
</html>