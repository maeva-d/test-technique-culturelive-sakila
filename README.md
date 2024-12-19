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

4. Copier-coller dans le query tool de Pg Admin 4 (ou un autre client), le script du fichier SQL "postgre-sakila-schema.sql", se trouvant dans le dossier "postgre-sakila-db".
   <br/>
   Exectuer le script
   <br/>
   Puis reproduire la procédure ci-dessus avec le fichier "postgre-sakila-insert-data-using-copy.sql"

5. Configurer les variables d'environnement dans un fichier `.env` pour se connecter à sa base de données PostgreSQL :

```env
DATABASE_URL : <postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA>
```

Il faudra ensuite suivre la [documentation de prisma](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/introspection-typescript-postgresql) pour créer les entités correspondant à notre schéma SQL automatiquement, par <bold>introspection</bold> .

6. Lancer l'application :

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

- **URL**: `/customers`
- **Method**: `POST`
- **Description**: Création d'un nouveau client. Le champs "email" qui était facultatif dans la table SQL ``rental``` est maintenant obligatoire pour permettre une bonne implémentation des tâches planifiées.
  Pour faciliter la création de clients factices, les clés "address" et "store" peuvent être liées à des données qui existent déjà à l'aide de foreign keys :
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

- **Réponse attendue**:
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

- **Response**:
  - 200: Succès de la modification

### 3. **Obtenir à l'aide de filtres les locations dont la date de retour est proche**

- **URL**: `/rentals`
- **Method**: `GET`
- **Description**: Récupère les locations avec une date de retour correspondant à 3 ou 5 jours à partir d'aujourd'hui.

  ```

  ```

- **Response**:
  - 200: Succès de la recuperation de données

### 4. **Effectuer une location**

- **URL**: `/rental`
- **Method**: `POST`
- **Description**: Créer une nouvelle location de film.
  La date de retour devra être supérieure à 1 semaine et inférieure à 3 semaines. Elle sera ensuite sauvegardée en BDD avec une heure fixe (23h 59min 59s 999ms) pour faciliter la récupération des locations par date de retour.
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
- **Response**:

  - 201: Succès de la création de la location
  - 400: Erreur dans le body (ex. clé manquante)
  - 404: (ex. foreign keys avec des id inexistants)

- **Response**:
  - 201: Location créée avec succès

#### Le mot de la fin:

```
Q2UgdGVzdCB0ZWNobmlxdWUgw6l0YWl0IHZyYWltZW50IGZ1biAhIEonYWkgYmVhdWNvdXAgYXBwcsOpY2nDqSBsZSBtaW5pIGpldSBkZSBwaXN0ZSBwb3VyIGFmZmljaGVyIGwnZXhlcmNpY2UsIGV0IGwnZXhlcmNpY2UgbHVpLW3Dqm1lIHF1aSBkZW1hbmRlIGRlIHLDqWZsw6ljaGlyIHBvdXIgdHJvdXZlciBkZXMgc29sdXRpb25zIHN1ciBkZXMgY2FzIGRlIGxhIHZpZSByw6llbGxlLiBDYSBmYWl0IHBsYWlzaXIgKGV0IMOnYSBjaGFuZ2UgZGVzIHRlc3RzIHRlY2huaXF1ZXMgZGUgMTAgbWludXRlcyBhdmVjIDE1IGV4ZXJjaWNlcyBkJ2FsZ28gw6AgZmFpcmUpLiBKZSBuZSBtYcOudHJpc2UgYXVjdW5lIGRlcyB0ZWNobm9zIGRlbWFuZMOpZXMgZGFucyBsZSB0ZXN0LCBuaSBOZXN0SlMsIG5pIFByaXNtYSwgbmkgU1FMIChwYXMgZW5jb3JlISBBcHByZW5kcmUgbGUgU1FMIGZhaXQgcGFydGl0IGR1IHByb2dyYW1tZSBkZSBtb24gYWx0ZXJuYW5jZSkuIEplIG4nYWkgamFtYWlzIGZhaXQgZGUgY3JvbiBqb2Igbm9uIHBsdXMuIEonYWkgYXBwcmlzIHBsZWluIGRlIGNob3NlcyEgTcOqbWUgc2kgamUgbidhaSBwYXMgdG91dCBmYWlyZSAoc3VydG91dCBwYXIgbWFucXVlIGRlIHRlbXBzLiBOb24gcGFzIHF1ZSBsZSBkw6lsYWkgbifDqXRhaXQgcGFzIHN1ZmZpc2FudC4gQydlc3QganVzdGUgcXUnYXUgZMOpcGFydCwgaidhdmFpcyBsdSBxdWUgbGUgcHJvamV0IGRldmFpdCDDqnRyZSBpbml0aWFsaXPDqSBhdmVjIE5lWHQgYXUgbGlldSBkZSBOZVN0Li4uIFB1aXMgaidhaSBjb21wcmlzLi4uIFF1ZWxxdWVzIGpvdXJzIGF2YW50IGxlIGTDqWxhaSBsaW1pdGUgZGUgcmVuZHUuLi4pLg0KRW4gdG91dCBjYXMsIGonYWkgZMOpY291dmVydCB1biBmcmFtZXdvcmsgdnJhaW1lbnQgcHVpc3NhbnQuIEonYWkgcHUgYXVzc2kgdGVzdMOpIG1hIGNhcGFjaXTDqSDDoCBtJ2FkYXB0ZXIgw6AgdW4gbm91dmVsIGVudmlyb25uZW1lbnQgdGVjaG5pcXVlLiBDJ8OpdGFpdCB0csOocyBlbnJpY2hpc3NhbnQu
```
