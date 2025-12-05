This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# App initialization steps
- provision upstash redis and qstash tokens
- provision a neon database
- run database migration
- seed quiz questions
- add initial admin user

## Admin features

- pause quiz submissions
- update quiz questions (edit question, edit answer or enable/disable question)
- view list of users that are verified (they should have assigned questions)
   - see which questions are assigned
- view list of users that are verified (but no assigned questions)
   - trigger question assignment
- view list of users that finished the quiz
   - check user score (check their answers to questions)
   - reset user score (they need to solve the quiz again)
   - reset user score and assign new questions
- view list of "dead-letter-queue" users that attempted verification
   - number must be visible immediately on the dash
   - attempt to verify can be re-triggered on an individual basis
