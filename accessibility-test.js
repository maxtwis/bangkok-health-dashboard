import { chromium } from 'playwright';

async function testAccessibility() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔍 Testing accessibility improvements...\n');
  
  // Navigate to dashboard
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Test accessibility improvements
  console.log('♿ ACCESSIBILITY VALIDATION:');
  
  const results = await page.evaluate(() => {
    const results = {
      svgElements: [],
      formInputs: [],
      improvements: []
    };
    
    // Check SVG elements for accessibility attributes
    const svgs = document.querySelectorAll('svg');
    svgs.forEach((svg, index) => {
      const hasRole = svg.hasAttribute('role');
      const hasAriaLabel = svg.hasAttribute('aria-label');
      results.svgElements.push({
        index: index + 1,
        hasRole,
        hasAriaLabel,
        accessible: hasRole && hasAriaLabel
      });
    });
    
    // Check form inputs for proper labeling
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
      const hasId = input.hasAttribute('id');
      const hasLabel = hasId ? document.querySelector(`label[for="${input.id}"]`) !== null : false;
      const hasAriaDescribedBy = input.hasAttribute('aria-describedby');
      const isInLabel = input.closest('label') !== null;
      
      results.formInputs.push({
        index: index + 1,
        type: input.tagName.toLowerCase(),
        hasId,
        hasLabel: hasLabel || isInLabel,
        hasAriaDescribedBy,
        accessible: (hasLabel || isInLabel) && hasId
      });
    });
    
    return results;
  });
  
  // Report SVG accessibility
  console.log(`📊 SVG Elements: ${results.svgElements.length} total`);
  const accessibleSvgs = results.svgElements.filter(svg => svg.accessible).length;
  console.log(`  ✅ Accessible SVGs: ${accessibleSvgs}/${results.svgElements.length}`);
  
  if (accessibleSvgs < results.svgElements.length) {
    const inaccessible = results.svgElements.filter(svg => !svg.accessible);
    console.log(`  ⚠️  Issues found in ${inaccessible.length} SVG elements:`);
    inaccessible.forEach(svg => {
      const missing = [];
      if (!svg.hasRole) missing.push('role');
      if (!svg.hasAriaLabel) missing.push('aria-label');
      console.log(`    - SVG ${svg.index}: Missing ${missing.join(', ')}`);
    });
  }
  
  console.log('');
  
  // Report form accessibility
  console.log(`📝 Form Elements: ${results.formInputs.length} total`);
  const accessibleInputs = results.formInputs.filter(input => input.accessible).length;
  console.log(`  ✅ Accessible Form Elements: ${accessibleInputs}/${results.formInputs.length}`);
  
  if (accessibleInputs < results.formInputs.length) {
    const inaccessible = results.formInputs.filter(input => !input.accessible);
    console.log(`  ⚠️  Issues found in ${inaccessible.length} form elements:`);
    inaccessible.forEach(input => {
      const missing = [];
      if (!input.hasId) missing.push('id');
      if (!input.hasLabel) missing.push('label association');
      console.log(`    - ${input.type.toUpperCase()} ${input.index}: Missing ${missing.join(', ')}`);
    });
  }
  
  console.log('');
  
  // Overall score
  const totalElements = results.svgElements.length + results.formInputs.length;
  const totalAccessible = accessibleSvgs + accessibleInputs;
  const score = Math.round((totalAccessible / totalElements) * 100);
  
  console.log(`🎯 ACCESSIBILITY SCORE: ${score}%`);
  
  if (score >= 90) {
    console.log('✅ Excellent accessibility implementation!');
  } else if (score >= 75) {
    console.log('👍 Good accessibility, minor improvements needed');
  } else {
    console.log('⚠️  Significant accessibility improvements required');
  }
  
  await browser.close();
  return score;
}

testAccessibility().catch(console.error);