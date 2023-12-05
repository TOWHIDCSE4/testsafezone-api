process.env.DEBUG = 'mongo-seeding';
import { Seeder } from 'mongo-seeding';
import path from 'path';

const config = {
  database: {
    host: '127.0.0.1',
    port: 6868,
    name: 'SafeZone',
  },
};

const seeder = new Seeder(config);

const collections = seeder.readCollectionsFromPath(path.resolve('./data'), {
  extensions: ['js', 'json', 'ts'],
  transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
});

console.log(collections);

seeder.import(collections, {
  dropCollections: true,
  removeAllDocuments: false,
  mongoClientOptions: {},
});
