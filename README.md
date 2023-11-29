# metacommerce-scraper

Тестовое задание для Metacommerce

## Tech stack

+ cheerio
+ puppeteer-extra
+ puppeteer-extra-plugin-stealth

## Задача

С помощью Node.js и библиотеки Puppeteer (можете подключать дополнительные пакеты npm на ваше усмотрение, такие как cheerio и другие) необходимо собрать информацию обо всех товарах категории сайта DNS-shop.ru (https://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/).

На выходе мы должны в директорию проекта сохранить файл формата .csv.

Строками в файле будут являться товары, а столбцы - наименование и цена.

Важное условие - при загрузке страниц необходимо блокировать запросы, которые не влияют на собираемые данные (изображения, стили, сторонние домены с аналитикой и т.д.).

## Локальная установка

```
git clone https://github.com/valvalov22/metacommerce-scraper.git
```

```
npm install
```

```
npm run dev
```
или
```
node scraper.js
```
