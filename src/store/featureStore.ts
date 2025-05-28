import { atom } from 'jotai';
import { modelListAtom, Model } from './modelStore';
import { workflowListAtom, Workflow } from './workflowStore';

// 定义 Feature 接口，聚合 Model 和 Workflow
export interface Feature {
  id: number;
  name: string;
  description: string;
  tags: string[];
  cover: string;
  usage: number;
  type: 'model' | 'workflow'; // 区分类型
  creator: string;
  users: {
    twitter: any;
    address: string | null;
  };
}

// 定义 Feature 列表状态
interface FeatureListState {
  features: Feature[];
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: FeatureListState = {
  features: [],
  isLoading: false,
  error: null
};

// 创建 Feature 列表原子
export const featureListAtom = atom<FeatureListState>(initialState);

// 获取聚合的 Features 数据
export const fetchFeatures = atom(
  null,
  async (get, set) => {
    set(featureListAtom, {
      ...get(featureListAtom),
      isLoading: true,
      error: null
    });

    try {
      const modelState = get(modelListAtom);
      const workflowState = get(workflowListAtom);

      // 转换 Models 为 Features
      const modelFeatures: Feature[] = modelState.models
        .filter(model => model.public === 1) // 只显示公开的
        .map(model => ({
          id: model.id,
          name: model.name,
          description: model.description,
          tags: model.tags,
          cover: model.cover,
          usage: model.usage,
          type: 'model' as const,
          creator: model.creator,
          users: model.users
        }));

      // 转换 Workflows 为 Features
      const workflowFeatures: Feature[] = workflowState.workflows
        .filter(workflow => workflow.public === 1) // 只显示公开的
        .map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          tags: workflow.tags,
          cover: workflow.cover,
          usage: workflow.usage,
          type: 'workflow' as const,
          creator: workflow.creator,
          users: workflow.users
        }));

      // 合并并按使用量排序
      const allFeatures = [...modelFeatures, ...workflowFeatures]
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 20); // 取前20个

      set(featureListAtom, {
        features: allFeatures,
        isLoading: false,
        error: null
      });

    } catch (error) {
      set(featureListAtom, {
        ...get(featureListAtom),
        isLoading: false,
        error: (error as Error).message
      });
    }
  }
);

// 重置 Features
export const resetFeatures = atom(
  null,
  (_, set) => {
    set(featureListAtom, initialState);
  }
);