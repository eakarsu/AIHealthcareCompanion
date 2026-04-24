const colors = {
  GET: '\x1b[32m',
  POST: '\x1b[33m',
  PUT: '\x1b[34m',
  DELETE: '\x1b[31m',
  PATCH: '\x1b[35m',
  reset: '\x1b[0m'
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = colors[req.method] || colors.reset;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    
    console.log(
      `${color}${req.method}${colors.reset} ${req.originalUrl} ${statusColor}${res.statusCode}${colors.reset} - ${duration}ms [${timestamp}]`
    );
  });
  
  next();
};
