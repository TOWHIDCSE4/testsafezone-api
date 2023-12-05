import { APIGatewayEvent } from 'aws-lambda';

export const checkIfCorrectParent = (event: APIGatewayEvent) => {
  const parentIdInToken = event.requestContext.authorizer?.claims?.sub;
  const { parentId: requestParentId } = event.pathParameters;

  if (parentIdInToken !== requestParentId)
    throw new Error(
      'Token mismatch between parentIdInToken and requestParentId'
    );

  return { requestParentId, parentIdInToken };
};
