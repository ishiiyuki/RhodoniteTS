test('regression test Gltf2Importer-MSAA', async () => {
  jest.setTimeout(600000);
  const page = await browser.newPage();
  await page.goto('http://localhost:8082/samples/test_e2e/Gltf2Importer-MSAA');
  await page.setViewport({width: 1000, height: 1000});
  await page.waitForSelector('p#rendered', {timeout: 600000});
  const canvasElement = await page.$('#world');
  const image = await canvasElement.screenshot();
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.03,
    failureThresholdType: 'percent',
  });

  await page.close();
});