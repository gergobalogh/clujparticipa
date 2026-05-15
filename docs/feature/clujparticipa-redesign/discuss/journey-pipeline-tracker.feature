Feature: Pipeline Tracker — Submit and Track an Idea
  As Maria (an engaged resident)
  I want to submit an idea and see its progress through a visual pipeline
  So I can decide whether engaging with the city is worth my time

  Background:
    Given the platform is running at clujparticipa.ro
    And Maria has not created an account

  # Happy Path: Submit and Track

  Scenario: Maria submits an idea and sees the pipeline
    When Maria visits the homepage
    Then she sees a district map as the hero element
    And she sees idea cards with mini-pipeline indicators
    When Maria taps the map at a location near her home
    Then a submission form opens with the location pre-filled
    When Maria fills in "Broken sidewalk near school" as the title
    And selects "Infrastructure" as the category
    And clicks "Submit"
    Then she is redirected to the idea detail page
    And she sees a visual pipeline with stages:
      | SUBMITTED | UNDER_REVIEW | FEASIBLE | IN_VOTING | SELECTED | IN_PROGRESS | COMPLETED |
    And the "SUBMITTED" stage is filled with today's date
    And the remaining stages are outlined and gray

  Scenario: Maria checks back and sees her idea has progressed
    Given Maria previously submitted idea "Broken sidewalk near school"
    And the idea status has changed to "UNDER_REVIEW"
    When Maria visits the idea detail page
    Then the pipeline shows "SUBMITTED" as filled with the original date
    And the pipeline shows "UNDER_REVIEW" as filled with the change date
    And "UNDER_REVIEW" has a pulsing indicator as the current stage
    And future stages remain outlined and gray

  Scenario: Maria receives a notification when her idea moves
    Given Maria has opted in to browser notifications
    And her idea "Broken sidewalk near school" moves to "FEASIBLE"
    When the status change is recorded
    Then Maria receives a browser notification containing:
      | "Your idea 'Broken sidewalk near school' moved to Feasible" |
    When Maria taps the notification
    Then she is taken to the idea detail page showing the updated pipeline

  # Error Paths

  Scenario: Pipeline stalled — idea hasn't moved in 30 days
    Given Maria submitted idea "Broken sidewalk near school" 35 days ago
    And the idea is still in "UNDER_REVIEW"
    When Maria visits the idea detail page
    Then the pipeline shows "UNDER_REVIEW" with a "Waiting for: City department review" label
    And the last action date "35 days ago" is visible

  Scenario: Idea rejected with reason
    Given Maria submitted idea "Add ferris wheel to central park"
    And the idea was reviewed and rejected with reason "Outside city jurisdiction"
    When Maria visits the idea detail page
    Then the pipeline shows a red "Rejected" marker at the rejection point
    And the reason "Outside city jurisdiction" is displayed below the pipeline
    And a CTA "Support a similar idea" or "Revise and resubmit" is visible

  Scenario: Idea merged with another idea
    Given Maria submitted idea "Fix crosswalk on Dorobantilor"
    And a similar idea "Crosswalk needed on Dorobantilor" already exists
    And an admin merged Maria's idea into the existing one
    When Maria visits her idea detail page
    Then the pipeline shows a "Merged" marker
    And a link to the parent idea "Crosswalk needed on Dorobantilor" is visible
    And the text "Your idea was combined with [parent idea title]" appears

  # Discovery Path: Ion the Curious Newcomer

  Scenario: Ion discovers the platform and finds completed ideas
    When Ion visits the homepage
    Then he sees "12 ideas completed, 47 in progress" in the stats section
    And completed idea cards show green-filled pipelines
    When Ion filters by his district "Gheorgheni"
    Then only Gheorgheni ideas are shown
    When Ion taps a completed idea
    Then he sees the full pipeline with all stages filled
    And a "Completed: [date]" label is visible
    When Ion switches language to Hungarian
    Then all visible text changes to Hungarian
