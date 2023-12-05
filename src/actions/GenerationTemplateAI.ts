import mongoose, { FilterQuery as FilterQueryMG } from 'mongoose';
import _ from 'lodash';
import { error } from '@/modules/core';
import {
  GenerationTemplateAI,
  GenerationTemplateAIModel,
} from '@/models/AI/GenerationTemplateAI';
import ApiKeyAIActions from './ApiKeyAI';
import { PromptAIModel } from '@/models/AI/PromptAI';
import { PromptParamAIModel } from '@/models/AI/PromptParamAI';
import axios from 'axios';
import { ApiKeyAI } from '@/models/AI/ApiKeyAI';
import { HOUR_TO_MS, MINUTE_TO_MS } from '@/const/common';
import { GenerationResultAIModel } from '@/models/AI/GenerationResultAI';
const ObjectId = mongoose.Types.ObjectId;
const OPEN_AI_URL = process.env.OPEN_AI_URI || 'https://api.openai.com';
export default class GenerationTemplateAIActions {
  public static buildFilterQuery(
    filter: any
  ): FilterQueryMG<GenerationTemplateAI> {
    const conditions: any = {};
    if (filter._id) {
      conditions._id = filter._id;
    }
    if (filter.title) {
      conditions.title = {
        $regex: _.escapeRegExp(filter.title),
        $options: 'i',
      };
    }
    if (filter.prompt_name) {
      conditions['prompt.title'] = {
        $regex: _.escapeRegExp(filter.prompt_name),
        $options: 'i',
      };
    }
    if (filter.category_obj_id) {
      conditions.category_obj_id = new ObjectId(filter.category_obj_id);
    }
    if (filter.subject_obj_id) {
      conditions.subject_obj_id = new ObjectId(filter.subject_obj_id);
    }
    if (filter.age) {
      conditions.age = Number(filter.age);
    }
    if (filter.rank_obj_id) {
      conditions.rank_obj_id = new ObjectId(filter.rank_obj_id);
    }
    if (filter.prompt_obj_id) {
      conditions.prompt_obj_id = new ObjectId(filter.prompt_obj_id);
    }
    if (filter.job_is_active || filter.job_is_active === false) {
      conditions.job_is_active = filter.job_is_active;
    }
    if (filter.last_time_run_job) {
      conditions.last_time_run_job = filter.last_time_run_job;
    }
    if (filter.job_frequency) {
      conditions.job_frequency = filter.job_frequency;
    }
    if (filter.job_run_time) {
      conditions.job_run_time = filter.job_run_time;
    }
    if (filter.is_active || filter.is_active === false) {
      conditions.is_active = filter.is_active;
    }
    return conditions;
  }

