test('regression test GltfImporter-texture-settings', async () => {
  jest.setTimeout(600000);
  const page = await browser.newPage();
  await page.goto('http://localhost:8082/samples/test_e2e/GltfImporter-texture-settings');
  await page.setViewport({ width: 1000, height: 1000 });
  await page.waitForSelector('p#rendered', { timeout: 600000 });
  const canvasElement = await page.$('#world');
  const image = await canvasElement.screenshot();
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.01,
    failureThresholdType: 'percent'
  });
});