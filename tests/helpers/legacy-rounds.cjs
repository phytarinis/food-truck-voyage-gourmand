/* Préchargement réservé aux suites historiques de mécaniques.
   Le composant de présentation a sa propre suite d’intégration sans ce préchargement.
   Les moteurs, les sauvegardes, les scores et les autres écrans ne sont pas substitués. */
const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=async(...args)=>{
 const browser=await launch(...args),newPage=browser.newPage.bind(browser);
 browser.newPage=async(...args)=>{
  const page=await newPage(...args);
  await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{
   window.presentRound=()=>false;
  }));
  return page;
 };
 return browser;
};
