# Journey: Visitor Lands on Editorial Homepage — editorial-redesign

**Persona**: First-time visitor (curious citizen, no account)
**Job served**: J2 (Scanner) + J1 (Explorer) + J3 (Trust-Seeker)
**Entry**: Direct link or search result → `/` (locale homepage)

## Mental Model
- "This is a civic platform where I can see what ideas people have for my city"
- "I expect to see a map because the project name includes 'Cluj'"
- "I should be able to browse ideas without creating an account"
- Vocabulary: ideas, votes (support), neighborhoods, status (În Analiză, Implementare)

## Happy Path

| Step | Action | Output | Emotion |
|------|--------|--------|---------|
| 1 | Land on homepage | See split layout: sidebar with idea feed on left, live map on right. Editorial typography, paper background. | Curious → Impressed (trust signal) |
| 2 | Notice LIVE badge | See pulsing "LIVE" badge next to "Ultimele Idei" heading | Engaged — "this is active" |
| 3 | Scan idea feed | Read 3-5 latest ideas in sidebar — title, neighborhood, status, support count | Oriented — "I can see what's happening" |
| 4 | Notice animated map pins | See colored pins pulsing on map, each tied to a neighborhood | Connected — "that's my area" |
| 5 | Hover over a pin | Tooltip shows location name | Confident — the map is interactive |
| 6 | Click an idea in sidebar | Navigate to idea detail page | Decisive — "I want to learn more" |
| 7 | Return to homepage, see CTA | "Trimite Ideea Ta" button at sidebar bottom | Empowered — "I could contribute too" |

## Emotional Arc
```
Entry → Curious
LIVE badge → Engaged (+2)
Idea feed → Oriented (+1)
Map pins → Connected (+1)
Idea click → Decisive (+1)
CTA → Empowered (+1)

Overall: ↑ upward trajectory from curious to empowered
```

## Shared Artifacts

| Artifact | Source | Consumed by |
|----------|--------|-------------|
| `${ideas[]}` | `/api/ideas?limit=5` | Sidebar idea feed, map pins |
| `${stats.totalIdeas}` | `/api/stats` | Map overlay stat |
| `${stats.recentIdeas}` | `/api/stats` | Sidebar feed |
| `${votingConfig}` | `/api/voting-config` | LIVE badge visibility |
| `${neighborhoodCoords}` | Idea `district` + geocoding | Map pin positions |

## Error Paths

| Step | Failure | Recovery |
|------|---------|----------|
| 1 | Stats API fails | Show layout with no LIVE badge, sidebar shows ideas-only |
| 3 | Ideas API returns empty | Show "No ideas yet — be the first!" empty state in sidebar, CTA moves up |
| 5 | Map fails to load (Leaflet error) | Show static SVG map placeholder (like cp-example's mock map background) |

## Gherkin Scenarios

```gherkin
Feature: Editorial Homepage

  Scenario: Visitor sees split layout with live content
    Given the homepage loads with at least 3 ideas
    When the visitor views the page
    Then the sidebar shows the idea feed on the left
    And the map takes the remaining space on the right
    And the "LIVE" badge is visible next to the idea feed heading

  Scenario: Visitor scans ideas in sidebar
    Given the homepage loads with ideas from different neighborhoods
    When the visitor reads the idea feed
    Then each idea shows its neighborhood name, status, and support count
    And ideas are ordered by most recent

  Scenario: Map pins animate for active ideas
    Given ideas exist with geographic data
    When the map renders
    Then each idea's location shows a colored pin
    And the pin has a pulse animation
    And hovering a pin shows the location name in a tooltip

  Scenario: Empty state when no ideas exist
    Given no ideas exist in the database
    When the visitor views the homepage
    Then the sidebar shows an empty-state message
    And the "LIVE" badge is hidden

  Scenario: Mobile stacks sidebar above map
    Given the visitor's screen width is below 768px
    When the homepage renders
    Then the idea feed stacks above the map
    And the map takes full width
```
