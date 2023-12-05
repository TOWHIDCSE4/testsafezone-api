import mongoose, { ObjectId, Schema } from 'mongoose';
import { DAYS, hhmmRegex } from './constants';

interface DayLimit {
  limitFrom?: string;
  limitTo?: string;
}
export const defaultRestrictedTimeRule = {
  enabled: true,
  limit: {
    monday: [{ limitFrom: '00:00', limitTo: '06:00' }],
    tuesday: [{ limitFrom: '00:00', limitTo: '06:00' }],
    wednesday: [{ limitFrom: '00:00', limitTo: '06:00' }],
    thursday: [{ limitFrom: '00:00', limitTo: '06:00' }],
    friday: [{ limitFrom: '00:00', limitTo: '06:00' }],
    saturday: [{ limitFrom: '00:00', limitTo: '06:00' }],
    sunday: [{ limitFrom: '00:00', limitTo: '06:00' }],
  },
  triggers: {
    timesup: {
      alertMe: true,
      lockDevice: true,
      lockNavigation: true,
    },
  },
  internet_pause_start_time: null,
  internet_pause_time_limit: null,
} as const;

export interface RestrictedTimeRule {
  childId: ObjectId;
  enabled: boolean;
  limit: {
    monday: DayLimit[] | null;
    wednesday: DayLimit[] | null;
    tuesday: DayLimit[] | null;
    thursday: DayLimit[] | null;
    friday: DayLimit[] | null;
    saturday: DayLimit[] | null;
    sunday: DayLimit[] | null;
  };
  triggers: {
    timesup: {
      lockNavigation: boolean;
      lockDevice: boolean;
      alertMe: boolean;
    };
  };
  internet_pause_start_time?: number;
  internet_pause_time_limit?: number;
}

export const RestrictedTimeRuleModel: mongoose.Model<RestrictedTimeRule> =
  mongoose.models.RestrictedTimeRule ||
  mongoose.model<RestrictedTimeRule>(
    'RestrictedTimeRule',
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

                  if (ruleObj[day] === null) return;

                  const limitDataArr = ruleObj[day];

                  if (!Array.isArray(limitDataArr)) {
                    isValidObj = false;
                    return;
                  }

                  limitDataArr.forEach((limitData) => {
                    if (
                      typeof limitData.limitFrom !== 'string' ||
                      typeof limitData.limitTo !== 'string'
                    ) {
                      isValidObj = false;
                      return;
                    }

                    // Invalid date range
                    if (
                      !hhmmRegex.test(String(limitData.limitFrom)) ||
                      !hhmmRegex.test(String(limitData.limitTo))
                    ) {
                      isValidObj = false;
                    }
                  });
                });
                return isValidObj;
              }
            },
            message: (props) => `${props.value} is not a valid rule.`,
          },
        },
        triggers: Object,
        internet_pause_start_time: Number,
        internet_pause_time_limit: Number,
      },
      {
        timestamps: true,
        collection: 'restricted_time_rules',
      }
    )
  );
