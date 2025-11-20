# Community PDF Export Script

This script automatically generates PDF reports for all communities with 7 or more survey respondents.

## Prerequisites

1. Make sure the dev server is running:
   ```bash
   npm run dev
   ```

2. The server should be running on `http://localhost:5173`

## Usage

In a **new terminal window** (while dev server is running), run:

```bash
npm run export-pdfs
```

## What it does

1. Reads the community data from `public/data/community_data.csv`
2. Identifies all communities with 7+ respondents
3. For each qualifying community:
   - Opens the community profile page
   - Selects the district and community
   - Generates a PDF report
4. Saves PDFs to `community-reports/` folder

## Output

PDFs are saved with the format: `เขต{DistrictName}_{CommunityName}.pdf`

Example: `เขตพระนคร_ชุมชนรุ่งมณีพัฒนา.pdf`

## Configuration

You can modify these settings in `exportCommunityPDFs.js`:

- `MIN_RESPONDENTS`: Minimum number of respondents (default: 7)
- `BASE_URL`: Local server URL (default: http://localhost:5173)
- `OUTPUT_DIR`: Output folder (default: ../community-reports)

## Notes

- The script uses Playwright (already installed) for browser automation
- PDFs are optimized for A4 paper with 2cm margins
- Background colors are removed for better printing
- The script shows progress for each community
