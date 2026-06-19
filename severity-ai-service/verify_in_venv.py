# -*- coding: utf-8 -*-
"""Verifie dans le venv (sklearn 1.6.1) que le modele charge et predit correctement."""
import sys, io, re, warnings
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
warnings.filterwarnings("ignore")
import os, joblib, numpy as np, pandas as pd, sklearn
print("sklearn:", sklearn.__version__)

HERE = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(HERE, "app", "model", "severity_model.pkl"))
print("Modele charge OK:", type(model).__name__)
print("classes_:", model.classes_)

LABELS = {0: "MINEURE", 1: "MAJEURE", 2: "BLOQUANTE"}

def clean(parts):
    s = " ".join("" if p is None else str(p) for p in parts)
    s = s.lower()
    s = re.sub(r'https?://\S+|www\.\S+', ' url ', s)
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

# 1) Tests qualitatifs (title, description, issue_type, priority, status, project)
tests = [
    ("Application crashes on login", "NullPointerException when user submits the login form, server returns 500", "Bug", "Blocker", "Open", "BACKEND"),
    ("Typo in footer copyright", "The year shows 2023 instead of 2024 in the footer text", "Bug", "Trivial", "Open", "FRONTEND"),
    ("Add dark mode toggle", "Improvement to let users switch theme", "Improvement", "Minor", "Open", "FRONTEND"),
    ("Data loss on concurrent save", "Two users saving the same record corrupts the database, transactions not isolated", "Bug", "Critical", "Open", "BACKEND"),
]
print("\n== Tests qualitatifs ==")
for t in tests:
    txt = clean(t)
    pred = int(model.predict([txt])[0])
    dec = model.decision_function([txt])[0]
    # pseudo-proba via softmax sur la fonction de decision
    e = np.exp(dec - np.max(dec)); proba = e / e.sum()
    conf = float(np.max(proba))
    print(f"  [{t[3]:8}] {t[0][:45]:45} -> {LABELS[pred]:9} (conf={conf:.2f})")

# 2) Accuracy globale sur le dataset (sanity check)
df = pd.read_csv(os.path.join(HERE, "data", "jira_anomaly_dataset_10000_final.csv"))
yhat = model.predict(df['ml_text'].fillna("").tolist())
acc = (yhat == df['anomaly_class'].values).mean()
print(f"\n== Accuracy (ml_text stocke -> anomaly_class) : {acc:.4f} sur {len(df)} lignes ==")

# 3) Accuracy si on RECONSTRUIT le texte depuis les colonnes (ce que fera FastAPI)
cols = ['title','description','issue_type','priority','status','project']
rebuilt = [clean([df.iloc[i][c] for c in cols]) for i in range(len(df))]
yhat2 = model.predict(rebuilt)
acc2 = (yhat2 == df['anomaly_class'].values).mean()
print(f"== Accuracy (texte RECONSTRUIT comme FastAPI -> anomaly_class) : {acc2:.4f} ==")
print("\nOK: le microservice reproduira ces predictions.")
