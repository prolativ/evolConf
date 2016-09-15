simulConf
--------------

Projekt mający na celu przygotowanie plików konfiguracyjnych do przeprowadzenia symulacji.
Jest to aplikacja webowa oparta na projekcie Google Blockly.

Instalacja
=======

```
$ git clone https://github.com/prolativ/simulConf
$ cd simulConf
$ npm install
```

Uruchomienie
===
```
$ npm start [nr_portu]
```
np.
```
$ npm start [4000]
```
nr_portu - opcjonalny, domyślnie 3000

W pasku przeglądarki internetowej wpisujemy adres uruchomionego serwera, np. `localhost:3000`, lub otwieramy przeglądarkę z terminala, np. poleceniem

```
xdg-open http://localhost:3000
```

Dla systemów Mac OS:

```
open http://localhost:3000

```

Uwagi
===
Serwer jest bezstanowy, więc z jednego serwera może korzystać wielu użytkowników w tej samej sieci.

Aplikacja była testowana z przeglądarkami Chrome 52.0 i Firefox 48.0.
