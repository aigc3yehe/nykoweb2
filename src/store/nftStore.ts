import { atom } from 'jotai';
import { Alchemy, Network } from 'alchemy-sdk';

// NFT Collection 接口定义
export interface NFTCollection {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  imageUrl: string;
  description: string;
  floorPrice?: number;
  openSeaSlug?: string;
}

// NFT Store 状态接口
interface NFTStoreState {
  collections: NFTCollection[];
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: NFTStoreState = {
  collections: [],
  isLoading: false,
  error: null,
};

// NFT Store Atom
export const nftStoreAtom = atom<NFTStoreState>(initialState);

// Alchemy 配置
const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

// Collection 合约地址配置
const COLLECTIONS = [
  {
    id: 'niyoko',
    contractAddress: '0xa1c45a08c205d2683b63f1007a3dd72aa1f01961',
    name: 'NIYOKO Collection',
  },
  {
    id: 'misato', 
    contractAddress: '0xccb6b629f5434102e37175bdac8262722180a62f',
    name: 'MISATO Collection',
  },
];

// 获取 NFT Collections 数据
export const fetchNFTCollections = atom(
  null,
  async (get, set) => {
    const currentState = get(nftStoreAtom);
    
    // 设置加载状态
    set(nftStoreAtom, {
      ...currentState,
      isLoading: true,
      error: null,
    });

    try {
      const collectionsData: NFTCollection[] = [];

      // 并行获取两个 Collection 的数据
      const promises = COLLECTIONS.map(async (collection) => {
        try {
          // 获取合约的 NFT 数据（只获取第一个 NFT 用于获取 collection 信息）
          const response = await alchemy.nft.getNftsForContract(
            collection.contractAddress,
            {
              pageSize: 1, // 只获取一个 NFT 来获取 collection 信息
              omitMetadata: false,
            }
          );

          if (response.nfts && response.nfts.length > 0) {
            const firstNft = response.nfts[0];
            const contract = firstNft.contract;
            
            return {
              id: collection.id,
              contractAddress: collection.contractAddress,
              name: contract.name || collection.name,
              symbol: contract.symbol || '',
              totalSupply: contract.totalSupply || '0',
              imageUrl: contract.openSeaMetadata?.imageUrl || firstNft.image?.cachedUrl || '',
              description: contract.openSeaMetadata?.description || '',
              floorPrice: contract.openSeaMetadata?.floorPrice,
              openSeaSlug: contract.openSeaMetadata?.collectionSlug,
            } as NFTCollection;
          }

          // 如果没有 NFT，返回基本信息
          return {
            id: collection.id,
            contractAddress: collection.contractAddress,
            name: collection.name,
            symbol: '',
            totalSupply: '0',
            imageUrl: '',
            description: '',
          } as NFTCollection;
        } catch (error) {
          console.error(`Error fetching collection ${collection.id}:`, error);
          // 返回基本信息，避免整个请求失败
          return {
            id: collection.id,
            contractAddress: collection.contractAddress,
            name: collection.name,
            symbol: '',
            totalSupply: '0',
            imageUrl: '',
            description: '',
          } as NFTCollection;
        }
      });

      const results = await Promise.all(promises);
      collectionsData.push(...results);

      // 更新成功状态
      set(nftStoreAtom, {
        collections: collectionsData,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching NFT collections:', error);
      
      // 更新错误状态
      set(nftStoreAtom, {
        ...currentState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NFT collections',
      });
    }
  }
);

// 清除错误状态
export const clearNFTError = atom(
  null,
  (get, set) => {
    const currentState = get(nftStoreAtom);
    set(nftStoreAtom, {
      ...currentState,
      error: null,
    });
  }
); 