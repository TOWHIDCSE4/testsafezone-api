import { WebCategoryModel } from '@/models/Rule';
import { createAuthorizedHandler, init, success } from '@/modules/core';
import webCategories from '@/assets/web-categories.json';

export const getWebCategories = createAuthorizedHandler(async () => {
  await init();

  let categories = await WebCategoryModel.find();

  if (!categories.length) {
    await WebCategoryModel.create(
      webCategories.map(
        (category) =>
          new WebCategoryModel({
            description: category.Description,
            _id: category.ID,
            name: category.Name,
          })
      )
    );

    categories = await WebCategoryModel.find();
  }

  return success({ content: categories });
});
