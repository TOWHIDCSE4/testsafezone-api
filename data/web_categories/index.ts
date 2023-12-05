import { WebCategoryModel } from '@/models/Rule';
import categories from '@/assets/web-categories.json';

export = categories.map((category) =>
  new WebCategoryModel({
    description: category.Description,
    _id: category.ID,
    name: category.Name,
  }).toJSON()
);
