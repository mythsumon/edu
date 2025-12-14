# Education Dashboard User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Navigation](#navigation)
5. [Key Features](#key-features)
6. [Language Support](#language-support)
7. [Filtering Data](#filtering-data)
8. [Interacting with Visualizations](#interacting-with-visualizations)
9. [Responsive Design](#responsive-design)
10. [Troubleshooting](#troubleshooting)

## Introduction

The Education Program Status Dashboard provides a comprehensive view of educational program progress across different regions in Gyeonggi Province. This guide will help you navigate and utilize all features of the dashboard effectively.

## Getting Started

To run the dashboard locally:

1. Ensure you have Node.js installed on your system
2. Clone the repository
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`

## Dashboard Overview

The dashboard consists of several key sections:

1. **Header**: Contains the page title, language selector, notifications, and profile options
2. **Sidebar**: Provides navigation to different sections of the application
3. **KPI Strip**: Displays key performance indicators at a glance
4. **Regional Progress Section**: Shows progress data through cards and an interactive map
5. **Special Items Section**: Highlights progress on specific program categories
6. **Program List**: Detailed table of all programs with search functionality

## Navigation

### Sidebar Menu
- **Home**: Return to the main dashboard
- **Overall Program Status**: Current page (dashboard)
- **Institution Management**: Manage educational institutions
- **Program Management**: Manage educational programs
- **Settings**: Application configuration options

### Breadcrumbs
Located below the header, breadcrumbs show your current location and allow quick navigation to higher-level pages.

## Key Features

### KPI Dashboard
The Key Performance Indicators section displays four critical metrics:
- Total number of programs
- Overall progress rate
- Programs completed this month
- Number of participating institutions

Each KPI card shows a trend indicator comparing current values to the previous month.

### Regional Progress Visualization
This section presents data in two complementary views:
- **Regional Cards**: Grid layout showing progress for each of the 6 regions
- **Interactive Map**: Geographic representation of regional progress

Clicking on a regional card highlights the corresponding area on the map and vice versa.

### Special Items Progress
Displays progress rates for specialized program categories:
- Books/Wallpapers
- 50 Sessions
- Special Classes

### Program List
A searchable table containing all educational programs with details such as:
- Program name
- Institution
- Start and end dates
- Progress status
- Action buttons for detailed views

## Language Support

The dashboard supports both Korean and English interfaces:

1. **Language Toggle**: Located in the top-right corner of the header
2. **Current Language Indicator**: Shows "KO" for Korean or "EN" for English
3. **Persistent Setting**: Your language preference is saved in browser storage

To switch languages:
1. Click the language button in the header
2. The interface will immediately update to the selected language
3. Your preference will be remembered for future visits

## Filtering Data

### Date Filters
- **Year Selector**: Dropdown to select the year (2023-2025)
- **Month Selector**: Dropdown to select a specific month or "All"

### Reset Filters
- The "Reset Filters" button returns all filters to their default state

### Regional Filtering
- Click on any regional card to filter data for that specific region
- The map will automatically highlight the selected region
- All other components will update to show data for the selected region

## Interacting with Visualizations

### Regional Cards
- Hover: See subtle highlighting effect
- Click: Select the region and filter all dashboard data
- Selected state: Card appears with a distinctive border

### Interactive Map
- Hover: Display tooltips with region-specific information
- Click: Select the region (same effect as clicking regional cards)
- Selected state: Region appears with a distinctive color

### Program List
- Search: Type in the search box to filter programs by name or institution
- Pagination: Navigate through multiple pages of programs
- Detail Views: Click action buttons to view attendance sheets, activity logs, and material confirmations

## Responsive Design

The dashboard adapts to different screen sizes:

- **Desktop**: Full layout with all components visible
- **Tablet**: Condensed layout with 2-column grids
- **Mobile**: Single column layout optimized for touch interaction

## Troubleshooting

### Dashboard Not Loading
1. Ensure all dependencies are installed (`npm install`)
2. Check that the development server is running (`npm run dev`)
3. Verify you're accessing the correct URL (typically `http://localhost:3000`)

### Language Switching Issues
1. Try clearing your browser cache
2. Ensure browser storage is enabled
3. Check browser console for JavaScript errors

### Filter Problems
1. Use the "Reset Filters" button to restore default settings
2. Ensure date selections are valid
3. Refresh the page if filters aren't applying correctly

### Performance Issues
1. Close other browser tabs to free up memory
2. Ensure you're using a modern browser
3. Check your internet connection if loading external resources

## Feedback and Support

For issues, suggestions, or questions about the dashboard, please contact the development team or submit an issue in the project repository.