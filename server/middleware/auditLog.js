import prisma from '../db.js';

export const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Log after successful response
      if (res.statusCode < 400) {
        prisma.auditLog.create({
          data: {
            userId: req.user?.id || null,
            action,
            resource,
            resourceId: req.params?.id || data?.id?.toString() || null,
            details: JSON.stringify({ method: req.method, path: req.originalUrl }),
            ipAddress: req.ip || req.connection?.remoteAddress || null
          }
        }).catch(err => console.error('Audit log error:', err));
      }
      return originalJson(data);
    };
    
    next();
  };
};
