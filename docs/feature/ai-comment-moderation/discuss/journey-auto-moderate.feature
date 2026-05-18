Feature: Auto-moderate comments via OpenAI Moderation API

  Background:
    Given an idea exists with id "idea-1"
    And a resident is authenticated

  Scenario: Clean comment is posted and appears immediately
    When the resident posts a comment "I think this crosswalk is essential for school children"
    And the OpenAI Moderation API returns all categories clean
    Then the comment is saved with status "VISIBLE"
    And the comment appears in the idea's comment list
    And no ModerationEvent is created for screening

  Scenario: Toxic comment is flagged and held for review
    When the resident posts a comment containing hate speech
    And the OpenAI Moderation API flags the "hate" category
    Then the comment is saved with status "FLAGGED"
    And the response includes a message "Your comment is under review"
    And the comment does NOT appear in the public comment list
    And a ModerationEvent is created with action "AUTO_FLAG" and the flagged categories

  Scenario: OpenAI API fails during comment creation
    When the resident posts a comment "Any comment text"
    And the OpenAI Moderation API call times out
    Then the comment is saved with status "VISIBLE"
    And the comment appears in the public comment list
    And a warning is logged for admin follow-up

  Scenario: Admin approves a flagged comment
    Given a comment exists with status "FLAGGED" and flagged categories ["harassment"]
    When the admin approves the comment
    Then the comment status changes to "VISIBLE"
    And the comment appears in the public comment list
    And a ModerationEvent is created with action "APPROVE" and reason "admin review"

  Scenario: Admin hides a flagged comment
    Given a comment exists with status "FLAGGED" and flagged categories ["hate"]
    When the admin hides the comment with reason "Violates community standards"
    Then the comment status changes to "HIDDEN"
    And a ModerationEvent is created with action "HIDE" and reason "Violates community standards"

  Scenario: Comment in Romanian is screened correctly
    When the resident posts a comment in Romanian "Aceasta este o idee foarte bună pentru cartierul nostru"
    And the OpenAI Moderation API returns all categories clean
    Then the comment is saved with status "VISIBLE"

  Scenario: Comment in Hungarian is screened correctly
    When the resident posts a comment in Hungarian "Ez egy nagyon jó ötlet a környékünk számára"
    And the OpenAI Moderation API returns all categories clean
    Then the comment is saved with status "VISIBLE"
