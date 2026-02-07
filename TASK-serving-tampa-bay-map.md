# Task: Serving Tampa Bay Map

## Overview
Add an interactive service area map showing the Tampa Bay region that VP Associates serves.

## Requirements
1. Create a visually appealing map component showing the Tampa Bay service area
2. Include markers or highlighted areas for the cities served
3. Make it accessible with proper ARIA labels
4. Ensure responsive design for mobile and desktop

## Implementation Details
- Use Leaflet.js for the interactive map (lightweight, no API key needed)
- Show the greater Tampa Bay area with markers for:
  - Tampa (main office)
  - St. Petersburg
  - Clearwater
  - Brandon
  - Lakeland
  - Sarasota
  - Bradenton
  - Pasco County areas
- Add a highlighted region showing the service area coverage

## File to Create
- `/components/ServiceAreaMap.vue` - New component for the Tampa Bay service area map

## Integration
- Replace or enhance the existing map section on `/pages/contact.vue`
- Keep the existing OpenStreetMap embed for office location
- Add the new service area map in a new section

## Success Criteria
1. Map loads without errors
2. All service area locations are marked
3. Map is responsive on mobile devices
4. Keyboard navigation works for map controls
5. Proper ARIA labels for screen readers
