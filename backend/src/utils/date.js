/**
 * Centralized Indian Standard Time (IST - Asia/Kolkata) Date Helpers
 */

/**
 * Returns formatted Indian date & time string
 * Example output: "19/11/2026, 12:35:00 pm"
 */
export const formatToIST = (date = new Date(), options = {}) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options,
  });
};

/**
 * Returns current Date adjusted to Indian Standard Time offset
 */
export const getISTDate = () => {
  const now = new Date();
  // IST is UTC + 5:30 = 330 minutes
  const istOffset = 330 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
};

/**
 * Formats date into readable Indian display format
 * Example: "19 Nov 2026, 05:45 PM"
 */
export const formatDisplayIST = (date = new Date()) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};
