# Debt Tracker Prioritized Tasks

1. **Milestone Detection & Progress Tracking System**
   - Automate milestone creation as users make payments.
   - Display payoff projections to show estimated completion dates.
2. **Enhanced Payment Recording**
   - Improve the payment logging flow to capture partial and extra payments accurately.
   - Support editing or reversing erroneous entries.
3. **Intelligent Payment Recommendation Engine**
   - Suggest optimal payment amounts and timing based on user data and chosen strategy (avalanche, snowball, etc.).
4. **Database Schema Updates for Milestones & Recommendations**
   - Add necessary tables/fields to store milestone history and recommended payment plans.
5. **UI Enhancements – DebtWizard & DebtEditDialog**
   - Implement a guided wizard for adding new debts and editing existing ones.
   - Provide contextual tips and streamlined forms for better usability.
6. **Visual Progress Components**
   - Build DebtProgressCard, OverallProgressDashboard, MilestoneTimeline, and PayoffProjectionChart to clearly display repayment progress.
7. **Performance Testing – Load & Query Optimization**
   - Run load tests on debt calculation routines and database queries.
   - Identify and optimize any bottlenecks under heavy use.
8. **Memory Tests for Complex Strategies**
   - Verify that large datasets or advanced repayment strategies don’t cause excessive memory consumption.
9. **Lighthouse Audits**
   - Regularly assess performance, accessibility, and SEO scores to maintain a fast, user-friendly interface.
10. **Server/Client Component Separation & tRPC Middleware**
   - Ensure server components handle heavy logic, client components remain lightweight, and tRPC middleware efficiently manages API requests.
