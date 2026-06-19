# Severity AI Service 🧠

Microservice **Python / FastAPI** qui predit la severite d'une anomalie
(`MINEURE` / `MAJEURE` / `BLOQUANTE`) a partir de son texte, en utilisant un
modele entraine (TF-IDF mots + caracteres → XGBoost, ~97% sur le dataset).

Il est appele **uniquement par le backend Spring Boot** (jamais par le navigateur).

```
React  →  Spring Boot  →  FastAPI (ce service)  →  modele .pkl  →  severite
```

## Structure

```
severity-ai-service/
├── app/
│   ├── main.py               # API FastAPI (endpoints /health et /predict-severity)
│   ├── schemas.py            # Validation des entrees / format de sortie (Pydantic)
│   ├── prediction_service.py # Chargement du modele + nettoyage texte + prediction
│   ├── config.py             # Configuration (variables d'environnement)
│   └── model/
│       └── severity_model.pkl
├── data/
│   └── jira_anomaly_dataset_10000_final.csv   # dataset d'entrainement (reference)
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## ⚠️ Version de scikit-learn

Le modele a ete entraine avec **scikit-learn 1.6.1**.
Avec une autre version (ex. 1.3.2) il leve `NotFittedError: idf vector is not fitted`.
La version est **figee** dans `requirements.txt` — ne la changez pas.

## Installation & lancement (Windows / PowerShell)

```powershell
cd severity-ai-service
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt

# (optionnel) configurer la cle API
copy .env.example .env   # puis editez SEVERITY_API_KEY

# Lancer le service sur http://localhost:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Documentation interactive : http://localhost:8000/docs

## Endpoints

### `GET /health`
```json
{ "status": "ok", "modelLoaded": true, "modelVersion": "xgb-tfidf-1.0" }
```

### `POST /predict-severity`
En-tete optionnel : `X-API-Key: <votre-cle>` (si configuree).

Requete :
```json
{
  "titre": "Application crashes on login",
  "description": "NullPointerException when the user submits the login form",
  "priorite": "Blocker",
  "module": "BACKEND",
  "type_anomalie": "Bug",
  "impact": "Aucun utilisateur ne peut se connecter",
  "environnement": "Production",
  "etapes_reproduction": "1. Ouvrir /login  2. Saisir  3. Cliquer Connexion",
  "statut": "Open"
}
```

Reponse :
```json
{
  "severity": "BLOQUANTE",
  "predictedClass": 2,
  "confidence": 0.99,
  "scores": { "MINEURE": 0.0, "MAJEURE": 0.01, "BLOQUANTE": 0.99 },
  "modelVersion": "xgb-tfidf-1.0"
}
```

## Docker

```bash
docker build -t severity-ai-service .
docker run -p 8000:8000 -e SEVERITY_API_KEY=ma-cle severity-ai-service
```

## Mapping des classes (valide sur le dataset)

| Classe modele | Severite   | Justification                                  |
|---------------|------------|------------------------------------------------|
| 0             | MINEURE    | Plus gros groupe, aucun Blocker/Critical       |
| 1             | MAJEURE    | Niveau intermediaire                           |
| 2             | BLOQUANTE  | Contient 100% des Blocker (128) et Critical (160) |
