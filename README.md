# AquaPulse — Water Intelligence & Civic Reporting

AquaPulse is a redesigned student-project prototype inspired by the purpose of the [Water Quality Monitoring repository](https://github.com/Cap26803/Water-Quality-Monitoring). It keeps the core idea of reporting water-related problems, while introducing a distinct interface and extra demo workflows.

## What's included

- A responsive dashboard with active-report metrics and a recent-report feed
- Complaint submission for water quality, leakage, supply, drainage, and other issues
- Priority labels and editable report status
- Search and filters for complaints
- CSV export of the currently filtered complaint list
- Sample water-quality indicator panel (pH, turbidity, free chlorine)
- Sample service-area / ward cards and illustrative activity chart
- Browser local-storage persistence for newly submitted reports
- Responsive desktop, tablet, and mobile layouts

## Tech stack

- React 18
- Vite
- Lucide React icons
- CSS (custom dark navy + aqua theme)

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To create a production build:

```bash
npm run build
npm run preview
```

## Demo limitations

This version is a **frontend prototype**. It stores reports in the current browser's `localStorage`; it does not have a server, MySQL database, user authentication, real map integration, or real sensor connectivity. The initial complaints, chart, locations, and water readings are illustrative sample data. The water-quality values are not safety advice and must not be represented as live measurements.

## Next step for a full-stack version

A production-style expansion could connect this UI to a Spring Boot REST API and MySQL database. Suggested endpoints:

- `GET /api/reports` — list reports, with optional status and priority filters
- `POST /api/reports` — create a report
- `PATCH /api/reports/{id}/status` — update report status
- `GET /api/insights/summary` — return dashboard aggregates

The API should validate input, handle authentication and permissions, and store timestamps and status history server-side.

## Relationship to the reference project

The reference repository describes a citizen complaint management system for water-related issues. AquaPulse is an independently styled prototype with additional demonstration features. Review the original repository's license and attribution terms before copying or adapting any of its source code. This package was created as a fresh implementation rather than a direct copy of its files.
