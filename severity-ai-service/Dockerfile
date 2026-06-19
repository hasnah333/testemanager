# Image legere Python 3.11 (meme version que celle testee).
FROM python:3.11-slim

WORKDIR /srv

# 1) Dependances (couche mise en cache tant que requirements.txt ne change pas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Code + modele
COPY app ./app

# 3) Le service ecoute sur 8000
EXPOSE 8000

# Sonde de sante Docker
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
