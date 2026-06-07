export const throttlers = {
  default: { limit: Number(process.env.AI_RATE_LIMIT_RPM) || 20, ttl: 60000 },
};
