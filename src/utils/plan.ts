export const CuBuyConfig = {
  price: 0.01,
  amount: 2500,
  treasure: "0x08e12DEF5cebA574b891c5556cdBA4490A9F0635",
};

export enum SERVICE_TYPE {
  GENERATE_IMAGE = "generate_image",
  TRAIN_MODEL = "train_model",
  MODEL_TOKENIZATION = "model_tokenization",
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
