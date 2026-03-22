# In French

## Installation

> [!WARNING]
> L'installation **sans** Docker nécessite d'avoir une base de données [MySQL](https://www.mysql.com/downloads/) ou [MariaDB](https://mariadb.org/download/) pour la gestion des données du site Internet. Vous devez également être en possession d'un serveur SMTP pour l'envoi des courriels de création/connexion des comptes utilisateurs. 🏠
> 
> Le déploiement en environnement de production **sans Docker** nécessite un serveur Web déjà configuré comme [Nginx](https://nginx.org/en/), [Apache](https://httpd.apache.org/) ou [Caddy](https://caddyserver.com/). 🐛

### Développement local

- Installer [NodeJS LTS](https://nodejs.org/) (>20 ou plus) ;
- Installer les dépendances du projet avec la commande `npm install` ;
- Modifier la [variable d'environnement](.env) `NEXT_PUBLIC_ENV` sur `development` ;
- Modifier les [variables d'environnement](.env) pour la connexion à la base de données (`DATABASE_...`) ;
- Modifier les [variables d'environnement](.env) pour configurer le serveur de messagerie (`SMTP_...`) ;
- Générer un *hash* en base64 avec la commande `openssl rand -base64 32` (nécessite [OpenSSL](https://openssl-library.org/source/)) ;
- Modifier la [variable d'environnement](.env) `AUTH_SECRET` avec la valeur générée à l'étape précédente ;
- Démarrer le serveur local NextJS avec la commande `npm run dev` ;
- *(Facultatif)* Compiler les scripts destinés aux tâches planifiées avec la commande `npx tsc --skipLibCheck scripts/expired-files.ts scripts/outdated-notifications.ts` ;
- *(Facultatif)* Configurer une tâche planifiée pour exécuter la commande `node scripts/expired-files.js` pour la [suppression périodique des fichiers expirés](scripts/expired-files.ts) ;
- *(Facultatif)* Configurer une tâche planifiée pour exécuter la commande `node scripts/outdated-notifications.js` pour la [suppression périodique des anciennes notifications](scripts/outdated-notifications.ts).

### Déploiement en production

- Installer [NodeJS LTS](https://nodejs.org/) (>20 ou plus) ;
- Installer les dépendances du projet avec la commande `npm install` ;
- Modifier les [variables d'environnement](.env) pour la connexion à la base de données (`DATABASE_...`) ;
- Modifier les [variables d'environnement](.env) pour configurer le serveur de messagerie (`SMTP_...`) ;
- Générer un *hash* en base64 avec la commande `openssl rand -base64 32` (nécessite [OpenSSL](https://openssl-library.org/source/)) ;
- Modifier la [variable d'environnement](.env) `AUTH_SECRET` avec la valeur générée à l'étape précédente ;
- Compiler les fichiers statiques du site Internet avec la commande `npm run build` ;
- Supprimer les dépendances de développement avec la commande `npm prune --omit=dev` ;
- Démarrer le serveur local NodeJS avec la commande `npm run start` ;
- *(Facultatif)* Utiliser [Varnish](https://varnish-cache.org/) comme serveur de cache HTTP pour atténuer les effets des fortes charges ([configuration intégrée](docker/configuration/varnish.vcl)) ;
- Compiler les scripts destinés aux tâches planifiées avec la commande `npx tsc --skipLibCheck scripts/expired-files.ts scripts/outdated-notifications.ts` ;
- Configurer une tâche planifiée pour exécuter la commande `node scripts/expired-files.js` pour la [suppression périodique des fichiers expirés](scripts/expired-files.ts) ;
- Configurer une tâche planifiée pour exécuter la commande `node scripts/outdated-notifications.js` pour la [suppression périodique des anciennes notifications](scripts/outdated-notifications.ts).

> [!CAUTION]
> Le déploiement en environnement de production (**avec ou sans Docker**) **nécessite des connaissances approfondies pour déployer, optimiser et sécuriser correctement votre installation** afin d'éviter toute conséquence indésirable. ⚠️

# In English

## Setup

> [!WARNING]
> Installation **without** Docker requires having a [MySQL](https://www.mysql.com/downloads/) or [MariaDB](https://mariadb.org/download/) database for managing website data. You must also have access to an SMTP server for sending emails related to user account creation/login. 🏠
> 
> Deployment in a production environment (**with or without Docker**) requires a pre-configured web server such as [Nginx](https://nginx.org/en/), [Apache](https://httpd.apache.org/), or [Caddy](https://caddyserver.com/). 🐛

### Local development

- Install [NodeJS LTS](https://nodejs.org/) (>20 or higher) ;
- Install project dependencies using `npm install` ;
- Set `NEXT_PUBLIC_ENV` [environment variable](.env) to `development` ;
- Set [environment variables](.env) for database connection (`DATABASE_...`) ;
- Set [environment variables](.env) to configure the mail server (`SMTP_...`) ;
- Generate a base64 hash using `openssl rand -base64 32` (requires [OpenSSL](https://openssl-library.org/source/)) ;
- Set `AUTH_SECRET` [environment variable](.env) with the value generated in the previous step ;
- Start NextJS local server using `npm run dev` ;
- *(Optional)* Compile scripts for scheduled tasks using `npx tsc --skipLibCheck scripts/expired-files.ts scripts/outdated-notifications.ts` ;
- *(Optional)* Set up a scheduled task to run `node scripts/expired-files.js` command for [periodic deletion of expired files](scripts/expired-files.ts) ;
- *(Optional)* Set up a scheduled task to run `node scripts/outdated-notifications.js` command for [periodic deletion of outdated notifications](scripts/outdated-notifications.ts).

### Production deployment

- Install [NodeJS LTS](https://nodejs.org/) (>20 or higher) ;
- Install project dependencies using `npm install` ;
- Set [environment variables](.env) for database connection (`DATABASE_...`) ;
- Set [environment variables](.env) to configure the mail server (`SMTP_...`) ;
- Generate a base64 hash using `openssl rand -base64 32` (requires [OpenSSL](https://openssl-library.org/source/)) ;
- Set `AUTH_SECRET` [environment variable](.env) with the value generated in the previous step ;
- Build static website files using `npm run build` ;
- Remove development dependencies using `npm prune --omit=dev` ;
- Start NodeJS local server using `npm run start` ;
- *(Optional)* Use [Varnish](https://varnish-cache.org/) as an HTTP cache server to mitigate effects of heavy loads ([built-in configuration](docker/configuration/varnish.vcl)) ;
- Compile scripts for scheduled tasks using `npx tsc --skipLibCheck scripts/expired-files.ts scripts/outdated-notifications.ts` ;
- Set up a scheduled task to run `node scripts/expired-files.js` command for [periodic deletion of expired files](scripts/expired-files.ts) ;
- Set up a scheduled task to run `node scripts/outdated-notifications.js` command for [periodic deletion of outdated notifications](scripts/outdated-notifications.ts).

> [!CAUTION]
> Deploying in a production environment (**with or without Docker**) **requires advanced knowledge to properly deploy, optimize, and secure your installation** in order to avoid any unwanted consequences. ⚠️
