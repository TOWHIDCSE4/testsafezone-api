import { ChildModel } from '@/models/Child/Child';
import { createAuthorizedHandler, error, init, success } from '@/modules/core';

export const updateEducationInfo = createAuthorizedHandler(async (e) => {
  try {
    await init();

    const childId = e.pathParameters.childId;
    if (childId) {
      const childExist = Boolean(await ChildModel.findById(childId));

      if (!childExist) {
        return error(`childrenId ${childId} doesn't exist.`);
      }
    }

    const data = JSON.parse(e.body);

    // Remove some fields from the JSON data to prevent editing.
    const {
      real_name,
      date_of_birth,
      grade,
      school,
      address,
      support_subject,
    } = data;

    const dataUpdate: any = {
      real_name,
      date_of_birth,
      grade,
      school,
      address,
      support_subject,
    };
    await ChildModel.findOneAndUpdate(
      {
        _id: childId,
      },
      dataUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    return success('ok');
  } catch (e) {
    return error(e);
  }
});
