import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal } from '../monitoring/metrics';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const route = req.route?.path || req.path;

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration / 1000);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
};