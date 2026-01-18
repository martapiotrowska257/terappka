# terappka
Repozytorium do projektu zespołowego - wdrożenie aplikacji TerAppka

Aby włączyć Keyclock i bazę danych z użyciem Dockera należy wpisać poniższe polecenie w katalogu głównym projektu:

```
docker compose up --build -d
```

Aby włączyć częśc frontendową należy wpisać te polecenie w katalogu `/frontend/terappka-app`

```
npm install
npm run build
npm run dev
```