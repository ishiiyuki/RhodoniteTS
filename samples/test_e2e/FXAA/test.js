test('regression test FXAA', async () => {
  jest.setTimeout(600000);
  const page = await browser.newPage();
  await page.goto('http://localhost:8082/samples/test_e2e/FXAA');
  await page.setViewport({width: 1000, height: 1000});
  await page.waitForFunction(() => {return window._rendered});
  const canvasElement = await page.$('#world');
  const image = await canvasElement.screenshot();
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.05,
    failureThresholdType: 'percent',
  });
  await page.close();
});
