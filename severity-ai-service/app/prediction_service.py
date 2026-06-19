# -*- coding: utf-8 -*-
"""Coeur de l'IA : chargement du modele, reconstruction du texte, prediction."""
import re
import logging
import joblib
import numpy as np

from .config import MODEL_PATH, CLASS_TO_SEVERITY
from .schemas import SeverityRequest

logger = logging.getLogger("severity.predict")

# --- Nettoyage du texte, IDENTIQUE a celui utilise pour entrainer le modele ---
_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_SPACES_RE = re.compile(r"\s+")


def clean_text(*parts: object) -> str:
    """Met en minuscules, remplace les URL par 'url', enleve la ponctuation."""
    s = " ".join("" if p is None else str(p) for p in parts)
    s = s.lower()
    s = _URL_RE.sub(" url ", s)
    s = _NON_ALNUM_RE.sub(" ", s)
    s = _SPACES_RE.sub(" ", s).strip()
    return s


class SeverityModel:
    """Encapsule le pipeline scikit-learn (TF-IDF -> XGBoost)."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None  # charge au demarrage

    def load(self) -> None:
        logger.info("Chargement du modele : %s", self.model_path)
        self.model = joblib.load(self.model_path)
        logger.info(
            "Modele charge : %s | classes=%s",
            type(self.model).__name__, getattr(self.model, "classes_", None),
        )

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def build_text(self, req: SeverityRequest) -> str:
        """Reconstruit l'entree texte dans l'ORDRE d'entrainement :
        title + description + issue_type + priority + status + project.
        Les champs libres supplementaires (impact, environnement, etapes) sont
        ajoutes a la description pour enrichir le texte.
        """
        description = " ".join(
            p for p in [req.description, req.impact, req.environnement, req.etapes_reproduction] if p
        )
        return clean_text(
            req.titre,            # title
            description,          # description (+ impact + env + etapes)
            req.type_anomalie,    # issue_type
            req.priorite,         # priority
            req.statut,           # status
            req.module,           # project
        )

    def predict(self, req: SeverityRequest) -> dict:
        if not self.is_loaded:
            raise RuntimeError("Le modele n'est pas charge")

        text = self.build_text(req)
        if not text:
            raise ValueError("Texte vide : au minimum le titre doit etre renseigne")

        predicted_class = int(self.model.predict([text])[0])

        # Confiance + scores par classe. Compatible avec deux types de modeles :
        #  - XGBoost / RandomForest : predict_proba -> vraies probabilites
        #  - LinearSVC (SVM)        : pas de predict_proba -> softmax sur decision_function
        confidence = None
        scores = None
        proba = None
        if hasattr(self.model, "predict_proba"):
            proba = np.asarray(self.model.predict_proba([text])[0], dtype=float)
        elif hasattr(self.model, "decision_function"):
            dec = np.atleast_1d(self.model.decision_function([text])[0]).astype(float)
            exp = np.exp(dec - np.max(dec))
            proba = exp / exp.sum()

        if proba is not None:
            confidence = round(float(np.max(proba)), 4)
            scores = {
                CLASS_TO_SEVERITY.get(int(c), str(c)): round(float(p), 4)
                for c, p in zip(self.model.classes_, proba)
            }

        severity = CLASS_TO_SEVERITY.get(predicted_class, "MINEURE")
        return {
            "severity": severity,
            "predictedClass": predicted_class,
            "confidence": confidence,
            "scores": scores,
            "_text_len": len(text),  # interne, pour les logs
        }


# Instance unique, partagee par toute l'application (le modele est charge 1 seule fois).
severity_model = SeverityModel()
