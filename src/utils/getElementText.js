export default async function getElementText(page, selector) {
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  return await page.evaluate(element => element.textContent, element);
}
