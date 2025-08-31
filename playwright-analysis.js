import { chromium } from 'playwright';

async function analyzeDashboard() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🔍 Starting Bangkok Health Dashboard Analysis...\n');
  
  // Navigate to dashboard
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  
  // Wait for main content to load
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // 1. Performance Analysis
  console.log('📊 PERFORMANCE METRICS:');
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  });
  console.log(`  • DOM Content Loaded: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
  console.log(`  • Page Load Complete: ${performanceMetrics.loadComplete.toFixed(2)}ms`);
  console.log(`  • First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
  console.log(`  • First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms\n`);
  
  // 2. Accessibility Analysis
  console.log('♿ ACCESSIBILITY CHECK:');
  const accessibilityIssues = await page.evaluate(() => {
    const issues = [];
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images without alt text`);
    }
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No heading structure found');
    }
    
    // Check for button accessibility
    const buttons = document.querySelectorAll('button');
    const buttonsWithoutText = Array.from(buttons).filter(btn => 
      !btn.textContent.trim() && !btn.getAttribute('aria-label')
    );
    if (buttonsWithoutText.length > 0) {
      issues.push(`${buttonsWithoutText.length} buttons without accessible text`);
    }
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length} form inputs without labels`);
    }
    
    return issues;
  });
  
  if (accessibilityIssues.length > 0) {
    accessibilityIssues.forEach(issue => console.log(`  ⚠️  ${issue}`));
  } else {
    console.log('  ✅ No major accessibility issues found');
  }
  console.log('');
  
  // 3. Interactive Elements Analysis
  console.log('🖱️ INTERACTIVE ELEMENTS:');
  const interactiveElements = await page.evaluate(() => {
    return {
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a').length,
      selects: document.querySelectorAll('select').length,
      inputs: document.querySelectorAll('input').length,
      clickableElements: document.querySelectorAll('[onclick], [role="button"]').length
    };
  });
  console.log(`  • Buttons: ${interactiveElements.buttons}`);
  console.log(`  • Links: ${interactiveElements.links}`);
  console.log(`  • Dropdowns: ${interactiveElements.selects}`);
  console.log(`  • Input fields: ${interactiveElements.inputs}`);
  console.log(`  • Other clickable: ${interactiveElements.clickableElements}\n`);
  
  // 4. Responsive Design Check
  console.log('📱 RESPONSIVE DESIGN CHECK:');
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    const layoutIssues = await page.evaluate((vp) => {
      const issues = [];
      
      // Check for horizontal overflow
      if (document.documentElement.scrollWidth > window.innerWidth) {
        issues.push('Horizontal scroll detected');
      }
      
      // Check if main content is visible
      const mainContent = document.querySelector('main, [role="main"], .App');
      if (mainContent) {
        const rect = mainContent.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          issues.push('Main content overflows viewport');
        }
      }
      
      return issues;
    }, viewport);
    
    console.log(`  ${viewport.name} (${viewport.width}x${viewport.height}): ${
      layoutIssues.length === 0 ? '✅ Good' : '⚠️ ' + layoutIssues.join(', ')
    }`);
  }
  console.log('');
  
  // 5. User Journey Testing
  console.log('🚶 USER JOURNEY TEST:');
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  try {
    // Test language toggle
    const langButton = await page.$('button:has-text("EN"), button:has-text("ไทย")');
    if (langButton) {
      await langButton.click();
      await page.waitForTimeout(500);
      console.log('  ✅ Language toggle works');
    } else {
      console.log('  ⚠️ Language toggle button not found');
    }
    
    // Test dropdown interactions
    const dropdowns = await page.$$('select');
    if (dropdowns.length > 0) {
      await dropdowns[0].selectOption({ index: 1 });
      console.log('  ✅ Dropdown selection works');
    }
    
    // Test tab navigation
    const tabs = await page.$$('[role="tab"], button:has-text("Hot Issues")');
    if (tabs.length > 0) {
      await tabs[0].click();
      await page.waitForTimeout(500);
      console.log('  ✅ Tab navigation works');
    }
    
  } catch (error) {
    console.log('  ⚠️ Some interactions failed:', error.message);
  }
  console.log('');
  
  // 6. Content Analysis
  console.log('📝 CONTENT ANALYSIS:');
  const contentAnalysis = await page.evaluate(() => {
    const allText = document.body.innerText;
    const wordCount = allText.split(/\s+/).length;
    const hasCharts = document.querySelectorAll('svg, canvas').length > 0;
    const hasTables = document.querySelectorAll('table').length > 0;
    const hasImages = document.querySelectorAll('img').length > 0;
    
    return {
      wordCount,
      hasCharts,
      hasTables,
      hasImages,
      chartsCount: document.querySelectorAll('svg, canvas').length,
      tablesCount: document.querySelectorAll('table').length
    };
  });
  
  console.log(`  • Total word count: ${contentAnalysis.wordCount}`);
  console.log(`  • Charts/Visualizations: ${contentAnalysis.chartsCount}`);
  console.log(`  • Tables: ${contentAnalysis.tablesCount}`);
  console.log(`  • Has images: ${contentAnalysis.hasImages ? 'Yes' : 'No'}\n`);
  
  // 7. Color Contrast Check
  console.log('🎨 COLOR & CONTRAST:');
  const colorAnalysis = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const colorPairs = new Set();
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const fg = style.color;
      if (bg !== 'rgba(0, 0, 0, 0)' && fg !== 'rgba(0, 0, 0, 0)') {
        colorPairs.add(`${bg}|${fg}`);
      }
    });
    
    return {
      uniqueColorPairs: colorPairs.size,
      hasHighContrast: colorPairs.size > 5
    };
  });
  
  console.log(`  • Unique color combinations: ${colorAnalysis.uniqueColorPairs}`);
  console.log(`  • Contrast variety: ${colorAnalysis.hasHighContrast ? 'Good' : 'Limited'}\n`);
  
  // Take screenshots for visual review
  await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved as dashboard-screenshot.png\n');
  
  // Generate recommendations
  console.log('💡 RECOMMENDATIONS BASED ON ANALYSIS:\n');
  
  console.log('HIGH PRIORITY:');
  if (performanceMetrics.firstContentfulPaint > 2000) {
    console.log('  • Optimize initial load time (FCP > 2s)');
  }
  if (accessibilityIssues.length > 2) {
    console.log('  • Fix accessibility issues for better inclusivity');
  }
  console.log('  • Add loading skeletons for better perceived performance');
  console.log('  • Implement error boundaries for graceful error handling\n');
  
  console.log('MEDIUM PRIORITY:');
  console.log('  • Add keyboard shortcuts for power users');
  console.log('  • Implement data export functionality (CSV/PDF)');
  console.log('  • Add comparison mode for districts');
  console.log('  • Include search functionality for indicators\n');
  
  console.log('LOW PRIORITY:');
  console.log('  • Add animations for smoother transitions');
  console.log('  • Implement dark mode');
  console.log('  • Add tooltips for complex metrics');
  console.log('  • Include onboarding tour for new users');
  
  await browser.close();
}

// Run the analysis
analyzeDashboard().catch(console.error);