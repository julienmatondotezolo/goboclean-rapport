# Worker Dashboard Guide

## Overview
The Worker Dashboard is a mobile-first interface designed for field workers to manage their daily tasks and missions.

## Accessing the Dashboard
- **URL**: `/dashboard` (or `/{locale}/dashboard` for internationalized routes)
- **Authentication**: Workers must be logged in and have the role `worker`
- **Auto-redirect**: After login, workers are automatically redirected to the dashboard

## Features

### 1. Header Section
- **Current Time**: Displays the current time in 24-hour format
- **Logo**: IndustrialPro Field Operations branding
- **Notifications**: Bell icon for accessing notifications
- **Welcome Card**: 
  - Displays worker's first name
  - Shows number of high-priority sites for the day
  - User avatar with online status indicator

### 2. Statistics Cards
Two cards displaying key metrics:
- **Hours**: Total hours worked this week
- **Tasks**: Completed tasks vs total tasks (e.g., 12/15)

### 3. Assigned Missions
Displays a list of missions with two types:

#### Emergency Missions
- Green accent border (lime-400)
- "EMERGENCY" badge
- Team member indicators
- "START JOB" button for immediate action
- Alert icon in top-right corner

#### Scheduled Missions
- Gray accent border
- "SCHEDULED" badge
- Start time display
- "Details" link
- Clock icon in top-right corner

### 4. Floating Action Button (FAB)
- Green circular button with plus icon
- Fixed position at bottom-right
- Used for quick actions (e.g., create new report)

### 5. Bottom Navigation
Fixed bottom navigation bar with four sections:
- **HOME**: Dashboard (current page)
- **SCHEDULE**: View scheduled tasks
- **REPORTS**: Access reports
- **PROFILE**: User profile settings

## Data Sources

### From Database
- **User Profile**: First name, last name
- **One Mission**: The most recent report is converted to an emergency mission card
  - Uses the client address as the location
  - Displays as an emergency type mission

### Dummy Data
- **Stats**: 
  - Week hours: 38.5
  - Tasks completed: 12/15
  - High-priority sites: 3
- **Additional Missions**:
  - Floor Degreasing at Manufacturing Plant - Zone A (Scheduled for 14:30)
  - Ventilation Service at Storage Facility 3 (Scheduled for Tomorrow)

## Internationalization
The dashboard supports three languages:
- **English** (en)
- **French** (fr)
- **Dutch** (nl)

All text is localized using the `Dashboard` translation namespace.

## Components Used
- `MissionCard`: Displays mission information with type-specific styling
- `StatCard`: Shows statistics with icon, value, and subtitle
- `BottomNav`: Bottom navigation with active state management
- `Logo`: Company branding component

## Styling
- **Color Scheme**:
  - Background: Dark green (#1a3a2a)
  - Accent: Lime (#98d62e / lime-400)
  - Cards: White with shadows
  - Text: Gray scale with white on dark backgrounds

- **Design System**:
  - Rounded corners: 2xl (1rem)
  - Shadows: sm for cards
  - Font: Bold for headings, semibold for labels
  - Uppercase text for labels and navigation

## Mobile Optimization
- Responsive grid layout
- Touch-friendly button sizes
- Safe area consideration for bottom navigation
- Fixed positioning for FAB and bottom nav
- Maximum width constraint for larger screens

## Future Enhancements
- Real-time notifications
- Task filtering and search
- Calendar integration for scheduling
- GPS tracking for site navigation
- Offline mode with sync status
