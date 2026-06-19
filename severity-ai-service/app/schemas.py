# -*- coding: utf-8 -*-
"""Schemas Pydantic : valident les donnees entrantes et formattent la reponse JSON."""
from typing import Optional, Dict
from pydantic import BaseModel, Field


class SeverityRequest(BaseModel):
    """Donnees envoyees par Spring Boot pour demander une prediction.

    Seul `titre` est obligatoire. Les autres champs ameliorent la prediction.
    Les cles correspondent exactement a celles envoyees par le DTO Java.
    """
    titre: str = Field(..., min_length=1, description="Titre du bug (obligatoire)")
    description: Optional[str] = Field("", description="Description detaillee")
    priorite: Optional[str] = Field("", description="Priorite : Blocker/Major/Minor/...")
    module: Optional[str] = Field("", description="Module ou projet concerne")
    type_anomalie: Optional[str] = Field("", description="Type : Bug/Improvement/Task/...")
    impact: Optional[str] = Field("", description="Impact metier (texte libre)")
    environnement: Optional[str] = Field("", description="Environnement : prod/recette/...")
    etapes_reproduction: Optional[str] = Field("", description="Etapes de reproduction")
    statut: Optional[str] = Field("Open", description="Statut initial (defaut: Open)")

    # Exemple visible dans la doc Swagger (/docs)
    model_config = {
        "json_schema_extra": {
            "example": {
                "titre": "Application crashes on login",
                "description": "NullPointerException when the user submits the login form",
                "priorite": "Blocker",
                "module": "BACKEND",
                "type_anomalie": "Bug",
                "impact": "Aucun utilisateur ne peut se connecter",
                "environnement": "Production",
                "etapes_reproduction": "1. Ouvrir /login  2. Saisir email+mdp  3. Cliquer Connexion",
                "statut": "Open"
            }
        }
    }


class SeverityResponse(BaseModel):
    """Reponse renvoyee a Spring Boot."""
    severity: str = Field(..., description="MINEURE | MAJEURE | BLOQUANTE")
    predictedClass: int = Field(..., description="Classe brute du modele : 0/1/2")
    confidence: Optional[float] = Field(None, description="Confiance heuristique 0..1")
    scores: Optional[Dict[str, float]] = Field(None, description="Score par classe")
    modelVersion: str = Field(..., description="Version du modele utilise")
