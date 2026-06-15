import { logger } from './logger';

/**
 * Mock function to simulate sending a weekly summary email.
 */
export async function sendWeeklySummaryEmail(email: string, totalCo2e: number): Promise<void> {
  logger.info(`[Email Dispatcher] Sending Weekly Summary to ${email}:`, {
    subject: 'Your Weekly Carbon Compass Summary',
    weeklyTotalCo2e: `${totalCo2e.toFixed(2)} kg CO2e`,
    message: `Greetings! You have logged a total of ${totalCo2e.toFixed(1)} kg CO2e emissions over the past 7 days. Keep up the tracking habits!`,
  });
}

/**
 * Mock function to simulate sending a budget warning reminder email.
 */
export async function sendBudgetReminderEmail(
  email: string,
  limit: number,
  current: number,
): Promise<void> {
  const percent = limit > 0 ? (current / limit) * 100 : 0;
  logger.info(`[Email Dispatcher] Sending Budget Reminder Warning to ${email}:`, {
    subject: 'Warning: Approaching Monthly Carbon Budget Limit',
    budgetLimit: `${limit.toFixed(0)} kg CO2e`,
    currentConsumption: `${current.toFixed(1)} kg CO2e`,
    consumptionPercentage: `${percent.toFixed(0)}%`,
    message: `Warning! You have consumed ${percent.toFixed(0)}% of your monthly carbon budget. Please check your dashboard settings to adjust targets.`,
  });
}

/**
 * Mock function to simulate sending a challenge completion reminder email.
 */
export async function sendChallengeReminderEmail(
  email: string,
  challengeTitle: string,
): Promise<void> {
  logger.info(`[Email Dispatcher] Sending Challenge Progress Nudge to ${email}:`, {
    subject: `Keep going with your "${challengeTitle}" challenge!`,
    message: `Hello! Just a friendly reminder to log your daily activities to complete your active "${challengeTitle}" challenge. You are making great progress!`,
  });
}
