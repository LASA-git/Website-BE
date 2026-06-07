# LASA Backend

Express + MongoDB backend for LASA, modeled after CMV with a simplified feature set.

## Quick Start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## Core Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/events` (current year)
- `GET /api/events/archived`
- `GET /api/events/:id`
- `POST /api/events` (admin)
- `PUT /api/events/:id` (admin)
- `DELETE /api/events/:id` (admin)
- `POST /api/events/:id/flyer/generate` (admin)
- `POST /api/events/:id/flyer/select` (admin)
- `POST /api/media/presign` (admin)

## Event Behavior

- Events are a single collection.
- Current-year events show on the Events page.
- Any event from prior years appears under Archived.
- Event end date is auto-set to Dec 31 of the start year.
- `startDate` must be sent as `YYYY-MM-DD` (date only).
- Event dates are normalized and stored using UTC date semantics.
- Event APIs return `startDate` and `endDate` as date-only strings (`YYYY-MM-DD`) to avoid timezone day shifts.
