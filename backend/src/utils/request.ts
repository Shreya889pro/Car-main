type ExpressRequest = {
  headers: Record<string, string | undefined>;
  ip?: string;
  ips?: string[];
  socket?: { remoteAddress?: string };
  connection?: { remoteAddress?: string };
  get(name: string): string | undefined;
};

export const getClientIP = (req: ExpressRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
};

export const getUserAgent = (req: ExpressRequest): string => {
  return req.get('user-agent') || 'unknown';
};
