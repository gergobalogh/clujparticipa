Feature: Share an idea with personal network
  As a resident who supports an idea
  I want to share it via WhatsApp, Facebook, or copy link
  So my network can see a compelling preview and support it too

  Background:
    Given an idea exists with id "idea-1" and title "New bike lane on Dorobantilor"
    And the idea has category "TRANSPORT" and district "MANASTUR"
    And the idea has 42 supporters
    And the idea has 1 image uploaded

  # Happy path — WhatsApp share
  Scenario: Share via WhatsApp
    When I am on the idea detail page for "idea-1"
    And I tap the WhatsApp share button
    Then the browser opens WhatsApp Web with a pre-filled message
    And the message contains the idea title "New bike lane on Dorobantilor"
    And the message contains the category "TRANSPORT" and district "MANASTUR"
    And the message contains the idea URL with utm_source=whatsapp

  # Happy path — Facebook share
  Scenario: Share via Facebook
    When I am on the idea detail page for "idea-1"
    And I tap the Facebook share button
    Then the browser opens the Facebook sharer dialog
    And the sharer URL contains the idea URL with utm_source=facebook

  # Happy path — Copy link
  Scenario: Copy link to clipboard
    When I am on the idea detail page for "idea-1"
    And I tap the copy-link button
    Then the idea URL is copied to my clipboard
    And a toast notification appears confirming "Link copied"
    And the copied URL contains utm_source=copy

  # OG meta tags
  Scenario: OG meta tags render for idea with image
    When a social media crawler fetches the idea detail page for "idea-1"
    Then the page contains og:title "New bike lane on Dorobantilor"
    And the page contains og:description matching the idea description truncated to 160 characters
    And the page contains og:image pointing to the idea's first uploaded image
    And the page contains og:url with the canonical idea URL
    And the page contains og:type "website"

  Scenario: OG meta tags render for idea without image
    Given an idea exists with id "idea-2" and title "Park benches in Gheorgheni"
    And the idea has category "INFRASTRUCTURE" and district "GHEORGHENI"
    And the idea has 0 images
    When a social media crawler fetches the idea detail page for "idea-2"
    Then the page contains og:image pointing to a generated placeholder image
    And the placeholder image has the category color for "INFRASTRUCTURE"
    And the placeholder image contains the idea title "Park benches in Gheorgheni"

  # Error paths
  Scenario: WhatsApp not installed — fallback to copy
    When I am on the idea detail page for "idea-1"
    And I tap the WhatsApp share button
    And the WhatsApp intent URL fails to open
    Then the idea URL is copied to my clipboard as a fallback
    And a toast notification appears confirming "Link copied"

  Scenario: Share buttons visible on mobile
    When I view the idea detail page on a mobile viewport
    Then share buttons are visible below the vote section
    And each share button has an accessible label in the current locale
