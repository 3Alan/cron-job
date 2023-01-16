export default async function closeModal(page, selector) {
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  await element.evaluate(e => e.click());
}
