import dayjs from 'dayjs';
import { SchemaTypeOptions } from 'mongoose';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const dateValidator = (): {
  validate: SchemaTypeOptions<unknown>['validate'];
} => {
  return {
    validate: {
      validator(v: any) {
        return dayjs(v).isValid();
      },
      message: (props) => `${props.value} is not a valid date.`,
    },
  };
};

/**
 * True if provided object ID valid
 */
export const isObjectIdValid = (id: any) => {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};
