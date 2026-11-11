// Les tests des manches déclinent le joker ; les tests spicy couvrent son usage.
module.exports=async function continueTravel(page,selector){await page.locator(selector).click();if(await page.locator('#spicy-break').isVisible())await page.locator('#spicy-break-next').click();};
