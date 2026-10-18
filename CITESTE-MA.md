# Obiceiurile mele

Aplicație simplă pentru telefon, în care notezi zilnic cele 12 obiceiuri. O zi bună începe din seara de dinainte. De aceea fiecare zi începe cu seara de dinainte, apoi dimineața, câștigul zilei și partea de job, bani și business.

## Ce conține folderul

* `index.html` este aplicația.
* `manifest.webmanifest` este fișierul care îi spune telefonului numele, culorile și iconița aplicației.
* `service-worker.js` păstrează aplicația pe telefon, ca să meargă și fără internet.
* `icons/` conține iconițele.

## Cum o instalezi pe telefon

Aplicația trebuie mai întâi pusă pe o adresă HTTPS. Telefonul nu o poate instala direct dintr-un fișier. După ce ai adresa:

### Android, cu Chrome

1. Deschide adresa în Chrome.
2. Atinge meniul cu trei puncte din dreapta sus.
3. Alege „Adaugă pe ecranul principal” sau „Instalează aplicația”.
4. Confirmă. Iconița „Obiceiuri” apare pe ecran.

### iPhone, cu Safari

1. Deschide adresa în Safari. Pe iPhone merge doar din Safari.
2. Atinge butonul Partajare, pătratul cu săgeată în sus.
3. Derulează și alege „Adaugă pe ecran”.
4. Atinge „Adaugă”. Iconița „Obiceiuri” apare pe ecran.

## Fără internet

După prima deschidere, aplicația merge și fără internet. Fără cod de sincronizare, datele stau doar pe dispozitiv, în browser. Cu cod, o copie ajunge în spațiul de stocare Netlify al siteului.

## Copia de siguranță

Din Setări poți exporta un fișier JSON cu toate datele. Fă asta din când în când. Dacă schimbi telefonul sau ștergi datele browserului, imporți fișierul din același loc, cu „Importă JSON”.

Atenție: pe iPhone, aplicația instalată pe ecran și Safari au date separate. Folosește mereu iconița de pe ecran.

## Cum o folosești

* Seara, după ora 17:00, aplicația deschide direct ziua de mâine, la secțiunea serii. Scrie „Seara asta pregătește ziua de ...”.
* Dimineața deschide ziua de azi. Dacă n-ai apucat să completezi seara, o faci acum, sus de tot.
* Cele 3 lucruri importante scrise seara în jurnal apar dimineața la „Cu ce te trezești azi”, cu căsuțe de bifat.
* Orice zi trecută se completează din săgeți sau din calendar.
* În Setări schimbi orele țintă, minutele, numele obiceiurilor și numele afacerii.

## Insignele de aur

Când toate cele 3 obiceiuri dintr-o grupă sunt făcute într-o zi, grupa se face aurie și primește o insignă:

* Seara de dinainte: „Seară de aur”
* Dimineața: „Răsărit de aur”
* Câștig ziua: „Zi câștigată”
* Job, bani și business: „Buget și drum de aur”

Toate 12 din 12 înseamnă „Zi de aur”, cu un soare mare pe ziua respectivă. Cinci zile de aur de luni până duminică înseamnă „Săptămână de aur”. În Săptămâna vezi câte insigne ai strâns și „Colecția de aur”, cu totalurile și cele mai lungi serii. Numele insignelor se schimbă din Setări.

## Telefon și calculator cu aceleași date

1. Deschide Setări, la Sincronizare.
2. Alege un cod personal de cel puțin 12 caractere, greu de ghicit, și atinge „Salvează codul”.
3. Pune exact același cod pe celălalt dispozitiv.

De atunci aplicația se sincronizează singură la deschidere, după fiecare modificare și când revine internetul. Fără internet notezi normal, iar modificările pleacă mai târziu. Sub buton scrie când a fost ultima sincronizare.

Dacă aceeași zi e modificată pe două dispozitive, rămâne varianta salvată ultima. Nu spune nimănui codul: cine îl are vede datele.

Pe calculator, la o fereastră lată, aplicația arată două coloane: ziua în stânga, săptămâna și KPI în dreapta.
