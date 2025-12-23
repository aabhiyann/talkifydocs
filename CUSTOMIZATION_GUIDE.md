# Customization Guide - Removing Fake Content

This guide explains how to customize or remove placeholder content from your TalkifyDocs application.

## Overview

All placeholder/fake content (like "San Francisco", fake phone numbers, team members, etc.) has been moved to a centralized configuration file: `src/config/company.ts`

## Quick Start

1. **Open** `src/config/company.ts`
2. **Update** the values with your personal information, or set them to `null`/`false` to hide sections
3. **Save** and your changes will be reflected across the entire app

## Configuration Options

### Contact Information

```typescript
contact: {
  email: "your-email@example.com", // or null to hide
  phone: "+1 (555) 123-4567", // or null to hide
  address: {
    street: "123 Your Street", // or null to hide
    city: "Your City",
    state: "ST",
    zip: "12345",
    country: "Your Country",
  },
  businessHours: {
    enabled: false, // Set to true to show business hours
    // ... customize hours
  },
}
```

### Social Media Links

Set to `null` to hide social media icons:

```typescript
social: {
  twitter: "https://twitter.com/yourhandle", // or null
  linkedin: "https://linkedin.com/in/yourprofile", // or null
  github: "https://github.com/yourusername", // or null
}
```

### Footer Message

```typescript
footer: {
  showLocation: false, // Set to true to show location
  location: "Your City", // e.g., "San Francisco" or null
}
```

### About Page

```typescript
about: {
  showTeam: false, // Set to true to show team section
  team: [], // Add your team members here
}

stats: {
  documentsProcessed: null, // e.g., "10K+" or null to hide
  activeUsers: null,
  uptime: null,
  support: null,
}
```

## Examples

### Example 1: Personal Deployment (Minimal Info)

```typescript
contact: {
  email: "your-email@gmail.com",
  phone: null, // Hide phone
  address: {
    street: null, // Hide address
    // ...
  },
}

social: {
  twitter: null, // Hide all social links
  linkedin: null,
  github: "https://github.com/yourusername", // Only show GitHub
}

footer: {
  showLocation: false, // Don't show location
}
```

### Example 2: Full Customization

```typescript
contact: {
  email: "support@yourdomain.com",
  phone: "+1 (555) 123-4567",
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
  },
  businessHours: {
    enabled: true,
    // ...
  },
}

social: {
  twitter: "https://twitter.com/yourcompany",
  linkedin: "https://linkedin.com/company/yourcompany",
  github: "https://github.com/yourcompany",
}

footer: {
  showLocation: true,
  location: "New York",
}
```

## What Gets Hidden When Set to Null/False

- **Email**: Footer contact info and contact page email method
- **Phone**: Footer contact info and contact page phone method
- **Address**: Contact page address card
- **Social Links**: Footer social media icons
- **Location**: Footer "Made in [Location]" text
- **Team**: About page team section
- **Stats**: About page statistics section
- **Business Hours**: Contact page business hours card

## Files Updated

The following files now use the configuration:

- `src/components/Footer.tsx` - Footer contact info and social links
- `src/app/contact/page.tsx` - Contact methods and office information
- `src/app/about/page.tsx` - Team section and statistics

All changes are backward compatible - if you don't update the config, sections will be hidden by default (since most values are set to `null` or `false`).

