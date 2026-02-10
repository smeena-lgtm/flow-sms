# Project Programs - How to Update

This file explains how to add, edit, or update project program data for the Gantt chart feature in Flow SMS.

## Where is the data?

All program data lives in a single JSON file:

```
src/data/programs.json
```

## Data Structure

Each program has this shape:

```json
{
  "projectId": "aventura",        // Unique ID (used for API lookup)
  "projectName": "Flow Aventura", // Display name
  "lastUpdated": "2026-02-10",    // Update this when you make changes
  "overallStatus": "in_progress", // Overall project status
  "stages": [...]                 // Array of stages (see below)
}
```

Each stage:

```json
{
  "id": 1,                         // Sequential number
  "name": "Pre-Concept",           // Full stage name
  "shortName": "Pre-Concept",      // Short name for Gantt bar labels
  "startDate": "2025-10-01",       // YYYY-MM-DD or null
  "endDate": "2026-04-15",         // YYYY-MM-DD or null
  "dueDate": "2026-04-15",         // Key milestone date or null
  "lead": "DLF",                   // Lead entity: DLF, AOR-Z, etc.
  "assist": "AOR-Z",               // Assisting entity or null
  "status": "in_progress",         // See status values below
  "remarks": "WIP. Pending...",    // Notes/comments
  "category": "design",            // See category values below
  "milestoneOnly": false           // true = diamond marker, false = bar
}
```

## Status Values

| Value | Display | Gantt Appearance |
|-------|---------|-----------------|
| `completed` | Completed | Full opacity bar with checkmark |
| `in_progress` | In Progress | Full opacity with pulse animation |
| `upcoming` | Upcoming | Faded bar (40% opacity) |
| `on_hold` | On Hold | Semi-faded (50% opacity) |
| `cancelled` | Cancelled | Very faded, name has strikethrough |

## Category Values

| Value | Display | Color |
|-------|---------|-------|
| `design` | Design | Indigo/Blue |
| `approvals` | Approvals | Purple |
| `construction` | Construction | Cyan |
| `handover` | Handover | Green |

## Common Updates

### Update a stage's dates

Find the stage by `id` or `name`, then change `startDate`, `endDate`, or `dueDate`:

```json
{
  "id": 3,
  "name": "City Workshop 001",
  "startDate": "2026-01-14",
  "endDate": "2026-03-01",       // <-- Changed from 2026-02-19
  "dueDate": "2026-03-01",       // <-- Updated due date
  ...
}
```

### Mark a stage as completed

Change `status` from `"in_progress"` to `"completed"`:

```json
{
  "id": 3,
  "name": "City Workshop 001",
  "status": "completed",          // <-- Changed
  ...
}
```

### Add a new project

Copy the "Flow Riyadh Tower" template (which has all 19 standard stages with no dates) and fill in:

1. Change `projectId` to a unique lowercase ID
2. Change `projectName` to the display name
3. Fill in dates and remarks for known stages
4. Update statuses as appropriate

### Add a new stage

Add a new object to the `stages` array. Keep `id` numbers sequential. Include all required fields.

## How the Gantt Chart Matches Projects

The Gantt chart on a project detail page tries to find a matching program using:

1. **projectId** match (e.g., "aventura")
2. **projectName** partial match (e.g., "Aventura" matches "Flow Aventura")
3. **marketingName** from PXT data as a fallback

To link a program to a PXT building, make sure the `projectId` or `projectName` contains a keyword from the building's marketing name.

## Future: Moving to Google Sheets

The current JSON approach is simple and works well for a small number of projects. When you need more team members to update programs, you can:

1. Create a Google Sheet with the same column structure
2. Update `src/app/api/programs/route.ts` to fetch from Google Sheets (same pattern as the PXT API)
3. Remove the JSON file

The API response shape stays the same, so no frontend changes needed.

## File Locations

| File | Purpose |
|------|---------|
| `src/data/programs.json` | Program data (edit this!) |
| `src/types/program.ts` | TypeScript type definitions |
| `src/app/api/programs/route.ts` | API endpoint |
| `src/components/projects/ProgramGantt.tsx` | Web Gantt chart component |
| `ios/.../ProgramGanttView.swift` | iOS Gantt chart component |
