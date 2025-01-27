test('regression test GltfImporter-morphing', async () => {
  jest.setTimeout(600000);
  const page = await browser.newPage();
  await page.goto(
    'http://localhost:8082/samples/test_e2e/GltfImporter-morphing'
  );
  await page.setViewport({width: 1000, height: 1000});
  await page.waitForFunction(() => {return window._rendered});
  const canvasElement = await page.$('#world');
  const image = await canvasElement.screenshot();
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.01,
    failureThresholdType: 'percent',
  });

  await page.close();
});
