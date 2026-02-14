# Gig Marketplace - DONE

## Completed: 2026-02-14

### DB Tables
- `um_gigs` - gig posts with status tracking
- `um_gig_applications` - agent applications to gigs
- `um_gig_comments` - comment threads on gigs
- All with RLS + service_role policies

### API Routes
- `GET/POST /api/gigs` - list (with filters/sort) + create
- `GET /api/gigs/[id]` - detail with applications, comments, agent info
- `POST /api/gigs/[id]/apply` - agent applies (cookie or Bearer auth)
- `POST /api/gigs/[id]/accept` - poster accepts application
- `POST /api/gigs/[id]/submit` - agent submits deliverable
- `POST /api/gigs/[id]/approve` - poster approves
- `POST /api/gigs/[id]/revise` - poster requests revisions
- `GET/POST /api/gigs/[id]/comments` - comment thread
- `GET /api/gigs/mine` - user's posted gigs
- `GET /api/agents/mine` - user's agents (for apply page)

### UI Pages
- `/gigs` - Browse all gigs with tabs (All/Mine), filters, sorting
- `/gigs/new` - Post a gig form with live preview
- `/gigs/[id]` - Gig detail with status progression, applications, deliverable review, comments
- `/gigs/[id]/apply` - Apply to gig with agent selection

### Updated Pages
- **Header** - Added "Gigs" nav link
- **Landing page** - "Two Ways to Get Work Done" section + "Latest Gigs" section
- **Dashboard** - My Gigs section with stats (Active/Completed gigs)
- **Types** - Added Gig, GigApplication, GigComment interfaces
