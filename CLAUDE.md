# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MCP Integration

### Context7
This project uses Context7 MCP server for enhanced context awareness and capabilities.
- **MCP Server**: Context7 (https://mcp.context7.com/mcp)
- **Configuration**: Configured via `claude mcp add` command
- **Purpose**: Provides additional context and capabilities for better code understanding and assistance

### Playwright
MCP Playwright integration for browser automation and testing.
- **MCP Server**: Playwright MCP
- **Purpose**: Enables browser automation, web scraping, and end-to-end testing capabilities
- **Features**: Browser control, page navigation, element interaction, screenshot capture

## Commands

### Development
- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle to `dist/` folder
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Tech Stack
- **Framework**: React 19 with Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts for charts, Leaflet/React-Leaflet for maps
- **Data Processing**: PapaCSV for CSV parsing, Lodash for utilities

### Project Structure

#### Core Application Flow
1. **Entry Point**: `src/main.jsx` → `src/App.jsx`
2. **Routing**: URL-based navigation (`/`, `/main`, `/detail`, `/analysis`) all render the Dashboard component with different states
3. **State Management**: Context API for language (LanguageContext), local state for dashboard filters

#### Key Components Architecture

**Dashboard System** (`src/components/Dashboard/`)
- `index.jsx` - Main dashboard controller, handles routing logic and state orchestration
- `BangkokMap.jsx` - Interactive map visualization using Leaflet
- `IndicatorDetail.jsx` - Detailed view for individual indicators
- `IndicatorAnalysis.jsx` - Analysis view with charts and comparisons
- `PopulationGroupSpiderChart.jsx` - Spider chart for population group comparisons

**Data Flow**
1. **Data Loading**: `useSDHEData` hook fetches CSV data from `/public/data/`
2. **Processing**: `DataProcessor` class transforms raw CSV into structured data
3. **Indicator Metadata**: `useIndicators` hook provides indicator names and descriptions
4. **Utilities**: `dashboardUtils.js` contains helper functions for calculations and formatting

#### Data Sources
All data files are in `/public/data/`:
- `survey_sampling.csv` - Main survey data
- `health_facilities.csv` - Healthcare facility information
- `district_population.csv` - Population by district
- `community_population.csv` - Community-level population data
- `normal_population_indicator_*.csv` - Population indicators
- GeoJSON: `district.geojson` for Bangkok district boundaries

#### Key Constants (`src/constants/dashboardConstants.js`)
- `DOMAINS` - Health domain categories
- `POPULATION_GROUPS` - Population segments (informal workers, elderly, etc.)
- `REVERSE_INDICATORS` - Indicators where lower values are better
- `HEALTHCARE_SUPPLY_BENCHMARKS` - Thresholds for healthcare facility ratios

### Build Configuration

**Vite Config** (`vite.config.js`)
- Manual chunks for code splitting: vendor, charts, maps, utils
- Optimized dependencies: leaflet, papaparse, lodash, recharts

**ESLint Rules**
- React hooks validation
- React refresh compatibility
- Unused variables allowed if uppercase or underscore prefixed

### Performance Considerations
- Minimum sample size of 5 respondents per district (DataProcessor)
- 30-second timeout for data fetching
- Memoized calculations in dashboard components
- Lazy loading for route components

## Visual Development & Testing

### Design System

The project follows S-Tier SaaS design standards inspired by Stripe, Airbnb, and Linear. All UI development must adhere to:

- **Design Principles**: `/context/design-principles.md` - Comprehensive checklist for world-class UI
- **Component Library**: NextUI with custom Tailwind configuration

### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages` ⚠️

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

For significant UI changes or before merging PRs, use the design review agent:

```bash
# Option 1: Use the slash command
/design-review

# Option 2: Invoke the agent directly
@agent-design-review
```

The design review agent will:

- Test all interactive states and user flows
- Verify responsiveness (desktop/tablet/mobile)
- Check accessibility (WCAG 2.1 AA compliance)
- Validate visual polish and consistency
- Test edge cases and error states
- Provide categorized feedback (Blockers/High/Medium/Nitpicks)

### Playwright MCP Integration

#### Essential Commands for UI Testing

```javascript
// Navigation & Screenshots
mcp__playwright__browser_navigate(url); // Navigate to page
mcp__playwright__browser_take_screenshot(); // Capture visual evidence
mcp__playwright__browser_resize(
  width,
  height
); // Test responsiveness

// Interaction Testing
mcp__playwright__browser_click(element); // Test clicks
mcp__playwright__browser_type(
  element,
  text
); // Test input
mcp__playwright__browser_hover(element); // Test hover states

// Validation
mcp__playwright__browser_console_messages(); // Check for errors
mcp__playwright__browser_snapshot(); // Accessibility check
mcp__playwright__browser_wait_for(
  text / element
); // Ensure loading
```

### Design Compliance Checklist

When implementing UI features, verify:

- [ ] **Visual Hierarchy**: Clear focus flow, appropriate spacing
- [ ] **Consistency**: Uses design tokens, follows patterns
- [ ] **Responsiveness**: Works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] **Accessibility**: Keyboard navigable, proper contrast, semantic HTML
- [ ] **Performance**: Fast load times, smooth animations (150-300ms)
- [ ] **Error Handling**: Clear error states, helpful messages
- [ ] **Polish**: Micro-interactions, loading states, empty states, No Emojis

## When to Use Automated Visual Testing

### Use Quick Visual Check for:

- Every front-end change, no matter how small
- After implementing new components or features
- When modifying existing UI elements
- After fixing visual bugs
- Before committing UI changes

### Use Comprehensive Design Review for:

- Major feature implementations
- Before creating pull requests with UI changes
- When refactoring component architecture
- After significant design system updates
- When accessibility compliance is critical

### Skip Visual Testing for:

- Backend-only changes (API, database)
- Configuration file updates
- Documentation changes
- Test file modifications
- Non-visual utility functions

## Additional Context

- Design review agent configuration: `/.claude/agents/design-review-agent.md`
- Design principles checklist: `/context/design-principles.md`
- Custom slash commands: `/context/design-review-slash-command.md`