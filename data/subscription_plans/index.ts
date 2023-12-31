import { SubscriptionPlanModel } from '@/models/Subscription';

export = [
  new SubscriptionPlanModel({
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    name: 'Free',
    code: 'FR22',
    limitedFeatures: [],
    totalDevices: 3,
    totalUseDays: 7,
    yearlyPrice: 0,
    monthlyPrice: 0,
    isFree: true,
    isFeatured: false,
    level: 1,
  }).toJSON(),
  new SubscriptionPlanModel({
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    name: 'Standard',
    code: 'SD22',
    totalUseDays: 365,
    limitedFeatures: [],
    totalDevices: 5,
    yearlyPrice: 200000,
    monthlyPrice: 20000,
    isFree: false,
    isFeatured: true,
    level: 2,
  }).toJSON(),
  new SubscriptionPlanModel({
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    name: 'Premium',
    code: 'PR22',
    totalUseDays: 365,
    limitedFeatures: [],
    totalDevices: 10,
    yearlyPrice: 500000,
    monthlyPrice: 50000,
    isFree: false,
    isFeatured: false,
    level: 3,
  }).toJSON(),
];
