const puppeteer = require("puppeteer-extra");
const cheerio = require("cheerio");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

puppeteer.use(StealthPlugin());

const URL =
  "https://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/";

async function run() {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: executablePath(),
    });
    let page = await browser.newPage();

    async function setupPageInterception(page) {
      // Включаем перехват запросов
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (["image", "stylesheet", "font"].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }

    setupPageInterception(page);

    await page.goto(URL, {
      waitUntil: "networkidle0",
    });

    let pricesVisible = await page.$(".product-buy__price");

    // Проверяем, появились ли цены на странице
    while (!pricesVisible) {
      // Если цены не видны, создаем новую страницу
      await page.close();
      page = await browser.newPage();

      setupPageInterception(page);

      // Переходим на страницу с товарами
      await page.goto(URL, {
        waitUntil: "networkidle2",
      });

      // Повторно проверяем видимость цен
      pricesVisible = await page.$(".product-buy__price");
    }

    // Кнопка "Показать еще"
    let showMoreButton;
    do {
      await page.waitForSelector(".pagination-widget__show-more-btn");
      await page.waitForNetworkIdle();
      showMoreButton = await page.$(".pagination-widget__show-more-btn");
      if (showMoreButton) {
        await showMoreButton.click();
        await page
          .waitForSelector(".pagination-widget__show-more-btn", {
            timeout: 6000,
          })
          .catch(() => {});
      }
    } while (showMoreButton);

    const content = await page.content();
    const $ = cheerio.load(content);

    const products = [];

    // Ожидаем появления товаров
    await page.waitForSelector(".catalog-product");

    // Извлекаем информацию о товарах
    $(".catalog-product").each((index, element) => {
      const nameElement = $(element).find(".catalog-product__name span");
      const priceElement = $(element).find(".product-buy__price");

      // Извлекаем текст из элементов
      const name = nameElement.text().trim();
      const price = priceElement.text().trim();

      if (name && price) {
        products.push({ name, price });
      }
    });

    // Сохраняем данные в CSV-файл
    const csvData = products
      .map(
        (product) =>
          `${product.name.replace(/\s*\[.*?\]/g, "")},${product.price}`
      )
      .join("\n");
    const csvWithHeaders = `Имя,Цена\n${csvData}`;
    fs.writeFileSync("output.csv", csvWithHeaders, "utf-8");

    console.log("Scraping completed. Data saved to output.csv");
  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
