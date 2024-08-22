# In French

## Installation

> [!WARNING]
> L'installation **sans** Docker nécessite d'avoir une base de données MySQL ou MariaDB pour la gestion des données du site Internet. Vous devez également être en possession d'un serveur SMTP (si possible avec le protocole DKIM configuré) pour l'envoi des courriels de création/connexion des comptes utilisateurs.

### Développement local

- Installer [NodeJS LTS](https://nodejs.org/) (>20 ou plus) ;
- Installer les dépendances du projet avec la commande `npm install` ;
- Modifier les [variables d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) pour la connexion à la base de données (`DATABASE_...`) ;
- Modifier les [variables d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) pour configurer le serveur de messagerie (`SMTP_...`) ;
- *(Facultatif)* Modifier les [variables d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) pour activer l'authentification DKIM (`DKIM...`) ;
- Générer un *hash* en base64 avec la commande `openssl rand -base64 32` (nécessite [OpenSSL](https://openssl-library.org/source/)) ;
- Modifier la [variable d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) `AUTH_SECRET` avec la valeur générée à l'étape précédente ;
- Démarrer le serveur local NextJS avec la commande `npm run dev` ;
- *(Facultatif)* Configurer une tâche planifiée pour exécuter la [suppression périodique des fichiers expirés](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/expired-files.ts) ;
- *(Facultatif)* Configurer une tâche planifiée pour exécuter la [suppression périodique des anciennes notifications](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/outdated-notifications.ts).

### Déploiement en production

- Installer [NodeJS LTS](https://nodejs.org/) (>20 ou plus) ;
- Installer les dépendances du projet avec la commande `npm install` ;
- Modifier la variable d'environnement `NEXT_PUBLIC_ENV` sur `production` dans le fichier [`.env`](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) ;
- Modifier les [variables d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) pour la connexion à la base de données (`DATABASE_...`) ;
- Modifier les [variables d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) pour configurer le serveur de messagerie (`SMTP_...`) ;
- *(Facultatif)* Modifier les [variables d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) pour activer l'authentification DKIM (`DKIM...`) ;
- Générer un *hash* en base64 avec la commande `openssl rand -base64 32` (nécessite [OpenSSL](https://openssl-library.org/source/)) ;
- Modifier la [variable d'environnement](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) `AUTH_SECRET` avec la valeur générée à l'étape précédente ;
- Compiler les fichiers statiques du site Internet avec la commande `npm run build` ;
- Supprimer les dépendances de développement avec la commande `npm prune --production` ;
- Démarrer le serveur local NodeJS avec la commande `npm run start` ;
- Configurer une tâche planifiée pour exécuter la [suppression périodique des fichiers expirés](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/expired-files.ts) ;
- Configurer une tâche planifiée pour exécuter la [suppression périodique des anciennes notifications](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/outdated-notifications.ts).

> [!TIP]
> Pour tester le projet, vous *pouvez* également utiliser [Docker](https://www.docker.com/). Une fois installé, il suffit de lancer l'image Docker de développement à l'aide de la commande `docker compose up --detach --build`. Le site devrait être accessible à l'adresse suivante : http://localhost:3000/. Si vous souhaitez travailler sur le projet avec Docker, vous devez utiliser la commande `docker compose watch --no-up` pour que vos changements locaux soient automatiquement synchronisés avec le conteneur. 🐳

> [!CAUTION]
> L'image Docker *peut* également être déployée en production, mais cela **nécessite des connaissances approfondies pour déployer, optimiser et sécuriser correctement votre installation**, afin d'éviter toute conséquence indésirable. ⚠️

# In English

## Setup

> [!WARNING]
> Installation **without** Docker requires having a MySQL or MariaDB database for managing website data. You must also have access to an SMTP server (preferably with the DKIM protocol configured) for sending emails related to user account creation/login.

### Local development

- Install [NodeJS LTS](https://nodejs.org/) (>20 or higher) ;
- Install project dependencies using `npm install` ;
- Set [environment variables](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) for database connection (`DATABASE_...`) ;
- Set [environment variables](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) to configure the mail server (`SMTP_...`) ;
- *(Optional)* Set [environment variables](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) to enable DKIM authentication (`DKIM...`) ;
- Generate a base64 hash using the command `openssl rand -base64 32` (requires [OpenSSL](https://openssl-library.org/source/)) ;
- Update `AUTH_SECRET` [environment variable](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) with the value generated in the previous step ;
- Start NextJS local server using `npm run dev` ;
- *(Optional)* Set up a scheduled task to run the [periodic deletion of expired files](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/expired-files.ts) ;
- *(Optional)* Set up a scheduled task to run the [periodic deletion of outdated notifications](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/outdated-notifications.ts).

### Production deployment

- Install [NodeJS LTS](https://nodejs.org/) (>20 or higher) ;
- Install project dependencies using `npm install` ;
- Set `NEXT_PUBLIC_ENV` [environment variable](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) to `production` ;
- Set [environment variables](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) for database connection (`DATABASE_...`) ;
- Set [environment variables](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) to configure the mail server (`SMTP_...`) ;
- *(Optional)* Set [environment variables](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) to enable DKIM authentication (`DKIM...`) ;
- Generate a base64 hash using the command `openssl rand -base64 32` (requires [OpenSSL](https://openssl-library.org/source/)) ;
- Update `AUTH_SECRET` [environment variable](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/.env) with the value generated in the previous step ;
- Build static website files using `npm run build` ;
- Remove development dependencies using `npm prune --production` ;
- Start NodeJS local server using `npm run start` ;
- Set up a scheduled task to run the [periodic deletion of expired files](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/expired-files.ts) ;
- Set up a scheduled task to run the [periodic deletion of outdated notifications](https://github.com/FlorianLeChat/Simple-File-Storage/blob/master/scripts/outdated-notifications.ts).

> [!TIP]
> To try the project, you *can* also use [Docker](https://www.docker.com/) installed. Once installed, simply start the development Docker image with `docker compose up --detach --build` command. The website should be available at http://localhost:3000/. If you want to work on the project with Docker, you need to use `docker compose watch --no-up` to automatically synchronize your local changes with the container. 🐳

> [!CAUTION]
> The Docker image *can* also be deployed in production, but **this requires advanced knowledge to properly deploy, optimize, and secure your installation**, in order to avoid any unwanted consequences. ⚠️