import mongoose, { ObjectId, Schema } from 'mongoose';
import { DAYS, hhmmRegex } from './constants';

type TimeLimit = string;

export const defaultDailyTimeLimitRule = {
  enabled: true,
  limit: {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  },
  triggers: {
    timesup: {
      alertMe: true,
      lockDevice: true,
      lockNavigation: true,
    },
  },
} as const;

export interface DailyTimeLimitRule {
  childId: ObjectId;
  enabled: boolean;
  limit: {
    monday: TimeLimit | null;
    wednesday: TimeLimit | null;
    tuesday: TimeLimit | null;
    thursday: TimeLimit | null;
    friday: TimeLimit | null;
    saturday: TimeLimit | null;
    sunday: TimeLimit | null;
  };
  triggers: {
    timesup: {
      lockNavigation: boolean;
      lockDevice: boolean;
      alertMe: boolean;
    };
  };
}

export const DailyTimeLimitRuleModel: mongoose.Model<DailyTimeLimitRule> =
  mongoose.models.DailyTimeLimitRule ||
  mongoose.model<DailyTimeLimitRule>(
    'DailyTimeLimitRule',
    new Schema(
      {
        childId: {
          type: Schema.Types.ObjectId,
          ref: 'Child',
          required: true,
          unique: true,
          index: true,
        },
        enabled: Boolean,
        limit: {
          type: Object,
          validate: {
            validator(ruleObj: any) {
              if (ruleObj && typeof ruleObj === 'object') {
                let isValidObj = true;

                Object.keys(ruleObj).forEach((day) => {
                  if (!DAYS.includes(day)) {
                    isValidObj = false;
                    return;
                  }

                  if (ruleObj[day] === null || String(ruleObj[day]) === '24:00')
                    return;

                  console.log(ruleObj[day]);

                  const limitData = ruleObj[day];
                  // Invalid hh:mm
                  if (!hhmmRegex.test(String(limitData))) {
                    isValidObj = false;
                  }
                });
                return isValidObj;
              }
            },
            message: (props) => `${props.value} is not a valid rule.`,
          },
        },
        triggers: Object,
      },
      {
        timestamps: true,
        collection: 'daily_time_limit_rules',
      }
    )
  );
