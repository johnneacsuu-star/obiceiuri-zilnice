# Jurnalul lui John

O aplicație personală pentru obiceiuri, jurnal și drumul pe termen lung. Merge pe telefon și pe calculator, se instalează ca aplicație și funcționează și offline.

Adresa: https://johnneacsuu-star.github.io/obiceiuri-zilnice/

## Instalare pe telefon

**Android, Chrome**
1. Deschide adresa în Chrome.
2. Atinge meniul cu trei puncte.
3. Alege „Adaugă pe ecranul principal” sau „Instalează aplicația”.

**iPhone, Safari**
1. Deschide adresa în Safari.
2. Atinge butonul „Partajare”.
3. Alege „Adaugă pe ecran”.

Pe calculator, în Chrome sau Edge, apare un buton de instalare în bara de adrese.

## Ce găsești în aplicație

* **Azi**: cele 12 obiceiuri, cu seara întâi. O atingere bifează obiceiurile simple. Pentru ore și minute se deschide o foaie cu ora exactă și butonul „Acum”.
* **Seara**: după ora 17:00 aplicația deschide ziua de mâine, cu seara care o pregătește. După 21:15 tema devine bleumarin închis. Doar bifezi, deciziile așteaptă dimineața.
* **Aur**: Seară de aur, Răsărit de aur, Zi câștigată, Buget și drum de aur, Zi de aur, Săptămână de aur.
* **Jurnal**: vremea din tine în 9 stări, un scor de la 0 la 10, text liber, dictare în română, notă vocală și fotografii. Pe calculator, „Firul jurnalului” adună totul într-un singur loc, cu căutare.
* **Progres**: săptămâna, ariile vieții pe radar, tendințe pe 30 și 90 de zile și harta ultimelor 6 luni.
* **Drum**: popasuri la 30, 60, 90, 150 și 365 de zile pentru fiecare arie, „Acum și atunci” față de punctul de plecare din 18 octombrie 2026 și obiceiurile formate. Un obicei ținut 5 din 7 zile, 4 săptămâni la rând, devine obicei format, iar aplicația propune pasul următor. Tu alegi.
* **Setări**: fotografia ta, ținte, nume, urmăriri opționale (cântarul săptămânii, energie, ore de somn), obiceiuri proprii, export și import.

Datele stau pe dispozitiv. Sincronizarea între telefon și calculator e opțională.

## Sincronizare prin GitHub

Datele merg într-un depozit privat: **johnneacsuu-star/obiceiuri-date**. Acolo stau `data.json` și fotografiile și notele vocale în dosarul `media`.

**Pasul 1. Creezi un token, o singură dată**
1. Intră pe https://github.com/settings/personal-access-tokens/new
2. Nume: „Jurnal”. Expirare: cât preferi, de exemplu un an.
3. La „Repository access” alegi „Only select repositories” și bifezi doar **obiceiuri-date**.
4. La „Permissions”, în secțiunea „Repository permissions”, setezi **Contents** pe „Read and write”.
5. Apeși „Generate token” și copiezi tokenul.

**Pasul 2. Îl pui în aplicație, pe fiecare dispozitiv**
1. Deschide aplicația, apoi Setări, apoi Sincronizare.
2. Alege GitHub. Depozitul e completat deja.
3. Lipește tokenul și apasă „Salvează”.

Tokenul rămâne doar pe acel dispozitiv, în memoria browserului. Nu ajunge în cod, în depozit sau în altă parte. Dacă pierzi telefonul, îl ștergi din aceeași pagină GitHub și faci altul.

Fiecare sincronizare face un commit mic în depozitul privat. Fotografiile și notele vocale urcă o singură dată.

## Sincronizare prin Netlify, ca opțiune

Dacă aplicația e găzduită pe Netlify, poți alege Netlify în Setări și un cod personal de minim 12 caractere, același pe toate dispozitivele. Pe GitHub Pages această variantă rămâne inactivă.

## Copie de siguranță

Setări, apoi „Exportă JSON”, salvează un fișier JSON cu obiceiurile și jurnalul. Fotografiile și notele vocale stau în depozitul privat, când sincronizarea e pornită.
