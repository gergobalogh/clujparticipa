Feature: Integration Checkpoints
  Cross-slice integration scenarios that verify components work together

  @real-io @adapter-integration
  Scenario: Pipeline component reuses stage logic from transitions.ts
    Given the pipeline component renders stages
    Then the stage order matches ALL_STATUSES from transitions.ts
    And the stage order is: SUBMITTED, UNDER_REVIEW, ELIGIBLE, IN_VOTING, SELECTED, IN_PROGRESS, COMPLETED

  @real-io @adapter-integration
  Scenario: Mini-pipeline reuses Pipeline component stage logic
    Given the mini-pipeline component renders on an idea card
    Then it derives the 3-stage indicator from the same pipeline stage logic
    And the start stage is "SUBMITTED", the end stage is "COMPLETED", and the middle stage is the current status

  @real-io @adapter-integration
  Scenario: Timeline consumes same StatusChange data as pipeline
    Given an idea with status changes exists
    When Maria views the pipeline and expands the timeline
    Then both the pipeline and timeline show consistent data
    And the timeline entries match the stage timestamps on the pipeline

  @real-io @adapter-integration
  Scenario: Exception state pipeline markers consistent with transitions.ts
    Given an idea with status "REJECTED"
    When the pipeline renders the rejection marker
    Then the marker appears at the stage where REJECTED transition occurred
    And the stage is derived from the StatusChange fromStatus field

  @error @real-io @adapter-integration
  Scenario: Pipeline and timeline handle concurrent status changes
    Given two status changes for the same idea occur nearly simultaneously
    When Maria visits the idea detail page
    Then the pipeline shows the most recent status as current
    And the timeline shows both status changes in chronological order
