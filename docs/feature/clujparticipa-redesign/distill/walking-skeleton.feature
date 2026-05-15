Feature: Pipeline Walking Skeleton
  As Maria (an engaged resident)
  I want to see a visual pipeline on my idea's detail page
  So I can instantly understand where my idea stands

  @walking_skeleton @real-io @US-01
  Scenario: Pipeline renders all stages on idea detail page
    Given an idea exists with status "UNDER_REVIEW"
    And the idea has a status change from "SUBMITTED" to "UNDER_REVIEW"
    When Maria visits the idea detail page via "/ideas/{id}"
    Then the pipeline renders 7 forward stages:
      | SUBMITTED | UNDER_REVIEW | ELIGIBLE | IN_VOTING | SELECTED | IN_PROGRESS | COMPLETED |
    And the "SUBMITTED" stage is filled with the status change date
    And the "UNDER_REVIEW" stage is filled with the current stage indicator
    And the remaining stages are outlined and gray

  @walking_skeleton @real-io @driving_port
  Scenario: Status changes API returns data for valid idea
    Given an idea exists with status "UNDER_REVIEW"
    And the idea has a status change from "SUBMITTED" to "UNDER_REVIEW"
    When the client requests "/api/ideas/{id}/status-changes"
    Then the response status is 200
    And the response contains an array of status changes
    And each status change has "fromStatus", "toStatus", "changedBy", "createdAt", and "note" fields

  @walking_skeleton @real-io @driving_port
  Scenario: Idea detail page renders via driving port
    Given an idea exists with status "SUBMITTED"
    When Maria visits the idea detail page via "/ideas/{id}"
    Then the idea title is visible
    And the idea status badge shows "SUBMITTED"
    And the pipeline component is present on the page

  @error @walking_skeleton @real-io
  Scenario: Status changes API returns malformed data
    Given an idea exists with status "SUBMITTED"
    And the status changes response contains a record with missing required fields
    When the client requests "/api/ideas/{id}/status-changes"
    Then the pipeline renders without crashing
    And incomplete records are gracefully skipped
