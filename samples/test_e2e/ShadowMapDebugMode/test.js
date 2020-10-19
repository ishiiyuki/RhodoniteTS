test('regression test ShadowMapDebugMode', async () => {
  jest.setTimeout(60000);
  const page = await browser.newPage();
  await page.goto('http://localhost:8082/samples/test_e2e/ShadowMapDebugMode');
  await page.setViewport({ width: 1000, height: 1000 });
  await page.waitForSelector('p#rendered', { timeout: 60000 });
  const canvasElement = await page.$('#world');
  const image = await canvasElement.screenshot();
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.01, // To counteract the error in depth encode shader
    failureThresholdType: 'percent'
  });
  await page.goto('about:blank');
  await page.close();
});
