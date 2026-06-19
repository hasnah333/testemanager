# -*- coding: utf-8 -*-
"""Configuration du microservice (lue depuis les variables d'environnement / .env)."""
import os
from dotenv import load_dotenv

# Charge le fichier .env s'il existe (pratique en developpement local).
load_dotenv()

# Dossier de ce fichier (.../app)
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Chemin du modele entraine. Par defaut : app/model/severity_model.pkl
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(APP_DIR, "model", "severity_model.pkl"))

# Cle API partagee avec Spring Boot. Si vide -> authentification desactivee (dev uniquement).
# En production, mettez la MEME valeur ici (.env) et cote Spring (application.properties).
API_KEY = os.getenv("SEVERITY_API_KEY", "")

# Version affichee du modele (utile pour tracer quelle version a fait la prediction).
MODEL_VERSION = os.getenv("MODEL_VERSION", "xgb-tfidf-1.0")

# Correspondance classe du modele (0/1/2) -> libelle de gravite.
# Valide empiriquement sur le dataset : la classe 2 contient 100% des Blocker/Critical.
CLASS_TO_SEVERITY = {
    0: "MINEURE",
    1: "MAJEURE",
    2: "BLOQUANTE",
}
