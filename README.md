# Cal.com Clone - Frontend

Modern, responsive frontend for the Cal.com clone scheduling platform. Built with Next.js 16, React 19, and Tailwind CSS.

## 🌐 Live Demo

**Production URL**: [https://cal-frontend-five.vercel.app/](https://cal-frontend-five.vercel.app/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Pages and Routes](#pages-and-routes)
- [Components](#components)
- [API Integration](#api-integration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Styling and Design](#styling-and-design)

## ✨ Features

- **Event Types Management**: Create, edit, and delete event types with custom durations and URLs
- **Availability Settings**: Configure weekly availability with time slots for each day
- **Public Booking Page**: Beautiful calendar-based booking interface
- **Bookings Dashboard**: View and manage upcoming and past bookings
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop
- **Modern UI**: Clean, Cal.com-inspired design with Tailwind CSS
- **Date Overrides**: Block specific dates or set custom hours
- **Timezone Support**: Handle different timezones for availability

## 🛠 Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Date Handling**: date-fns 4.1.0, react-day-picker 9.13.0
- **UI Utilities**: class-variance-authority, clsx, tailwind-merge

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## 🚀 Setup Instructions

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the frontend root directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**For Production**: Set `NEXT_PUBLIC_API_URL` to your backend API URL.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` | Yes |

**Important**: 
- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- Update this to your production backend URL when deploying

## 📁 Project Structure

```
frontend/
├── app/                              # Next.js App Router pages
│   ├── availability/
│   │   ├── [id]/
│   │   │   └── page.js              # Edit availability page
│   │   └── page.js                  # Availability list page
│   ├── book/
│   │   └── [slug]/
│   │       ├── confirmation/
│   │       │   └── page.js          # Booking confirmation page
│   │       ├── form/
│   │       │   └── page.js          # Booking form page
│   │       └── page.js              # Public booking page
│   ├── bookings/
│   │   ├── [id]/
│   │   │   └── page.js              # Booking details page
│   │   └── page.js                  # Bookings dashboard
│   ├── event-types/
│   │   ├── [id]/
│   │   │   └── page.js              # Edit event type page
│   │   └── page.js                  # Event types list (home)
│   ├── globals.css                  # Global styles
│   ├── layout.js                    # Root layout
│   └── page.js                      # Home page (redirects to event-types)
├── components/                       # React components
│   ├── availability/
│   │   ├── AvailabilityDayRow.js    # Day row in availability schedule
│   │   ├── AvailabilityHeader.js   # Availability page header
│   │   ├── AvailabilitySchedule.js  # Main availability schedule component
│   │   ├── AvailabilitySidebar.js   # Availability sidebar
│   │   └── DateOverrides.js         # Date overrides component
│   ├── ui/                          # Reusable UI components
│   │   ├── calendar.js              # Calendar component
│   │   ├── DayToggle.js             # Day toggle switch
│   │   ├── FilterTabs.js           # Filter tabs component
│   │   ├── TimeRangeInput.js       # Time range input
│   │   ├── TimeSelect.js            # Time select dropdown
│   │   ├── TimeSlotPicker.js       # Time slot picker
│   │   └── TimezoneSelector.js     # Timezone selector
│   ├── BookingCard.js               # Booking card component
│   ├── BookingForm.js               # Booking form component
│   ├── CalendarShowcase.js          # Calendar showcase
│   ├── CreateEventTypeModal.js      # Create event type modal
│   ├── EventCard.js                 # Event type card
│   ├── EventTypeRow.js              # Event type row
│   ├── EventTypesList.js            # Event types list component
│   └── Sidebar.js                   # Main sidebar navigation
├── constants/
│   └── availability.js              # Availability constants
├── lib/
│   ├── api/                         # API client functions
│   │   ├── availability.js          # Availability API calls
│   │   ├── bookings.js              # Bookings API calls
│   │   ├── eventTypes.js            # Event types API calls
│   │   └── index.js                 # API exports
│   └── utils/                       # Utility functions
│       ├── availability.js          # Availability utilities
│       ├── bookings.js              # Booking utilities
│       ├── timeSlots.js             # Time slot utilities
│       └── utils.js                 # General utilities
├── public/                          # Static assets
├── next.config.mjs                  # Next.js configuration
├── package.json
└── README.md                        # This file
```

## 📄 Pages and Routes

### Public Routes

- `/` - Home page (redirects to `/event-types`)
- `/book/[slug]` - Public booking page for event type
- `/book/[slug]/form` - Booking form page
- `/book/[slug]/confirmation` - Booking confirmation page

### Admin Routes

- `/event-types` - Event types dashboard
- `/event-types/[id]` - Edit event type
- `/availability` - Availability schedules list
- `/availability/[id]` - Edit availability schedule
- `/bookings` - Bookings dashboard
- `/bookings/[id]` - Booking details

## 🧩 Components

### Core Components

#### `Sidebar.js`
Main navigation sidebar with links to all admin pages.

#### `EventTypesList.js`
Displays all event types in a grid/list view with create, edit, and delete actions.

#### `CreateEventTypeModal.js`
Modal form for creating new event types.

#### `AvailabilitySchedule.js`
Main component for managing availability with day rows and time slots.

#### `BookingForm.js`
Form component for collecting booking information (name, email, notes).

#### `CalendarShowcase.js`
Calendar component for date selection in booking flow.

### UI Components

Located in `components/ui/`, these are reusable components:
- `calendar.js` - Calendar date picker
- `TimeSlotPicker.js` - Time slot selection
- `TimeRangeInput.js` - Time range input
- `TimezoneSelector.js` - Timezone selection dropdown
- `DayToggle.js` - Day of week toggle
- `FilterTabs.js` - Tab-based filtering

## 🔌 API Integration

The frontend communicates with the backend API through functions in `lib/api/`.

### API Client Functions

#### Event Types (`lib/api/eventTypes.js`)
- `fetchEventTypes()` - Get all event types
- `fetchEventTypeById(id)` - Get event type by ID
- `fetchEventTypeBySlug(slug)` - Get event type by URL slug
- `createEventType(data)` - Create new event type
- `updateEventType(id, data)` - Update event type
- `deleteEventType(id)` - Delete event type

#### Availability (`lib/api/availability.js`)
- `fetchAvailability()` - Get all availability schedules
- `fetchAvailabilityById(id)` - Get availability by ID
- `createAvailability(data)` - Create new availability
- `updateAvailability(id, data)` - Update availability
- `deleteAvailability(id)` - Delete availability

#### Bookings (`lib/api/bookings.js`)
- `fetchBookings(params)` - Get bookings with filters
- `fetchBookingById(id)` - Get booking by ID
- `fetchAvailableSlots(eventTypeId, date)` - Get available time slots
- `createBooking(data)` - Create new booking
- `updateBooking(id, data)` - Update booking
- `cancelBooking(id)` - Cancel booking

### API Base URL

The API base URL is configured via `NEXT_PUBLIC_API_URL` environment variable and used in all API functions.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Starts the development server on `http://localhost:3000` with hot reload.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`

3. **Deploy**
   - Push to main branch (auto-deploys)
   - Or manually deploy from Vercel dashboard

### Netlify

1. **Connect Repository**
   - Import your GitHub repository to Netlify

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` in Site settings → Environment variables

4. **Deploy**

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Railway
- Render
- Heroku
- AWS Amplify
- DigitalOcean App Platform

**Build Command**: `npm run build`  
**Start Command**: `npm start`

## 🎨 Styling and Design

### Tailwind CSS

The project uses Tailwind CSS 4 for styling. Configuration is handled automatically by Next.js.

### Design System

The UI closely follows Cal.com's design patterns:
- Clean, minimal interface
- Consistent spacing and typography
- Modern color scheme
- Smooth transitions and animations
- Responsive breakpoints

### Custom Components

Reusable UI components are built with:
- `class-variance-authority` for component variants
- `clsx` and `tailwind-merge` for conditional classes
- Lucide React for icons

### Event Types Management

- Create event types with custom names, descriptions, and durations
- Generate unique URL slugs for public booking pages
- Link event types to availability schedules
- Edit and delete existing event types

### Availability Settings

- Set available days of the week (Monday - Sunday)
- Configure time slots for each day
- Set timezone for availability
- Create multiple availability schedules
- Date overrides for specific dates

### Public Booking Flow

1. **Select Date**: Calendar view to choose a date
2. **Select Time**: Available time slots based on availability
3. **Fill Form**: Enter name, email, and optional notes
4. **Confirm**: Booking confirmation page with details

### Bookings Dashboard

- View all bookings (upcoming and past)
- Filter by status (confirmed, cancelled)
- View booking details
- Cancel bookings

## 🐛 Troubleshooting

### API Connection Issues

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_API_URL` is set correctly
2. **CORS Errors**: Verify backend CORS configuration includes your frontend URL
3. **Network Errors**: Check if backend server is running and accessible

### Build Issues

1. **Clear Cache**: Delete `.next` folder and rebuild
2. **Node Version**: Ensure Node.js v18+ is installed
3. **Dependencies**: Run `npm install` to ensure all packages are installed

### Styling Issues

1. **Tailwind Not Working**: Restart dev server after adding new Tailwind classes
2. **Missing Styles**: Check `globals.css` for Tailwind directives

---

**Note**: Make sure to set the `NEXT_PUBLIC_API_URL` environment variable to your backend API URL before deploying.