  public static async findAllAndPaginated(
    filter: any,
    sort: any = { createAt: -1 }
  ) {
    const conditions = GenerationTemplateAIActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;
    return await GenerationTemplateAIModel.aggregate([
      {
        $lookup: {
          from: PromptAIModel.collection.collectionName,
          localField: 'prompt_obj_id',
          foreignField: '_id',
          as: 'prompt',
        },
      },
      {
        $lookup: {
          from: PromptParamAIModel.collection.collectionName,
          localField: 'category_obj_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: PromptParamAIModel.collection.collectionName,
          localField: 'subject_obj_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $lookup: {
          from: PromptParamAIModel.collection.collectionName,
          localField: 'rank_obj_id',
          foreignField: '_id',
          as: 'rank',
        },
      },
      { $unwind: '$rank' },
      {
        $match: conditions,
      },
      {
        $facet: {
          data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          pagination: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      },
      {
        $unwind: '$pagination',
      },
    ]).exec();
  }

  public static async findAllWithResult(
    filter: any,
    sort: any = { createAt: -1 }
  ) {
    const conditions = GenerationTemplateAIActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 10;
    const limit = pageSize;
    return await GenerationTemplateAIModel.aggregate([
      {
        $lookup: {
          from: GenerationResultAIModel.collection.collectionName,
          localField: '_id',
          foreignField: 'template_obj_id',
          as: 'result',
        },
      },
      {
        $unwind: '$result',
      },
      {
        $match: conditions,
      },
      { $sort: sort },
      { $limit: limit },
    ]).exec();
  }

  public static async findAllAndPaginatedJob(
    filter: any,
    sort: any = { createAt: -1 }
  ) {
    const conditions = GenerationTemplateAIActions.buildFilterQuery(filter);
    const pageSize = filter.page_size || 20;
    const pageNumber = filter.page_number || 1;
    const skip = pageSize * (pageNumber - 1);
    const limit = pageSize;
    return await GenerationTemplateAIModel.aggregate([
      {
        $lookup: {
          from: PromptAIModel.collection.collectionName,
          localField: 'prompt_obj_id',
          foreignField: '_id',
          as: 'prompt',
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          category_obj_id: 1,
          subject_obj_id: 1,
          age: 1,
          rank_obj_id: 1,
          prompt_obj_id: 1,
          prompt: 1,
          params: 1,
          is_active: 1,
          job_is_active: 1,
          job_frequency: 1,
          last_time_run_job: 1,
          job_run_time: {
                $sum: [
                    '$last_time_run_job',
                    {
                        $multiply: [
                            '$job_frequency',
                            HOUR_TO_MS
                        ]
                    },
                    (-5) * MINUTE_TO_MS
                ]
          },
          createdAt: 1
        }
      },
      {
        $match: conditions,
      },
      {
        $facet: {
          data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          pagination: [{ $group: { _id: null, total: { $sum: 1 } } }],
        },
      },
      {
        $unwind: '$pagination',
      },
    ]).exec();
  }

  public static count(filter): Promise<number> {
    const conditions = GenerationTemplateAIActions.buildFilterQuery(filter);
    return GenerationTemplateAIModel.countDocuments(conditions).exec();
  }

  public static async generateAIResult(promptData?: any, params?: any) {
    console.log('start call api AI generate report >>');
    const apiKey: any = await ApiKeyAIActions.findOne(
      { is_active: true },
      { __v: 0 },
      {
        last_used_time: 1,
        _id: 1,
      }
    );
    if (!apiKey) return error('api key not found');
    const dataPost: any = {
      model: 'text-davinci-003',
      max_tokens: 1000,
      temperature: 0,
    };
    if (params) {
      const tone = params.tone || 'professional';
      dataPost.temperature = parseInt(params.quality as string) || 0.75;
      dataPost.max_tokens = params.max_result_length || 1000;
      dataPost.n = params.number_result || 1;
      promptData += '\nTone of voice of the answers must be: ' + tone + '.';
      if (params?.language) {
        promptData +=
          '\n Please provide answers in ' + params?.language + ' language. \n';
      }
    }
    dataPost.prompt = promptData;
    console.log(dataPost);
    console.log('prompt data: ' + promptData);
    try {
      const route = OPEN_AI_URL + '/v1/completions';
      const headers = {
        Authorization: 'Bearer ' + apiKey?.api_key,
        'Content-Type': 'application/json; charset=utf-8',
      };
      const response = await axios({
        method: 'post',
        url: route,
        headers,
        data: dataPost,
      });
      console.log('end call api AI generate report <<');
      const currentTime = new Date();
      await ApiKeyAIActions.update(apiKey._id, {
        last_used_time: currentTime.getTime(),
      } as ApiKeyAI);
      let res: any = '';
      if (response?.data.choices && response?.data?.choices[0]) {
        let indexResult = 1;
        console.log('count data response: ' + response?.data?.choices?.length);
        for await (const result of response?.data?.choices) {
          console.log(indexResult);
          if (indexResult > 1) {
            res +=
              '<p>[' +
              indexResult +
              '] ------------------------------------------------------------- <p>' +
              result.text;
          } else {
            res += result.text;
          }
          indexResult++;
        }
      }
      console.log('data generate: ' + res);
      return res;
    } catch (err: any) {
      //     await ApiKeyAIActions.update(apiKey._id, {
      //         last_used_time: moment().valueOf(),
      //         is_active: false,
      //         msg_error: err?.message
      //     } as ApiKeyAI);
      console.log('api AI generate Error code: ' + err?.response?.status);
      console.log(
        'api AI generate report API Error: ' +
          err?.response?.data?.error?.message
      );
      switch (err?.response?.status) {
        case 400:
          return error(
            'API Error: The requested data is not valid for the API request.'
          );
        case 401:
          return error('API Error: The API key is missing or invalid.');
        case 403:
          return error(
            'API Error: You lack the necessary permissions to perform this action.'
          );
        case 404:
          return error('API Error: The requested resource was not found.');
        case 429:
          return error(
            'API Error: You are sending requests too quickly or you exceeded your current quota.'
          );
        case 500:
          return error(
            'API Error: The server had an error while processing your request, please try again.'
          );
        default:
          return error('Unexpected error, please try again.');
      }
    }
  }
}
