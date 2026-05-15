Feature: Map-First Homepage Entry — Milestone 5
  As a resident visiting the platform
  I want the map to be the first thing I see
  So I can quickly find ideas in my neighborhood

  @real-io @US-06
  Scenario: Map is homepage hero element
    When Ion visits the homepage
    Then the map component is the first interactive element below the header
    And the map is above the fold and full-width

  @real-io @US-06
  Scenario: Tapping the map opens submission form with coordinates
    Given Ion is on the homepage with the map visible
    When Ion taps a point on the map near Manastur district
    Then the idea submission form opens
    And the latitude and longitude fields are pre-filled with the tapped coordinates

  @real-io @US-06
  Scenario: Map is visible and interactive on mobile
    When Ion visits the homepage on a mobile device
    Then the map fills the screen width
    And the map is interactive and tappable

  @real-io @US-06
  Scenario: Existing map functionality preserved
    Given ideas exist with map pins in various districts
    When Ion visits the homepage
    Then idea pins are visible on the map
    And clustering functionality works for zoomed-out views
    And clicking a pin opens the idea popup

  @error @real-io @US-06
  Scenario: Map loads when location services are unavailable
    Given the browser location service is unavailable
    When Ion visits the homepage
    Then the map still renders centered on Cluj-Napoca default coordinates
    And the district filter is available for manual selection
