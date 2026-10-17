# Elite Data — Jagorar farawa

Wannan starter project yana da **Frontend (HTML/CSS/JavaScript)** da **Backend (Node.js + Express)**.

## Abubuwan da ke aiki a demo
- Rajista da login (password ana hash dinsa).
- Dashboard da wallet balance.
- Demo wallet funding (ba a karɓar kuɗi na gaske).
- Demo data/airtime order da transaction history.
- Responsive design don wayar Android da kwamfuta.

## Yadda za ka kunna shi
1. Shigar da Node.js version 18 ko sama a kwamfuta ko hosting mai goyon bayan Node.js.
2. Buɗe terminal a cikin folder ɗin `elite_data_website`.
3. Gudanar da `npm install`.
4. Ƙirƙiri secret mai ƙarfi, sannan ka sa `JWT_SECRET` a environment variables.
5. Gudanar da `npm start`.
6. Buɗe `http://localhost:3000`.

## Muhimmin tsaro kafin a wallafa
- **Kada ka yi amfani da demo funding a live website.** Ba ya karɓar kuɗi; yana ƙara balance na gwaji ne kawai.
- Kafin a sayar da data/airtime na gaske, haɗa sahihin payment gateway da VTU/data vending API, sannan a tabbatar da biyan kuɗi ta server-side webhook.
- Sauya `JWT_SECRET` ta environment variable.
- Wannan demo yana ajiye bayanai a `data.json`; don live service ka yi amfani da database mai ɗorewa kamar PostgreSQL, ka ƙara rate limiting, validation, logging, backups, HTTPS, da admin authentication.
- Kada ka ajiye API secret ko payment keys a frontend.
- Ka gwada dukkan tsarin kafin karɓar kuɗin abokan ciniki.

## Tsarin folder
- `server.js` — backend routes da authentication
- `public/index.html` — frontend page
- `public/style.css` — design da responsive layout
- `public/app.js` — frontend interactions
- `data.json` — ana ƙirƙirarsa da kansa idan an fara amfani da API
