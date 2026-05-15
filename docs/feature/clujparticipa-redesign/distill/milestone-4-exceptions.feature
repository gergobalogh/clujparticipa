Feature: Exception States and Recovery CTAs — Milestone 4
  As a resident whose idea was rejected, merged, or returned
  I want to see why it happened and what I can do next
  So I do not feel like my participation was wasted

  @real-io @US-05
  Scenario: REJECTED idea shows red marker and reason and recovery CTAs
    Given an idea exists with status "REJECTED"
    And the rejection reason is "Outside city jurisdiction"
    When Maria visits the idea detail page
    Then the pipeline shows a red marker at the rejection stage
    And the reason "Outside city jurisdiction" is displayed below the pipeline
    And a "Support a similar idea" CTA is visible
    And a "Revise and resubmit" CTA is visible

  @real-io @US-05
  Scenario: "Support a similar idea" CTA links to filtered ideas list
    Given an idea exists with status "REJECTED" and category "INFRASTRUCTURE"
    When Maria clicks the "Support a similar idea" CTA
    Then she is taken to the ideas list filtered by the same category

  @real-io @US-05
  Scenario: "Revise and resubmit" CTA links to pre-filled submission form
    Given an idea exists with status "REJECTED"
    When Maria clicks the "Revise and resubmit" CTA
    Then she is taken to the submission form
    And the form is pre-filled with the original idea data

  @real-io @US-05
  Scenario: Merged idea shows merge point and parent idea link
    Given an idea exists with status "REJECTED"
    And the most recent status change note contains "merged with idea XYZ"
    And a parent idea titled "Crosswalk needed on Dorobantilor" exists
    When Maria visits her idea detail page
    Then the pipeline detects the "merged" pattern from the status change note
    And the pipeline shows a "Merged" indicator instead of the default red rejection marker
    And a link to the parent idea "Crosswalk needed on Dorobantilor" is visible
    And the text reads "Your idea was combined with [parent idea title]"

  @real-io @US-05
  Scenario: Returned idea shows revision prompt with admin feedback
    Given an idea exists with status "REJECTED"
    And the most recent status change note contains "returned for revision: Please add more specific location details"
    When Maria visits the idea detail page
    Then the pipeline detects the "returned" pattern from the status change note
    And the pipeline shows a return indicator instead of the default red rejection marker
    And the admin feedback note "Please add more specific location details" is visible
    And a "Revise and resubmit" CTA is visible

  @error @real-io @US-05
  Scenario: Merged idea with missing parent idea link
    Given an idea has a merge note referencing a deleted parent idea
    When Maria visits the idea detail page
    Then the "Merged" indicator is still shown
    And the parent idea link is displayed but marked as unavailable

  @error @real-io @US-05
  Scenario: Rejection without a reason note
    Given an idea exists with status "REJECTED"
    And no rejection reason was provided in the status change note
    When Maria visits the idea detail page
    Then the red marker is still shown
    And a generic "Contact us for details" message appears instead of a reason

  @error @real-io @US-05
  Scenario: Recovery CTA with no similar ideas in same category
    Given an idea exists with status "REJECTED" and category "CULTURE"
    And no other ideas exist in the "CULTURE" category
    When Maria visits the idea detail page
    Then the "Revise and resubmit" CTA is still visible
    And the "Support a similar idea" CTA is hidden or shows a "No similar ideas found" message
