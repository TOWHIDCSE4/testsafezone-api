import GenerationTemplateAIActions from '@/actions/GenerationTemplateAI';
import { GenerationResultAI, GenerationResultAIModel } from '@/models/AI/GenerationResultAI';
import { GenerationTemplateAIModel } from '@/models/AI/GenerationTemplateAI';
import { createHandler, init, error, success } from '@/modules/core';

export const autoCreateQuizAI = createHandler(async (e) => {
  try {
    await init();
    const { template_id } = JSON.parse(e.body || '{}');
    const templateData: any = await GenerationTemplateAIModel.findOne({_id: template_id})
    if(!templateData){
      return error('Template not found');
    }
    let dataGenerate = await GenerationTemplateAIActions.generateAIResult(
      templateData.content,
      templateData.params
    );
    if (dataGenerate.statusCode > 300 || !dataGenerate) {
      return error(JSON.parse(dataGenerate.body).message);
    } else {
      dataGenerate = await dataGenerate.replace('\n\n', '</p> <p>');
    }
    const data: any = {
      template_obj_id: template_id,
      title : `Job auto create: ${templateData.title}`,
      content: dataGenerate
    }
    const GenerationResult = await GenerationResultAIModel.create(
      data as GenerationResultAI
    );
    if(GenerationResult) {
      let timeRunJob: any = new Date();
      timeRunJob.setHours(0);
      timeRunJob.setMinutes(0);
      timeRunJob.setSeconds(0);
      await GenerationTemplateAIModel.findOneAndUpdate(
        { _id: template_id },
        {
          last_time_run_job: timeRunJob
        }
      );
    }
    return success({
      code: '10000',
      data: GenerationResult,
      message: 'Success',
    });
  } catch (e) {
    return error(e);
  }
});
