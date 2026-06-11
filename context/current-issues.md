8. Verify tables
   docker exec -it carbon-compass-db psql -U carbon -d carbon_compass -c "\dt"

Expected:

ActivityLog
Budget
Challenge
Conversation
ConversationMessage
EmissionFactor
Profile
User
\_prisma_migrations
