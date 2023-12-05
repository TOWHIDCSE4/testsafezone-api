import mongoose from 'mongoose';
// import { isObjectIdValid } from './validators';

export function initMongoDb() {
  // Change _id to id and remove __v from docs
  mongoose.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, converted) => {
      converted.id = converted._id;
      delete converted._id;
      delete converted.__v;
    },
  });

  if (process.env.IS_OFFLINE || process.env.DEBUG_MODE === 'on') {
    mongoose.set('debug', true);
  }

  if (process.env.IS_OFFLINE) {
    return mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'SafeZone',
      autoIndex: true,
    });
  } else {
    return mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'SafeZone',
    });
  }
}

function initAWS() {}

/**
 * Init the application before executing code.
 * This includes:
 * - Wait for MongoDB connection
 * - Init AWS config
 * - ...
 *
 */
export const init = async () => {
  initAWS();
  await initMongoDb();
};
