import sequelize from '../models/index.js';
// Import all models so they are registered before sync
import '../models/User.js';
import '../models/Post.js';
import '../models/Comment.js';
import '../models/Story.js';
import '../models/Like.js';
import '../models/Relationship.js';
import '../models/Notification.js';
import '../models/Group.js';
import '../models/GroupMember.js';
import '../models/GroupMessage.js';
import '../models/Event.js';
import '../models/EventRsvp.js';
import '../models/Message.js';

(async () => {
  try {
    console.log('[sync] Starting Sequelize sync (alter=true)…');
    await sequelize.sync({ alter: true });
    const conf = sequelize.config;
    console.log(`[sync] Done syncing to ${conf.host}:${conf.port} db=${conf.database}`);
    process.exit(0);
  } catch (e) {
    console.error('[sync] Failed:', e.message);
    process.exit(1);
  }
})();
