import GenerationTemplateAIActions from '@/actions/GenerationTemplateAI';
import { ChildModel } from '@/models/Child';
import {
  checkExpiredSubscription,
  createAuthorizedHandler,
  error,
  init,
  success,
} from '@/modules/core';
import { checkIfCorrectParent } from '../utils';

export const mapQuizAiToChildren = createAuthorizedHandler(async (e) => {
  try {
    if (await checkExpiredSubscription(e)) {
      return error('Gói của bạn đã hết hạn. Vui lòng mua thêm để tiếp tục');
    }

    checkIfCorrectParent(e);

    await init();
    const { subject } = e.queryStringParameters || {};
    const childId = e.pathParameters.childId;
    const childExist: any = await ChildModel.findById(childId);

    if (!childExist) {
      return error({
        message: `ChildId ${childId} doesn't exist.`,
      });
    }

    if (!childExist?.date_of_birth) {
      return error({
        message: `ChildId ${childExist.fullname} chưa có thông tin ngày sinh.`,
      });
    }

    const dateChild = new Date(childExist?.date_of_birth).getFullYear();
    const ageChild = new Date().getFullYear() - dateChild;
    const filter: any = {
      age: ageChild,
      subject: subject ?? null,
      page_size: 3,
    };
    const dataTemplate = await GenerationTemplateAIActions.findAllWithResult(
      filter,
      { rank: 1, 'result.createAt': -1 }
    );
    return success({
      code: '10000',
      result: dataTemplate,
      message: 'Success',
    });
  } catch (e) {
    return error(e);
  }
});
