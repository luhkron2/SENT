# 🧪 SE Repairs - Testing Guide

## 📊 Mock Data Summary

The database has been seeded with comprehensive test data:

- **Users**: 4 (Admin, Operations, Workshop, Driver)
- **Drivers**: 60 active drivers
- **Fleet Units**: 47 prime movers
- **Trailers**: 51 trailers
- **Issues**: 15 diverse issues across all severity levels
- **Work Orders**: 7 scheduled repairs
- **Comments**: 8 comments on various issues

## 🔑 Test Credentials

### Quick Access (Password Only)
- **Operations**: `SENATIONAL07`
- **Workshop**: `SENATIONAL04`
- **Admin**: `admin123`

### Email Login
- **Admin**: `admin@example.com` / `password123`
- **Operations**: `ops@example.com` / `password123`
- **Workshop**: `workshop@example.com` / `password123`

## 🎯 Feature Testing Checklist

### 1. **Homepage & Authentication** ✅
- [ ] Visit http://localhost:3000
- [ ] See 4 role cards (Driver, Operations, Workshop, Admin)
- [ ] Click each role and test password entry
- [ ] Verify password hints are shown
- [ ] Test "Back" button functionality
- [ ] Verify successful login redirects

### 2. **Admin Dashboard** ✅
**Access**: Admin → `admin123`

#### Overview Tab
- [ ] View 4 key metric cards (all clickable)
- [ ] Click "Total Issues" → Goes to issues page
- [ ] Click "Pending Issues" → Filters to pending
- [ ] Click "Work Orders" → Goes to work orders
- [ ] Click "Fleet Units" → Goes to equipment
- [ ] Test Quick Actions buttons
- [ ] Click each status in "Issues by Status"
- [ ] Click each severity in "Issues by Severity"
- [ ] Click each category in "Issues by Category"
- [ ] Click work order statuses

#### Recent Issues Tab
- [ ] View 10 most recent issues
- [ ] Click any issue card → Goes to detail page
- [ ] Verify badges show correct severity/status
- [ ] Check dates are formatted correctly

#### Analytics Tab
- [ ] View performance metrics (all clickable)
- [ ] Click "Issue Resolution Rate"
- [ ] Click "Critical Issue Ratio"
- [ ] Click "Work Order Completion"
- [ ] Click "Total Fleet Units"
- [ ] Click "Active Drivers"
- [ ] Verify percentages calculate correctly

#### Admin Tools Tab
- [ ] Click "Manage Mappings" → Fleet data page
- [ ] Click "View Equipment" → Equipment overview
- [ ] Click "Manage Users" → User management
- [ ] Test "Export All Data" button

### 3. **Issue Management** ✅
**Access**: Admin → Issues Management

- [ ] View all 15 issues in list
- [ ] Test search functionality (by ticket, fleet, driver, category)
- [ ] Filter by status (Pending, In Progress, Scheduled, Completed)
- [ ] Filter by severity (Critical, High, Medium, Low)
- [ ] Click "Clear Filters" button
- [ ] Click "Export CSV" button
- [ ] Click "View" icon on any issue
- [ ] Click "Edit" icon and modify issue
  - [ ] Change status
  - [ ] Change severity
  - [ ] Update description
  - [ ] Save changes
- [ ] Click "Delete" icon and confirm deletion
- [ ] Verify issue counts update

### 4. **Equipment Overview** ✅
**Access**: Admin → Equipment Overview

#### Stats Cards
- [ ] View total fleet units (47)
- [ ] View total trailers (51)
- [ ] View total drivers (60)
- [ ] View total assets count

#### Fleet Units Tab
- [ ] View all fleet units in card layout
- [ ] Test search (by fleet number, rego, driver, location)
- [ ] Click "Export Fleet Data" button
- [ ] View fleet details (rego, type, driver, phone, location)
- [ ] Check issue count indicators
- [ ] Click "View Issues" on any fleet unit

#### Trailers Tab
- [ ] View all trailers
- [ ] Test search functionality
- [ ] Click "Export Trailer Data"
- [ ] View trailer details
- [ ] Check status badges

#### Drivers Tab
- [ ] View all 60 drivers
- [ ] Test search (by name, phone, employee ID)
- [ ] Click "Export Driver Data"
- [ ] View driver details (phone, employee ID, assigned fleet)
- [ ] Check issue count per driver
- [ ] Click "View Issues" for any driver

### 5. **Work Orders Management** ✅
**Access**: Admin → Work Orders

- [ ] View all 7 work orders
- [ ] Check work order details:
  - [ ] Issue ticket number
  - [ ] Fleet number
  - [ ] Workshop site
  - [ ] Assigned technician
  - [ ] Schedule (start/end times)
  - [ ] Work type
  - [ ] Notes
- [ ] Click "View" icon → Goes to issue detail
- [ ] Click "Delete" icon and confirm
- [ ] Verify status badges

### 6. **User Management** ✅
**Access**: Admin → Users

- [ ] View all 4 users
- [ ] Check user details (name, email, role, phone, created date)
- [ ] Click "Add User" button
  - [ ] Fill in all fields
  - [ ] Select role (Driver, Workshop, Operations, Admin)
  - [ ] Create new user
