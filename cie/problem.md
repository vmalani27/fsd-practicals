A Technology company is organizing a live online product launch event and needs an interactive Product Feedback Dashboard. This dashboard will be accessed by attendees to submit real-time opinions about the newly unveiled product features. The system must allow each participant to enter their first name and surname, which will be used to display a customized greeting. The interface must show the current local date and time, continuously updated every second using React state and hooks (not plain JavaScript DOM manipulation). The dashboard must provide four feedback categories: Excellent, Good, Average, and Poor. Each category should have a button that, when clicked, increases the feedback count and instantly reflects the new totals. A separate counter should track how many feedbacks the individual participant has submitted, with controls to increment, decrement, reset, and increment by five. To simulate engagement from other users, the system must include an automated mechanism that randomly increments one of the feedback categories every 2 seconds, mimicking live crowd responses.
1. Personalized Greeting:
 Input fields to capture participant’s first name and surname.
 Display a customized welcome message, such as: ➤ Welcome, Priyanka Padhiyar!
2. Live Date and Time:
 Render the current local time and date.
 Update the clock every second using React concepts (e.g., useEffect, useState).
3. Feedback Submission Panel:
 Four buttons: Excellent, Good, Average, Poor.
 Each button click increases the respective feedback count.
 Display dynamic and real-time feedback totals under each category.
4. Simulated Crowd Feedback:
 Automatically and randomly increment one feedback category every 2 seconds to simulate responses from other users.
5. Participant Feedback Counter:
 Show how many feedbacks the participant has submitted personally.
 Include buttons for: Increment, Decrement, Reset, and Increment by 5.
 Reflect the count change immediately upon button clicks.
