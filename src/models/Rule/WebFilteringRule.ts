import mongoose, { ObjectId, Schema } from 'mongoose';
import zveloCategories from '@/assets/web-categories.json';

const actions = ['ALLOW', 'BLOCK'] as const;
type ActionType = (typeof actions)[number];

/**
 * 2 - Tội phạm/Hacking
 * 4 - Chất kích thích/Ma túy
 * 8 - Người lớn
 * 9 - Khiêu dâm
 * 10 - Bạo lực
 * 11 - Vũ khí
 * 16 - Rượu bia
 * 19 - Thuốc lá
 * 20 - Cờ bạc
 *
 */
const defaultBlockedCategories = [2, 4, 5, 6, 7, 8, 9, 10, 11, 16, 19, 20];

const defaultCategoryRules = zveloCategories.map((category) => {
  const action = defaultBlockedCategories.includes(category.ID)
    ? 'BLOCK'
    : 'ALLOW';
  return {
    action,
    categoryId: category.ID,
  } as const;
});

// Domain rule
export interface DomainRule {
  name: string;
  action: ActionType;
}

export interface WebCategoryRule {
  categoryId: number;
  action: ActionType; // 0 = BLOCK; 1 = ALLOW
}

const domainRuleSchema = new Schema({
  name: String,
  action: {
    type: String,
    enum: {
      values: actions,
      message: 'Action {VALUE} is not supported',
    },
  },
});

const webCategoryRuleSchema = new Schema<WebCategoryRule>(
  {
    categoryId: {
      type: Number,
      required: true,
      ref: 'WebCategory',
    },
    action: {
      type: String,
      required: true,
      enum: {
        values: actions,
        message: 'Action {VALUE} is not supported',
      },
    },
  },
  {
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.id;
        delete ret._id;
      },
    },
  }
);

export interface WebFilteringRule {
  childId: ObjectId;
  enabled: boolean;
  categoryRules: WebCategoryRule[];
  domainRules: DomainRule[];
  triggers: {
    timesup: {
      lockNavigation: boolean;
      lockDevice: boolean;
      alertMe: boolean;
    };
  };
}

export const WebFilteringRuleModel: mongoose.Model<WebFilteringRule> =
  mongoose.models.WebFilteringRule ||
  mongoose.model<WebFilteringRule>(
    'WebFilteringRule',
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
        categoryRules: {
          type: [webCategoryRuleSchema],
          default: defaultCategoryRules,
        },
        domainRules: {
          type: [domainRuleSchema],
          default: [],
        },
        triggers: Object,
      },
      {
        timestamps: true,
        collection: 'web_filtering_rules',
      }
    )
  );
