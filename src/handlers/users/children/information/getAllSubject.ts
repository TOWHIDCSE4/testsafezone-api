import PromptParamAIActions from '@/actions/PromptParamAI';
import { EnumPromptParamAIStatus, EnumTypeParamAIStatus } from '@/models/AI/PromptParamAI';
import { error, success, init, createAuthorizedHandler } from '@/modules/core';

export const getAllSubject = createAuthorizedHandler(async (event) => {
  await init();

  try {
    const { page_size, page_number, search } =
      event.queryStringParameters || {};
    const status: any = parseInt(event.queryStringParameters.status as string);
    const filter: any = {
      page_number: Number(page_number || 1),
      page_size: Number(page_size || 10),
      type: EnumTypeParamAIStatus.SUBJECT
    };
    if (status === EnumPromptParamAIStatus.ACTIVE) {
      filter.is_active = true;
    } else if (status === EnumPromptParamAIStatus.INACTIVE) {
      filter.is_active = false;
    }
    if (search) {
      filter.search = search;
    }
    const data = await PromptParamAIActions.findAllAndPaginated(filter);
    const count = await PromptParamAIActions.count(filter);
    const res_payload = {
      data,
      pagination: {
        total: count,
      },
    };
    return success({
      code: '10000',
      result: res_payload,
      message: 'Success',
    });
  } catch (e) {
    return error(e);
  }
});
