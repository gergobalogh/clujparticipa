Feature: Status Change Timeline — Milestone 3
  As a resident tracking my idea
  I want to see the full history of status changes with who made each change and why
  So I can trust that the process is transparent and not arbitrary

  @real-io @US-04
  Scenario: Timeline is collapsed by default on idea detail page
    Given an idea exists with status "ELIGIBLE"
    And the idea has 3 status change records
    When Maria visits the idea detail page
    Then the timeline section is collapsed
    And a "View full history" label is visible

  @real-io @US-04
  Scenario: Maria expands the timeline by clicking "View full history"
    Given an idea exists with status "ELIGIBLE"
    And the idea has 3 status change records
    And the timeline section is collapsed
    When Maria clicks "View full history"
    Then the timeline expands showing all status changes

  @real-io @US-04
  Scenario: Timeline entry shows date, from-to status, actor role, note
    Given an idea exists with status "ELIGIBLE"
    And the idea has a status change:
      | fromStatus  | toStatus      | changedBy       | note            |
      | UNDER_REVIEW| ELIGIBLE      | admin@cluj.ro   | Marked eligible |
    When Maria expands the timeline
    Then each entry shows the date of the status change
    And each entry shows the from-status and to-status
    And each entry shows the actor role derived from the changer
    And each entry shows the note text

  @real-io @US-04
  Scenario: Timeline shows "No updates yet" for single-status ideas
    Given an idea exists with status "SUBMITTED"
    And the idea has no status changes beyond the initial submission
    When Maria expands the timeline
    Then the timeline shows "No updates yet" instead of an empty timeline

  @real-io @US-04
  Scenario: Actor role derived from changedBy field
    Given an idea exists with a status change made by "admin@cluj.ro"
    When Maria expands the timeline
    Then the actor is displayed as "Admin"
    Given an idea exists with a status change made by "system"
    When Maria expands the timeline
    Then the actor is displayed as "System"

  @error @real-io
  Scenario: Timeline handles unknown actor gracefully
    Given an idea exists with a status change made by "unknown-user@example.com"
    When Maria expands the timeline
    Then the actor is displayed as "Department" or a generic label

  @error @real-io
  Scenario: Timeline with many status changes remains performant
    Given an idea exists with 20 status change records
    When Maria expands the timeline
    Then the timeline renders within a reasonable time
    And all entries are displayed correctly
