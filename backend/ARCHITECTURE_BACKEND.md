# Architecture Backend - Test Management

Ce backend est organise selon une architecture en couches basee sur MVC avec Service Layer.

## Structure

- controller: API REST, reception des requetes HTTP.
- service: logique metier, validations, isolation des donnees par projet.
- repository: acces aux donnees avec Spring Data JPA.
- entity: modeles de la base de donnees.
- dto: objets de transfert entre client et backend.
- exception: gestion centralisee des erreurs.
- security: configuration de securite. Pour Jour 1, les routes sont ouvertes; JWT sera ajoute au Jour 2.
- config: configuration generale.
- enums: statuts et types fixes.

## Hierarchie metier

Projet -> ModuleProjet -> Scenario -> CasDeTest -> Execution -> Anomalie

Cette hierarchie permet d'eviter le melange entre les projets.

## Endpoints deja prepares

- GET /test
- POST /api/projets
- GET /api/projets
- GET /api/projets/{id}
- DELETE /api/projets/{id}
- POST /api/modules
- GET /api/modules
- GET /api/dashboard/{projetId}

## Configuration MySQL

Le fichier application.properties contient une configuration MySQL par defaut:

- database: testdb
- username: root
- password: vide

Si MySQL a un mot de passe, modifier:

spring.datasource.password=TON_MOT_DE_PASSE

## Lancer le projet

Windows:

mvnw.cmd spring-boot:run

Linux/Mac:

./mvnw spring-boot:run
