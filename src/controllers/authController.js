const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { ROLE, BUSINESS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');
const ErrorHandler = require('../utils/errorHandler');
const ResponseFormatter = require('../utils/responseFormatter');

class AuthController {
  /**
   * Generate JWT token for user
   */
  generateToken(user) {
    return jwt.sign(
      { id_user: user.id_user, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: BUSINESS.JWT_EXPIRES_IN }
    );
  }

  /**
   * Format user response
   */
  formatUserResponse(user) {
    return {
      id_user: user.id_user,
      email: user.email,
      role: user.role
    };
  }

  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const { email, password, role = ROLE.INVESTOR } = req.body;

      // Validate input
      if (!email || !password) {
        return ErrorHandler.validationError(
          res,
          'Email dan password harus diisi'
        );
      }

      // Validate role
      if (!Object.values(ROLE).includes(role)) {
        return ErrorHandler.validationError(
          res,
          'Role harus investor atau admin'
        );
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return ErrorHandler.validationError(
          res,
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, BUSINESS.BCRYPT_SALT_ROUNDS);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role
        }
      });

      // Generate JWT token
      const token = this.generateToken(newUser);

      return ResponseFormatter.created(res, {
        user: this.formatUserResponse(newUser),
        token
      }, SUCCESS_MESSAGES.REGISTER_SUCCESS);

    } catch (error) {
      return ErrorHandler.handleError(res, error);
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return ErrorHandler.validationError(
          res,
          'Email dan password harus diisi'
        );
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return ErrorHandler.validationError(
          res,
          ERROR_MESSAGES.INVALID_CREDENTIALS
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return ErrorHandler.validationError(
          res,
          ERROR_MESSAGES.INVALID_CREDENTIALS
        );
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return ResponseFormatter.success(res, {
        user: this.formatUserResponse(user),
        token
      }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

    } catch (error) {
      return ErrorHandler.handleError(res, error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id_user;

      const user = await prisma.user.findUnique({
        where: { id_user: userId },
        select: {
          id_user: true,
          email: true,
          role: true
        }
      });

      if (!user) {
        return ErrorHandler.notFoundError(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return ResponseFormatter.success(res, {
        user: this.formatUserResponse(user)
      });

    } catch (error) {
      return ErrorHandler.handleError(res, error);
    }
  }
}

module.exports = new AuthController();
