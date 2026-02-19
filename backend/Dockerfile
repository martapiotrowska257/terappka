# Używamy lekkiego obrazu Pythona
FROM python:3.10-slim

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Instalujemy zależności systemowe wymagane dla mysqlclient (jeśli go używasz)
# oraz narzędzia do kompilacji
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Kopiujemy plik z wymaganiami
COPY requirements.txt .

# Instalujemy biblioteki Pythona
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy resztę kodu aplikacji
COPY . .

# Otwieramy port 5000 (domyślny dla Flaska)
EXPOSE 5000

# Uruchamiamy aplikację
CMD ["python", "run.py"]