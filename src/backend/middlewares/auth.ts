import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from '../models/User';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      jwtPayload?: IJwtPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies the JWT token from the request and attaches the user to the request object
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get JWT token from header or body
    const token = req.headers.authorization?.split(' ')[1] || req.body.accessToken;

    if (!token) {
      res.status(401).json({ message: 'Authentication required. No JWT token provided.' });
      return;
    }

    // Verify JWT token and get user
    const user = await User.getByJwtToken(token);
    if (!user) {
      res.status(401).json({ message: 'Invalid JWT token. Authentication failed.' });
      return;
    }

    // Get JWT payload
    const payload = User.verifyJwtToken(token);
    if (!payload) {
      res.status(401).json({ message: 'Invalid JWT token. Authentication failed.' });
      return;
    }

    // Attach user and JWT payload to request object (without password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    req.jwtPayload = payload;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Authorization middleware for trip owner
 * Checks if the authenticated user is the owner of the trip
 */
export const isOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.jwtPayload) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      res.status(400).json({ message: 'Invalid trip ID format' });
      return;
    }

    // Import Trip model dynamically to avoid circular dependencies
    const Trip = (await import('../models/Trip')).default;

    const trip = await Trip.getById(tripId);
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    // Get user ID from JWT payload
    const userId = req.jwtPayload.userId;

    if (trip.USER_ID !== userId) {
      res.status(403).json({ message: 'Access denied. You are not the owner of this trip.' });
      return;
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ message: 'Server error during authorization' });
  }
};
