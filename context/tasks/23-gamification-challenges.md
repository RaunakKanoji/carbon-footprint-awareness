# Add Gamification: Challenges and Achievements

## Goal

Increase user engagement and motivation by introducing gamification elements, such as challenges and achievements. Users can opt into specific challenges that encourage sustainable actions and earn badges or points for completing them.

## Implementation

1. **Extend the `Challenge` Model:** Ensure the `Challenge` model from Task 08 includes fields for `title`, `description`, `targetCo2e`, `completed`, `createdAt`, and `completedAt`. Consider adding a `points` field to reward users upon completion.

2. **Define Challenge Types:** Create a set of predefined challenges. Examples:
   - **Car-Free Week:** Avoid driving for a week.
   - **Veggie Challenge:** Eat plant‑based meals for 3 days in a week.
   - **Energy Saver:** Reduce AC usage by 10 hours this month.
   - **Zero Waste Day:** Generate no landfill waste for one day.

   Each challenge should specify a measurable goal (target CO₂e reduction or activity count) and a reward (badge or points).

3. **Challenge API Endpoints:** Add API routes (`/app/api/challenge/route.ts`) to:
   - **GET:** Return available challenges and the user’s current challenges.
   - **POST:** Allow users to accept a challenge. Create a new `Challenge` record associated with the user.
   - **PATCH:** Update a challenge when completed (set `completed` and `completedAt`).

4. **Challenges UI:**
   - In the dashboard or a dedicated page (`/challenges`), list available challenges with a short description and a “Join” button.
   - Display a user’s current challenges and progress towards completion. Use progress bars or checklists to show how close they are to meeting targets.
   - When a challenge is completed, trigger a celebration animation and award a badge. Add the badge to a “Achievements” section in the user profile.

5. **Track Challenge Progress:** On each activity submission (Task 16), check if it contributes to any active challenges. For example, logging a vegetarian meal might count towards the Veggie Challenge. Update the user’s challenge progress accordingly via server logic.

6. **Reward System (Optional):** Implement a points system or virtual badges. Display total points on the profile page. Consider future integration with leaderboards or community features.

## Check When Done

- The `Challenge` model supports multiple challenges per user with status tracking.
- Users can browse available challenges, join them, and view their progress.
- The system automatically tracks activities toward challenges and marks them as complete when goals are achieved.
- Badges or points are awarded upon completion and displayed on the profile page.
- Gamification rules and challenge definitions are documented in `project-overview.md` and `architecture-context.md`.
