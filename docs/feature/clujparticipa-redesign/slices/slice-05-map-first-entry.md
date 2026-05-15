# Slice 05: Map-First Entry Point

**Goal**: Promote the map to homepage hero position and enable tap-to-submit with pre-filled location.

## IN scope
- Map component as homepage hero (above fold, full-width)
- Tap on map → opens submission form with latitude/longitude pre-filled
- District auto-filter from map viewport or manual filter
- Existing map component (HomeMapPreview) promoted, not replaced

## OUT scope
- Pipeline component (Slice 1)
- Homepage pipeline integration (Slice 2)
- Notifications (Slice 6)

## Learning hypothesis
Disproves "map as homepage hero doesn't increase district engagement" if district-filtered page views don't increase 20% vs current. Confirms Zero-Friction Reporter insight: map-first reduces submission friction.

## Acceptance criteria
- Map is the first interactive element below the header on the homepage
- Tapping a point on the map opens the idea submission form with coordinates pre-filled
- District filter works from map viewport (zoom level determines district)
- Mobile: map is full-width, tappable, not hidden behind "lg:block"
- Existing map functionality preserved (clustering, popups)

## Dependencies
- Existing HomeMapPreview and MapPickerLoader components
- Existing `/ideas/new` submission page

## Effort estimate
5 hours

## Reference class
Similar to Waze's map-first report flow and FixMyStreet's location picker.
