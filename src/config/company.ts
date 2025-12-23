/**
 * Company and Contact Information Configuration
 *
 * Update these values with your personal information or set to null/empty to hide sections.
 * For deployment, you can either:
 * 1. Add your personal contact info
 * 2. Leave fields empty/null to hide them
 * 3. Use generic placeholders
 */

export const companyConfig = {
  // Contact Information
  contact: {
    email: "aabhiyansainju@gmail.com" as string | null, // personal contact email
    phone: null as string | null, // keep phone hidden
    address: {
      street: null as string | null, // keep street hidden
      city: "Washington, DC" as string | null,
      state: null as string | null,
      zip: null as string | null,
      country: "United States" as string | null,
    },
    // Display format: "City, State" or just "City" if no state
    get location() {
      if (!this.address.city) return null;
      if (this.address.state) {
        return `${this.address.city}, ${this.address.state}`;
      }
      return this.address.city;
    },
    businessHours: {
      enabled: false, // Set to true to show business hours
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM EST",
      saturday: "Saturday: 10:00 AM - 4:00 PM EST",
      sunday: "Sunday: Closed",
    },
  },

  // Social Media Links (set to null to hide)
  social: {
    twitter: null as string | null,
    linkedin: "https://www.linkedin.com/in/abhiyansainju/" as string | null,
    github: "https://github.com/aabhiyann" as string | null,
  },

  // Footer "Made with ❤️" message
  footer: {
    showLocation: true, // Show location in footer
    location: "Washington, DC" as string | null,
    // Alternative: Generic message without location
    genericMessage: "Made with ❤️", // Will show this if showLocation is false
  },

  // About Page Team Section
  about: {
    showTeam: false, // Set to true to show team section
    team: [] as Array<{
      name: string;
      role: string;
      bio: string;
    }>,
  },

  // About Page Stats (set to null to hide)
  stats: {
    documentsProcessed: null as string | null, // e.g., "10K+" or null
    activeUsers: null as string | null, // e.g., "5K+" or null
    uptime: null as string | null, // e.g., "99.9%" or null
    support: null as string | null, // e.g., "24/7" or null
  },
};
