Feature: Homepage Pipeline Integration — Milestone 2
  As a first-time visitor
  I want to immediately understand that this platform tracks idea progress
  So I can decide in under 30 seconds whether it is worth my time

  @real-io @US-03
  Scenario: Mini-pipeline on idea list cards
    Given multiple ideas exist with various statuses
    When Ion visits the homepage
    Then each idea card shows a compact 3-stage indicator
    And the indicator shows "submitted" as the start, the current stage in the middle, and the end stage

  @real-io @US-03
  Scenario: Homepage hero references pipeline concept
    When Ion visits the homepage
    Then the hero section contains text referencing the pipeline concept
    And the hero text is displayed in the current locale language

  @real-io @US-07
  Scenario: Stats section shows COMPLETED idea count
    Given 3 ideas exist with status "COMPLETED"
    When Ion visits the homepage
    Then the stats section shows the count of completed ideas prominently

  @real-io @US-03
  Scenario: Language switcher is visible on the homepage
    When Ion visits the homepage
    Then the language switcher is visible in the header

  @real-io @US-03
  Scenario: Switching language changes all visible text
    Given Ion is on the homepage with the language switcher visible
    When Ion switches the language to Hungarian
    Then all visible text changes to Hungarian

  @error @real-io
  Scenario: District filter on homepage returns zero ideas
    Given no ideas exist in the "BORHANCI" district
    When Ion filters the homepage by district "BORHANCI"
    Then a "be the first" call-to-action is visible
    And stats from other districts are shown as social proof

  @error @real-io
  Scenario: Homepage handles no ideas at all gracefully
    Given no ideas exist in any district
    When Ion visits the homepage
    Then a welcoming message encourages the first submission
    And the map renders with no pins

  @error @real-io
  Scenario: Stats section shows zero completed ideas correctly
    Given no ideas exist with status "COMPLETED"
    When Ion visits the homepage
    Then the stats section shows zero for completed ideas
    And the trust signals section does not show misleading completed idea content
