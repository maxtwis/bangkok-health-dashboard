/**
 * Export Community Profile PDFs
 *
 * This script generates PDF reports for all communities with 7+ respondents
 * Usage: node scripts/exportCommunityPDFs.js
 */

import { chromium } from 'playwright';
import { parse } from 'csv-parse/sync';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5173';
const MIN_RESPONDENTS = 7;
const OUTPUT_DIR = join(__dirname, '../community-reports');
const CSV_PATH = join(__dirname, '../public/data/community_data.csv');

// District code mapping
const districtCodeMap = {
  1001: "พระนคร", 1002: "ดุสิต", 1003: "หนองจอก", 1004: "บางรัก",
  1005: "บางเขน", 1006: "บางกะปิ", 1007: "ปทุมวัน", 1008: "ป้อมปราบศัตรูพ่าย",
  1009: "พระโขนง", 1010: "มีนบุรี", 1011: "ลาดกระบัง", 1012: "ยานนาวา",
  1013: "สัมพันธวงศ์", 1014: "พญาไท", 1015: "ธนบุรี", 1016: "บางกอกใหญ่",
  1017: "ห้วยขวาง", 1018: "คลองสาน", 1019: "ตลิ่งชัน", 1020: "บางกอกน้อย",
  1021: "บางขุนเทียน", 1022: "ภาษีเจริญ", 1023: "หนองแขม", 1024: "ราษฎร์บูรณะ",
  1025: "บางพลัด", 1026: "ดินแดง", 1027: "บึงกุ่ม", 1028: "สาทร",
  1029: "บางซื่อ", 1030: "จตุจักร", 1031: "บางคอแหลม", 1032: "ประเวศ",
  1033: "คลองเตย", 1034: "สวนหลวง", 1035: "จอมทอง", 1036: "ดอนเมือง",
  1037: "ราชเทวี", 1038: "ลาดพร้าว", 1039: "วัฒนา", 1040: "บางแค",
  1041: "หลักสี่", 1042: "สายไหม", 1043: "คันนายาว", 1044: "สะพานสูง",
  1045: "วังทองหลาง", 1046: "คลองสามวา", 1047: "บางนา", 1048: "ทวีวัฒนา",
  1049: "ทุ่งครุ", 1050: "บางบอน"
};

async function loadCommunityData() {
  console.log('📊 Loading community data...');
  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      if (context.header) return value;
      if (value === '') return null;
      const num = Number(value);
      return isNaN(num) ? value : num;
    }
  });

  return records;
}

function getCommunityGroups(records) {
  const groups = {};

  records.forEach(record => {
    const district = record.dname;
    const community = record.community_name;

    if (!district || !community) return;

    const key = `${district}_${community}`;
    if (!groups[key]) {
      groups[key] = {
        district,
        community,
        count: 0
      };
    }
    groups[key].count++;
  });

  return Object.values(groups)
    .filter(g => g.count >= MIN_RESPONDENTS)
    .sort((a, b) => {
      const districtCompare = districtCodeMap[a.district]?.localeCompare(districtCodeMap[b.district], 'th') || 0;
      if (districtCompare !== 0) return districtCompare;
      return a.community.localeCompare(b.community, 'th');
    });
}

function sanitizeFilename(str) {
  return str.replace(/[/\\?%*:|"<>]/g, '-');
}

async function generatePDF(browser, district, community) {
  const districtName = districtCodeMap[district] || district;
  const filename = sanitizeFilename(`เขต${districtName}_${community}.pdf`);
  const outputPath = join(OUTPUT_DIR, filename);

  console.log(`  📄 Generating: ${filename}`);

  const page = await browser.newPage();

  try {
    // Navigate to the community profile page
    await page.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });

    // Wait for the page to load
    await page.waitForSelector('select', { timeout: 10000 });

    // Select district
    await page.selectOption('select', district.toString());
    await page.waitForTimeout(500);

    // Select community
    const communitySelects = await page.$$('select');
    if (communitySelects.length >= 2) {
      await communitySelects[1].selectOption(community);
      await page.waitForTimeout(1000);
    }

    // Wait for content to load
    await page.waitForSelector('section', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: false,
      preferCSSPageSize: true
    });

    console.log(`  ✅ Saved: ${filename}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error generating ${filename}:`, error.message);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Starting Community PDF Export');
  console.log(`📍 Minimum respondents: ${MIN_RESPONDENTS}`);
  console.log('');

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load data
  const records = await loadCommunityData();
  console.log(`📝 Total records: ${records.length}`);

  // Get communities with enough respondents
  const communities = getCommunityGroups(records);
  console.log(`✅ Communities with ${MIN_RESPONDENTS}+ respondents: ${communities.length}`);
  console.log('');

  if (communities.length === 0) {
    console.log('⚠️  No communities found with minimum respondents');
    return;
  }

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ headless: true });

  let successCount = 0;
  let failCount = 0;

  try {
    for (let i = 0; i < communities.length; i++) {
      const { district, community } = communities[i];
      const districtName = districtCodeMap[district] || district;

      console.log(`\n[${i + 1}/${communities.length}] เขต${districtName} - ${community}`);

      const success = await generatePDF(browser, district, community);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } finally {
    await browser.close();
  }

  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log('📊 Export Summary');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('═══════════════════════════════════════');
}

main().catch(console.error);
