Feature: Notification Opt-In — Milestone 6
  As a resident who submitted an idea
  I want to be notified when my idea's status changes
  So I do not have to keep checking back manually

  @real-io @US-08
  Scenario: Notification opt-in prompt after first idea submission
    Given Maria is on the idea submission form
    When Maria submits her first idea
    Then a notification opt-in prompt appears
    And the prompt explains that she will be notified of status changes

  @real-io @US-08
  Scenario: Notification fires on status change with idea details
    Given Maria has opted in to notifications
    And Maria's idea "Broken sidewalk near school" moves to "UNDER_REVIEW"
    Then a notification appears on her device containing the idea title and new stage name
    And the notification reads "Your idea 'Broken sidewalk near school' moved to Under Review"

  @real-io @US-08
  Scenario: Tapping notification navigates to idea detail page
    Given Maria has received a notification about her idea
    When Maria taps the notification
    Then she is taken to the idea detail page showing the updated pipeline

  @error @real-io @US-08
  Scenario: Notification permission denied shows in-app fallback
    Given Maria denied notification permission
    And Maria's idea status has changed since her last visit
    When Maria visits the platform
    Then an in-app indicator shows that her idea status has changed

  @error @real-io @US-08
  Scenario: Notification fails to fire when API is unavailable
    Given Maria has opted in to notifications
    And the notification service is temporarily unavailable
    When Maria's idea status changes
    Then no error is shown to Maria
    And the status change is still reflected on the idea detail page

  @error @real-io @US-08
  Scenario: Multiple status changes between visits show latest only
    Given Maria's idea has changed status 3 times since her last visit
    And Maria denied notification permission
    When Maria visits the platform
    Then the in-app indicator shows the most recent status change
    And the full history is available in the timeline
