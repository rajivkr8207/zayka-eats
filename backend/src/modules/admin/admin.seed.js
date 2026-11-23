import User from '../user/user.model.js';
import { ROLES } from '../../constants/roles.js';
import logger from '../../config/logger.js';

/**
 * Bootstrap a single initial super admin if none exists in database.
 * This runs once during server boot.
 */
export const seedInitialAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    if (existingAdmin) {
      logger.info(`Admin account verified: ${existingAdmin.email} (${existingAdmin.username})`);
      return;
    }

    const admin = await User.create({
      fullName: 'Super Admin',
      username: 'admin',
      email: 'admin@zaykaeats.com',
      password: 'Admin@123456',
      mobile: '9999999999',
      role: ROLES.ADMIN,
      isVerified: true,
      isActive: true,
    });

    logger.info(`[Bootstrap] Default Super Admin created successfully: ${admin.email} (Username: admin, Password: Admin@Zayka123)`);
  } catch (error) {
    logger.error('[Bootstrap] Failed to seed initial admin account:', { error: error.message });
  }
};

export default seedInitialAdmin;
