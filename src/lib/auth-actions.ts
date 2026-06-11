'use server';

import { getCurrentUser } from './auth';

export async function fetchCurrentUser() {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
