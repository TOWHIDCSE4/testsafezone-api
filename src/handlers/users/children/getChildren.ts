import { ChildModel } from '@/models/Child';
import { createAuthorizedHandler, error, init, success } from '@/modules/core';
import { checkIfCorrectParent } from './utils';

export const getChildren = createAuthorizedHandler(async (e) => {
  try {
    const { requestParentId } = checkIfCorrectParent(e);

    await init();

    const children = await ChildModel.find({
      parentId: requestParentId,
    });

    return success({
      result: children,
    });
  } catch (e) {
    return error(e);
  }
});
