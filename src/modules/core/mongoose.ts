export const hideIdAndVersionPipelines = [
  {
    $addFields: {
      id: '$_id',
    },
  },
  {
    $project: {
      _id: 0,
      __v: 0,
    },
  },
];
