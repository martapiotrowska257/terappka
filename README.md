# TerAppka
Repozytorium do projektu zespołowego - wdrożenie aplikacji TerAppka

Uruchomienie aplikacji wymaga posiadania:
- [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)

Przed uruchomieniem aplikacji należy mieć poprawnie skonfigurowany plik zmiennych środowiskowych `.env` (przykładowe poprawne dane znajdują się w pliku `.env.example`).  
Przykładowa konfiguracja pośrednika **KeyCloak** znajduje się w pliku `./keycloak_data/realm-config.json`. W przypadku braku tego pliku **Docker Compose** stworzy pusty katalog, a konfigurację pośrednika będzie trzeba dokonać samemu.

Aplikację można uruchomić poleceniem `docker compose up --build -d`,  
zatrzymać poleceniem `docker compose stop`,  
zrestartować poleceniem `docker compose restart`,  
a usunąć `docker compose down`.  

Po uruchomieniu aplikacja będzie dostępna pod adresem http://localhost:3000/
