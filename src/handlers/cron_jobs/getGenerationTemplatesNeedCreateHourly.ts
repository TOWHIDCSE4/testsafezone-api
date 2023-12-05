import GenerationTemplateAIActions from '@/actions/GenerationTemplateAI';
import { error, success, init, createHandler } from '@/modules/core';

export const getGenerationTemplatesNeedCreateHourly = createHandler(async () => {
  try {
    await init();
    const filter: any = {
      page_size: 5000,
      page_number: 1,
      job_is_active: true,
      job_frequency: { $gt: 0 },
      last_time_run_job : { $exists: true },
      job_run_time: { $lte: new Date().getTime() }
    };
    const dataTemplate = await GenerationTemplateAIActions.findAllAndPaginatedJob(filter, { createAt: -1 });
    const res_payload: any = {
      data: null,
      pagination: {
          total: 0
      }
    };
    if (dataTemplate && dataTemplate.length > 0) {
        res_payload.data = dataTemplate[0].data;
        res_payload.pagination = dataTemplate[0].pagination;
    }
    return success({
      code: '10000',
      data: res_payload,
      message: 'Success',
    });
  } catch (e) {
    return error(e);
  }
});
