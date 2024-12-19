# test-technique-culturelive

## Fonctionnalités

- Création et modification d'un client
- Effectuer une location
- Simulation de mails tous les 3 et 5 jours à 12h avant la date de retour d'une location en cours.

## Prérequis techniques

- [Node.js](https://nodejs.org/en/download/) (v16+)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/connect-your-database-typescript-postgresql)
- [Postman](https://www.postman.com/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [npm](https://www.npmjs.com/)

## Installation

1. Cloner le repo :

```

git clone https://github.com/maeva-d/test-technique-culturelive-sakila.git

```

2. Accéder au dossier du projet :

```

cd nestjs-prisma

```

3. Installer les dépendances :

```

npm install

```

4. Copier-coller dans le query tool de pgAdmin 4 (ou un autre client), le script du fichier SQL "postgre-sakila-schema.sql", se trouvant dans le dossier "postgre-sakila-db", puis l'exécuter.
   <br/>

5. Reproduire la procédure ci-dessus avec le fichier "postgre-sakila-insert-data-using-copy.sql"
   <br/>

6. Configurer les variables d'environnement dans un fichier `.env` pour se connecter à sa base de données PostgreSQL :

```env
DATABASE_URL : <postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA>
```

7. Les entités prisma situées dans le fichier "schema.prisma" ont été créées automatiquement, à partir du schéma SQL de Sakila, par [introspection](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/introspection-typescript-postgresql). Pour prendre en compte le fuseau horaire du client, il faudra modifier la table SQL "rental" en exécutant le script suivant :

```
ALTER TABLE rental
  ALTER COLUMN rental_date type timestamptz USING rental_date AT TIME ZONE 'UTC';
  ALTER COLUMN rertun_date type timestamptz USING return_date AT TIME ZONE 'UTC';
```

Il serait aussi intéressant de modifier la table "customer" pour que l'email soit un champs obligatoire (comment envoyer des rappels sinon?)

```
ALTER TABLE customer
ALTER COLUMN email SET NOT NULL;
```

8. Synchroniser son nouveau schéma SQL avec son schéma prisma actuelle grâce à la commande suivante :

```

npx prisma db pull

```

Il est possible que le nouveau schéma prisma affiche des erreurs par rapport au payment. Pour régler le problème, il suffit de faire un revert change pour réafficher les "@ignore" (ou les ajouter manuellement s'ils n'y étaient pas avant). Puis lancer la commande suivante :

```
npx prisma generate

```

9. Lancer l'application :

```

npm run start

```

## Architecture du projet

```scss
nestjs-prisma
│
├───prisma/
│	│
│	├───migrations/
│	│   ├───0_init/
│
├───src/
│	│
│	├───customers/
│	│
│	├───functions/
│	│
│	├───prisma/
│	│
│	├───rentals/
│	│
| └───tasks/
│
├───app.controller.spec.ts
│
├───app.controller.ts
│
├───app.module.ts
│
├───app.service.ts
│
└── main.ts

```

Comme il s'agit d'un petit projet, tous les endpoints seront dans le fichier app.controller.ts. Les dossiers customers, rentals et tasks ne contiennent que des services.

## Endpoints de l'API

### 1. **Création d'un client**

- **URL**: `/customer`
- **Method**: `POST`
- **Description**: Création d'un nouveau client. Le champs "email" qui était facultatif dans la table SQL ``rental``` est maintenant obligatoire pour permettre une bonne implémentation des tâches planifiées.
  Pour faciliter la création de mock datas, les clés "address" et "store" peuvent être liées à des données qui existent déjà à l'aide de foreign keys :
- **Request Body**:

  ```json
  {
    "last_name": "Doe",
    "ffirst_name": "John",
    "email": "john.doe@example.com",
    "address": {
      "connect": {
        "address_id": 5
      }
    },
    "store": {
      "connect": {
        "store_id": 2
      }
    }
  }
  ```

- **Réponses**:
  - 201: Client créé avec succès
  - 400: Erreur dans le body (ex. clé manquante)
  <!-- - 409: Erreur de validation (ex. email déjà utilisé) -->

### 2. **Modifier un client**

- **URL**: `/customer/:id`
- **Method**: `PATCH`
- **Description**: Modifier un client en particuler.
- **Request Body** (paramètres optionnels à mettre à jour):

  ```json
  {
    "first_name": "Jane",
    "email": "jane.doe@example.com"
  }
  ```

- **Réponse**:
  - 200: Succès de la modification

### 3. **Obtenir à l'aide de filtres les locations dont la date de retour est proche**

- **URL**: `/rentals`
- **Method**: `GET`
- **Description**: Récupère les locations avec une date de retour correspondant à 3 ou 5 jours à partir d'aujourd'hui.

- **Réponse**:
  - 200: Succès de la récuperation de données

### 4. **Effectuer une location**

- **URL**: `/rental`
- **Method**: `POST`
- **Description**: Créer une nouvelle location de film.
  La date de retour devra être supérieure à 1 semaine et inférieure à 3 semaines pour être sauvegardée en BDD. Puis elle sera sauvegardée avec une heure fixe (23h 59min 59s 999ms) pour faciliter la récupération des locations par date de retour.
  / ! \ Les dates sont renseignées en UTC.
- **Request Body** :
  ```js
  {
    "rental_date" : "2024-12-19T23:01:40Z",
    "return_date" : "2024-12-29T20:38:42Z",
    "customer" : {
        "connect" : {
            "customer_id" : 600
        }
    },
    "inventory" : {
        "connect" : {
            "inventory_id" : 1
        }
    },
    "staff" : {
        "connect" : {
            "staff_id" : 2
        }
    }
  }
  ```
- **Réponses**:

  - 201: Succès de la création de la location
  - 400: Erreur dans le body (ex. clé manquante)
  - 404: (ex. foreign keys avec des id inexistants)

  ### 5. **Obtenir la liste de tous les "emails" envoyés**

- **URL**: `/rentals/emails-sent`
- **Method**: `GET`
- **Description**: Récupère un tableau récapitulant tous les emails envoyés à telle date et à tel destinataire.

- **Réponse**:
  - 200: Succès de la récupération des données

#### Un petit mot pour la fin ?

```
Q2UgdGVzdCB0ZWNobmlxdWUgw6l0YWl0IHZyYWltZW50IGZ1biAhIEonYWkgYmVhdWNvdXAgYXBwcsOpY2nDqSBsZSBtaW5pIGpldSBkZSBwaXN0ZSBwb3VyIGFmZmljaGVyIGwnZXhlcmNpY2UsIGV0IGwnZXhlcmNpY2UgbHVpLW3Dqm1lIHF1aSBkZW1hbmRlIGRlIHLDqWZsw6ljaGlyIHBvdXIgdHJvdXZlciBkZXMgc29sdXRpb25zIHN1ciBkZXMgY2FzIGRlIGxhIHZpZSByw6llbGxlLiBDYSBmYWl0IHBsYWlzaXIgKGV0IMOnYSBjaGFuZ2UgZGVzIHRlc3RzIHRlY2huaXF1ZXMgZGUgMTAgbWludXRlcyBhdmVjIDE1IGV4ZXJjaWNlcyBkJ2FsZ28gw6AgZmFpcmUpLiBKZSBuZSBtYcOudHJpc2UgYXVjdW5lIGRlcyB0ZWNobm9zIGRlbWFuZMOpZXMgZGFucyBsZSB0ZXN0LCBuaSBOZXN0SlMsIG5pIFByaXNtYSwgbmkgU1FMLiBKZSBuJ2FpIGphbWFpcyBmYWl0IGRlIGNyb24gam9iIG5vbiBwbHVzLiBKJ2FpIGFwcHJpcyBwbGVpbiBkZSBjaG9zZXMhIE3Dqm1lIHNpIGplIG4nYWkgcGFzIHB1IHRvdXQgZmFpcmUgKHN1cnRvdXQgcGFyIG1hbnF1ZSBkZSB0ZW1wcy4gTm9uIHBhcyBxdWUgbGUgZMOpbGFpIG4nw6l0YWl0IHBhcyBzdWZmaXNhbnQuIEMnZXN0IGp1c3RlIHF1J2F1IGTDqXBhcnQsIGonYXZhaXMgbHUgcXVlIGxlIHByb2pldCBkZXZhaXQgw6p0cmUgaW5pdGlhbGlzw6kgYXZlYyBOZVh0IGF1IGxpZXUgZGUgTmVTdC4uLiBQdWlzIGonYWkgY29tcHJpcy4uLiBRdWVscXVlcyBqb3VycyBhdmFudCBsZSBkw6lsYWkgbGltaXRlIGRlIHJlbmR1Li4uKS4KRW4gdG91dCBjYXMsIGonYWkgZMOpY291dmVydCB1biBmcmFtZXdvcmsgdnJhaW1lbnQgcHVpc3NhbnQuIEonYWkgcHUgYXVzc2kgdGVzdMOpIG1hIGNhcGFjaXTDqSDDoCBtJ2FkYXB0ZXIgw6AgdW4gbm91dmVsIGVudmlyb25uZW1lbnQgdGVjaG5pcXVlLiBDJ8OpdGFpdCB0csOocyBlbnJpY2hpc3NhbnQu
```
