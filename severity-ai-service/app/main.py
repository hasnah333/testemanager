# -*- coding: utf-8 -*-
"""Point d'entree FastAPI : expose POST /predict-severity et GET /health."""
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse

from .config import API_KEY, MODEL_VERSION
from .schemas import SeverityRequest, SeverityResponse
from .prediction_service import severity_model

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("severity.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Au demarrage : on charge le modele UNE seule fois ---
    severity_model.load()
    yield
    # --- A l'arret : rien a nettoyer ---


app = FastAPI(
    title="Severity AI Service",
    description="Predit la severite d'une anomalie (MINEURE/MAJEURE/BLOQUANTE) a partir du texte.",
    version="1.0.0",
    lifespan=lifespan,
)


def check_api_key(x_api_key: str | None) -> None:
    """Verifie la cle API si une cle est configuree (sinon mode dev ouvert)."""
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Cle API invalide ou manquante")


@app.get("/health")
def health():
    """Sonde de sante : utilisee par Spring/Docker pour verifier que le service est pret."""
    return {
        "status": "ok",
        "modelLoaded": severity_model.is_loaded,
        "modelVersion": MODEL_VERSION,
    }


@app.post("/predict-severity", response_model=SeverityResponse)
def predict_severity(
    req: SeverityRequest,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
):
    """Predit la severite d'une anomalie a partir de ses informations."""
    check_api_key(x_api_key)

    t0 = time.time()
    try:
        result = severity_model.predict(req)
    except ValueError as e:
        # Donnees invalides (ex: texte vide) -> 422
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        logger.exception("Erreur interne pendant la prediction")
        raise HTTPException(status_code=500, detail="Erreur interne de prediction")

    elapsed_ms = (time.time() - t0) * 1000
    logger.info(
        "PREDICT severity=%s class=%s conf=%s len=%s %.1fms",
        result["severity"], result["predictedClass"],
        result["confidence"], result["_text_len"], elapsed_ms,
    )

    return SeverityResponse(
        severity=result["severity"],
        predictedClass=result["predictedClass"],
        confidence=result["confidence"],
        scores=result["scores"],
        modelVersion=MODEL_VERSION,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.exception("Exception non geree")
    return JSONResponse(status_code=500, content={"detail": "Erreur serveur"})
