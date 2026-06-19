# Lance le microservice IA de prediction de severite (FastAPI, port 8000).
# Utilise le venv dedie (scikit-learn 1.6.1). Les logs vont dans severity-ai-run.log.
Set-Location 'C:\Users\Hasna\OneDrive\Desktop\projectpfee\severity-ai-service'
& '.\venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1 |
    Out-File -FilePath 'C:\Users\Hasna\OneDrive\Desktop\projectpfee\severity-ai-service\severity-ai-run.log' -Encoding utf8
