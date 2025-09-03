export const CuBuyConfig = {
  price: 0.01,
  amount: 2500,
  treasure: "0x08e12DEF5cebA574b891c5556cdBA4490A9F0635",
};

export enum SERVICE_TYPE {
  GENERATE_IMAGE = "generate_image",
  TRAIN_MODEL = "train_model",
  MODEL_TOKENIZATION = "model_tokenization",
  RUN_WORKFLOW = "run_workflow",
  RUN_VIDEO_WORKFLOW = "run_video",
  CREATE_WORKFLOW = "create_workflow",
}

export type ServiceConfig = {
  name: SERVICE_TYPE;
  cu: number;
};

export const GENERATE_IMAGE_SERVICE_CONFIG: ServiceConfig = {
  name: SERVICE_TYPE.GENERATE_IMAGE,
  cu: 5,
};

export const TRAIN_MODEL_SERVICE_CONFIG: ServiceConfig = {
  name: SERVICE_TYPE.TRAIN_MODEL,
  cu: 7_500,
};

export const RUN_WORKFLOW_SERVICE_CONFIG: ServiceConfig = {
  name: SERVICE_TYPE.RUN_WORKFLOW,
  cu: 35,
};

export const RUN_VIDEO_WORKFLOW_SERVICE_CONFIG: ServiceConfig = {
  name: SERVICE_TYPE.RUN_VIDEO_WORKFLOW,
  cu: 300,
};

export const CREATE_WORKFLOW_SERVICE_CONFIG: ServiceConfig = {
  name: SERVICE_TYPE.CREATE_WORKFLOW,
  cu: 800,
};

/**
 * 将API返回的计划类型转换为显示名称
 * @param planType API返回的计划类型
 * @returns 显示用的计划名称
 */
export const formatPlanType = (planType: string | null | undefined): string => {
  if (!planType) {
    return 'Free'
  }

  switch (planType) {
    case 'premium_plus':
      return 'Pro'
    case 'premium':
      return 'Plus'
    case 'free':
    default:
      return 'Free'
  }
}
