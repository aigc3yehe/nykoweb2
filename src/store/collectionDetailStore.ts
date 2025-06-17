import { atom } from 'jotai';
import { Alchemy, Network } from 'alchemy-sdk';

// Alchemy 配置
const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

// NFT 数据结构
export interface NFTItem {
  tokenId: string;
  imageUrl: string;
  collectionName: string;
  contractAddress: string;
}

// Collection 详情数据结构
export interface CollectionDetail {
  name: string;
  contractAddress: string;
  description: string;
  nfts: NFTItem[];
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  nextPageKey?: string;
}

// Collection 详情状态
export interface CollectionDetailState {
  collection: CollectionDetail | null;
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: CollectionDetailState = {
  collection: null,
  isLoading: false,
  error: null,
};

// 状态原子
export const collectionDetailAtom = atom<CollectionDetailState>(initialState);

// 获取 Collection 详情的动作
export const fetchCollectionDetailAtom = atom(
  null,
  async (_, set, params: { contractAddress: string; name: string; description: string; page?: number; pageKey?: string }) => {
    const { contractAddress, name, description, page = 1, pageKey } = params;
    
    set(collectionDetailAtom, (prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      console.log('[CollectionDetailStore] Fetching NFTs for contract:', contractAddress);

      // 获取 NFT 列表
      const response = await alchemy.nft.getNftsForContract(contractAddress, {
        pageSize: 50,
        pageKey: pageKey,
        omitMetadata: false,
      });

      console.log('[CollectionDetailStore] NFT response:', response);

      // 处理 NFT 数据
      const nfts: NFTItem[] = response.nfts.map((nft) => ({
        tokenId: nft.tokenId,
        imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || '',
        collectionName: name,
        contractAddress: contractAddress,
      }));

      // 按 tokenId 排序
      nfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

      const collectionDetail: CollectionDetail = {
        name,
        contractAddress,
        description,
        nfts,
        totalCount: response.nfts.length,
        currentPage: page,
        hasNextPage: !!response.pageKey,
        nextPageKey: response.pageKey,
      };

      set(collectionDetailAtom, {
        collection: collectionDetail,
        isLoading: false,
        error: null,
      });

      console.log('[CollectionDetailStore] Collection detail loaded:', collectionDetail);
    } catch (error) {
      console.error('[CollectionDetailStore] Error fetching collection detail:', error);
      set(collectionDetailAtom, (prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load collection detail',
      }));
    }
  }
);

// 加载更多 NFT 的动作
export const loadMoreNFTsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(collectionDetailAtom);
    const collection = currentState.collection;

    if (!collection || !collection.hasNextPage || !collection.nextPageKey) {
      return;
    }

    set(collectionDetailAtom, (prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      console.log('[CollectionDetailStore] Loading more NFTs...');

      const response = await alchemy.nft.getNftsForContract(collection.contractAddress, {
        pageSize: 50,
        pageKey: collection.nextPageKey,
        omitMetadata: false,
      });

      const newNfts: NFTItem[] = response.nfts.map((nft) => ({
        tokenId: nft.tokenId,
        imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || '',
        collectionName: collection.name,
        contractAddress: collection.contractAddress,
      }));

      // 合并并排序
      const allNfts = [...collection.nfts, ...newNfts];
      allNfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

      const updatedCollection: CollectionDetail = {
        ...collection,
        nfts: allNfts,
        currentPage: collection.currentPage + 1,
        hasNextPage: !!response.pageKey,
        nextPageKey: response.pageKey,
      };

      set(collectionDetailAtom, {
        collection: updatedCollection,
        isLoading: false,
        error: null,
      });

      console.log('[CollectionDetailStore] More NFTs loaded:', updatedCollection);
    } catch (error) {
      console.error('[CollectionDetailStore] Error loading more NFTs:', error);
      set(collectionDetailAtom, (prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load more NFTs',
      }));
    }
  }
);

// 清除状态的动作
export const clearCollectionDetailAtom = atom(
  null,
  (_, set) => {
    set(collectionDetailAtom, initialState);
  }
); 