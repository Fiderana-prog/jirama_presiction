# syntax=docker/dockerfile:1

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install -r requirements.txt

COPY app ./app
COPY data ./data
COPY models ./models
COPY verify_models.py ./verify_models.py
COPY verify_feature_builder.py ./verify_feature_builder.py
COPY test_full_pipeline.py ./test_full_pipeline.py

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import json,urllib.request,os; p=os.getenv('PORT','8000'); d=json.load(urllib.request.urlopen('http://127.0.0.1:'+p+'/health', timeout=5)); assert d.get('mode') == 'MODEL_READY' and d.get('feature_builder_ready') is True"

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips '*'"]
