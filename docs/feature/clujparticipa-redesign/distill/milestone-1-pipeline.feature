Feature: Pipeline Visualization — Milestone 1
  As a resident who submitted an idea
  I want to see a visual pipeline showing all stages my idea must pass through
  So I can instantly understand where my idea stands and what comes next

  @real-io @US-01
  Scenario: Past stages show timestamps from StatusChange records
    Given an idea exists with status "ELIGIBLE"
    And the idea has status changes:
      | fromStatus  | toStatus      | note              |
      | null        | SUBMITTED    | Idea submitted    |
      | SUBMITTED   | UNDER_REVIEW | Under review      |
      | UNDER_REVIEW| ELIGIBLE     | Marked eligible   |
    When Maria visits the idea detail page
    Then the pipeline shows "SUBMITTED" as filled with the submission date
    And the pipeline shows "UNDER_REVIEW" as filled with the review date
    And the pipeline shows "ELIGIBLE" as the current stage with a pulsing indicator

  @real-io @US-01
  Scenario: Future stages are outlined and gray
    Given an idea exists with status "UNDER_REVIEW"
    When Maria visits the idea detail page
    Then the stages "ELIGIBLE", "IN_VOTING", "SELECTED", "IN_PROGRESS", "COMPLETED" are outlined and gray
    And they show no dates

  @real-io @US-01
  Scenario: Idea with only SUBMITTED status shows single filled stage
    Given an idea exists with status "SUBMITTED"
    And the idea has no status changes beyond the initial submission
    When Maria visits the idea detail page
    Then the pipeline shows "SUBMITTED" as filled with the idea creation date
    And all other stages are outlined and gray

  @real-io @US-01
  Scenario: Pipeline renders vertically on mobile
    Given an idea exists with status "UNDER_REVIEW"
    When Maria visits the idea detail page on a mobile viewport (width < 640px)
    Then the pipeline renders as a vertical layout
    And each stage is stacked from top to bottom

  @real-io @US-02
  Scenario: Stalled idea shows "Waiting for" label with days count
    Given an idea exists with status "UNDER_REVIEW"
    And the last status change was 35 days ago
    When Maria visits the idea detail page
    Then the pipeline shows "UNDER_REVIEW" with a "Waiting for" label
    And the label reads "Waiting for: City department review"
    And the label shows "35 days ago"

  @real-io @US-02
  Scenario: "Waiting for" text derived from current stage name
    Given an idea exists with status "ELIGIBLE"
    And the last status change was 40 days ago
    When Maria visits the idea detail page
    Then the "Waiting for" label reads "Waiting for: Voting period"

  @error @real-io
  Scenario: Status changes API returns 404 for nonexistent idea
    When the client requests "/api/ideas/nonexistent-id/status-changes"
    Then the response status is 404
    And the response contains an error message

  @error @real-io
  Scenario: Pipeline renders with empty status changes array
    Given an idea exists with status "SUBMITTED"
    And the idea has no status change records
    When Maria visits the idea detail page
    Then the pipeline still renders all 7 stages
    And only "SUBMITTED" is filled with the idea creation date

  @error @real-io @driving_port
  Scenario: Vote endpoint returns 403 for IN_PROGRESS idea
    Given an idea exists with status "IN_PROGRESS"
    When the client posts to "/api/ideas/{id}/vote"
    Then the response status is 403

  @error @real-io
  Scenario: Pipeline handles idea not found gracefully
    When Maria visits the idea detail page for a nonexistent idea
    Then a "not found" message is displayed
    And no pipeline component renders

  @error @real-io
  Scenario: Pipeline handles unexpected status value gracefully
    Given an idea exists with an unexpected status value
    When Maria visits the idea detail page
    Then the pipeline renders without crashing
    And the current stage shows the raw status value

  @error @real-io
  Scenario: Reopened idea (REJECTED to UNDER_REVIEW) shows pipeline correctly
    Given an idea was rejected and then reopened
    When Maria visits the idea detail page
    Then the pipeline shows "UNDER_REVIEW" as the current stage
    And the previous rejection is shown in the timeline

  @error @real-io @driving_port
  Scenario: Vote with expired participant token returns appropriate error
    Given an idea exists with status "SUBMITTED"
    When the client posts to "/api/ideas/{id}/vote" with an invalid participant token
    Then the response status is 401

  @error @real-io
  Scenario: Stalled indicator not shown for ideas under 30 days
    Given an idea exists with status "UNDER_REVIEW"
    And the last status change was 15 days ago
    When Maria visits the idea detail page
    Then no "Waiting for" label is shown
    And the pipeline shows the current stage normally

  @error @real-io
  Scenario: Completed idea shows all stages filled with no stalled indicator
    Given an idea exists with status "COMPLETED"
    And the last status change was 60 days ago
    When Maria visits the idea detail page
    Then all 7 forward stages are filled with timestamps
    And no "Waiting for" label is shown

  @error @real-io
  Scenario: Vote endpoint returns 429 when rate limit exceeded
    Given an idea exists with status "SUBMITTED"
    And the rate limit for votes has been exceeded
    When the client posts to "/api/ideas/{id}/vote"
    Then the response status is 429
    And the response includes a retry-after indicator
