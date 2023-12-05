import { UserGroupModel } from '../../src/models/User/Group/index';

export = [
  new UserGroupModel({
    name: 'DEFAULT',
    description: 'Default user group',
    roles: [],
    isDefault: true,
    isAdmin: false,
  }).toJSON(),
  new UserGroupModel({
    name: 'ADMIN',
    description: 'Administrator user group',
    roles: ['administrator'],
    isDefault: false,
    isAdmin: true,
  }).toJSON(),
];