- [ ] Click "Edit" icon on a user
- [ ] Click "Delete" icon (should prevent deleting yourself)
- [ ] Verify role badges with icons

### 7. **Operations Dashboard** ✅
**Access**: Operations → `SENATIONAL07`

- [ ] View operations-specific dashboard
- [ ] See pending issues
- [ ] Access issue management
- [ ] View fleet status
- [ ] Test export functionality

### 8. **Workshop Dashboard** ✅
**Access**: Workshop → `SENATIONAL04`

- [ ] View workshop Kanban board
- [ ] See work orders
- [ ] Drag and drop cards (if implemented)
- [ ] Update work order status
- [ ] View assigned tasks

### 9. **Driver Portal** ✅
**Access**: Driver (no password required)

- [ ] Access issue reporting form
- [ ] Test auto-fill from fleet data
- [ ] Upload photos (if available)
- [ ] Submit new issue
- [ ] View confirmation page

### 10. **Data Integrity** ✅

- [ ] Verify all 15 issues are visible
- [ ] Check issue statuses:
  - [ ] Pending: ~5 issues
  - [ ] In Progress: ~4 issues
  - [ ] Scheduled: ~3 issues
  - [ ] Completed: ~3 issues
- [ ] Verify severity distribution:
  - [ ] Critical: ~3 issues
  - [ ] High: ~5 issues
  - [ ] Medium: ~5 issues
  - [ ] Low: ~2 issues
- [ ] Check categories include:
  - [ ] Brakes
  - [ ] Engine
  - [ ] Tyres
  - [ ] Electrical
  - [ ] Suspension
  - [ ] Air Conditioning
  - [ ] Steering
  - [ ] Transmission
  - [ ] Lights
  - [ ] Body Damage
  - [ ] Fuel System
  - [ ] Exhaust
  - [ ] Mechanical
  - [ ] Interior
  - [ ] Wipers

### 11. **Comments System** ✅

- [ ] Open any issue with comments
- [ ] View existing comments (8 total across issues)
- [ ] Add new comment
- [ ] Verify comment author and timestamp
- [ ] Check comment formatting

### 12. **Navigation & UX** ✅

- [ ] Test "Back to Admin" buttons
- [ ] Verify breadcrumb navigation (if implemented)
- [ ] Test responsive design (resize browser)
- [ ] Check mobile view
- [ ] Test hover effects on cards
- [ ] Verify loading states
- [ ] Check empty states (filter to show no results)

### 13. **Performance** ✅

- [ ] Page load times < 2 seconds
- [ ] Smooth transitions and animations
- [ ] No console errors
- [ ] Images load properly
- [ ] Search is responsive
- [ ] Filters apply instantly

### 14. **Export Functionality** ✅

- [ ] Export all data (Admin dashboard)
- [ ] Export issues CSV
- [ ] Export fleet data CSV
- [ ] Export trailer data CSV
- [ ] Export driver data CSV
- [ ] Verify CSV file format
- [ ] Check data completeness

## 🐛 Known Test Scenarios

### Edge Cases to Test

1. **Empty Search Results**
   - Search for "ZZZZZ" → Should show "No issues found"

2. **Filter Combinations**
   - Status: Pending + Severity: Critical
   - Should show only critical pending issues

3. **Long Text Handling**
   - Issues with long descriptions should truncate properly

4. **Date Formatting**
   - All dates should be in local format
   - Timestamps should be consistent

5. **Permission Checks**
   - Try accessing admin pages as Operations
   - Should redirect or show access denied

## 📈 Success Metrics

After testing, verify:
- ✅ All 15 issues are accessible
- ✅ All 7 work orders are visible
- ✅ All 47 fleet units display correctly
- ✅ All 60 drivers are listed
- ✅ All 51 trailers are shown
- ✅ Search works across all pages
- ✅ Filters work correctly
- ✅ Export functions generate files
- ✅ No console errors
- ✅ Responsive on mobile

## 🔄 Reset Test Data

To reset and reseed the database:

```bash
npm run db:push
npm run db:seed
```

This will:
1. Clear all existing data
2. Recreate 15 diverse issues
3. Create 7 work orders
4. Add 8 comments
5. Populate 47 fleet units
6. Add 51 trailers
7. Create 60 drivers

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

Features Tested:
- [ ] Authentication
- [ ] Admin Dashboard
- [ ] Issue Management
- [ ] Equipment Overview
- [ ] Work Orders
- [ ] User Management
- [ ] Operations Dashboard
- [ ] Workshop Dashboard
- [ ] Driver Portal

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Rating: ___/10

Notes:
___________
```

## 🎯 Quick Test (5 Minutes)

For a quick smoke test:

1. Login as Admin (`admin123`)
2. Check dashboard shows 15 issues
3. Click "Total Issues" → Verify list loads
4. Go to Equipment → Verify 47 fleet units
5. Go to Work Orders → Verify 7 orders
6. Test one export function
7. Logout and login as Operations
8. Verify different dashboard view

## 🚀 Ready to Test!

All mock data is loaded and ready. Start testing at:
**http://localhost:3000**

Happy testing! 🎉
