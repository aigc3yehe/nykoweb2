# NFT Collection 开发指南

## 概述

本文档记录了 Agent Apps 标签页中 NFT Collection 功能的完整开发实现，包括前端布局、接口调用、后端集成等技术细节。

## 技术架构

### 前端技术栈
- **React 19** + **TypeScript**
- **Jotai** - 状态管理
- **CSS Modules** - 样式管理
- **Alchemy SDK** - 区块链数据查询

### 后端集成
- **Alchemy API** - NFT 数据源
- **Base Chain** - 目标区块链网络

## 环境配置

### 环境变量
```bash
# .env 文件
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### 依赖安装
```bash
npm install alchemy-sdk
```

## 前端实现

### 1. 状态管理 (`src/store/nftStore.ts`)

#### 数据结构
```typescript
interface NFTCollection {
  id: string;                    // Collection 唯一标识
  contractAddress: string;       // 合约地址
  name: string;                 // Collection 名称
  symbol: string;               // Collection 符号
  totalSupply: string;          // NFT 总数量
  imageUrl: string;             // Collection 封面图
  description: string;          // Collection 描述
  floorPrice?: number;          // 地板价（可选）
  openSeaSlug?: string;         // OpenSea 链接（可选）
}

interface NFTStoreState {
  collections: NFTCollection[];  // Collection 列表
  isLoading: boolean;           // 加载状态
  error: string | null;         // 错误信息
}
```

#### Alchemy 配置
```typescript
const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);
```

#### Collection 配置
```typescript
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
```

### 2. 组件架构

#### 组件层级结构
```
AgentAppsContent
├── NFTSection
│   ├── NFTCollectionCard (多个)
│   └── LoadingState / EmptyState
└── ContentExtensionsSection
```

#### NFTSection 组件 (`src/components/NFTSection.tsx`)

**主要功能：**
- 数据获取和状态管理
- 错误处理和 Toast 显示
- 横滑布局容器
- 加载状态和空状态处理

**关键代码：**
```typescript
const NFTSection: React.FC = () => {
  const [nftState] = useAtom(nftStoreAtom);
  const fetchCollections = useSetAtom(fetchNFTCollections);
  const showToast = useSetAtom(showToastAtom);

  // 组件挂载时获取数据
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // 错误处理
  useEffect(() => {
    if (nftState.error) {
      showToast({
        message: `Failed to load NFT collections: ${nftState.error}`,
        severity: 'error',
      });
      clearError();
    }
  }, [nftState.error, showToast, clearError]);
};
```

#### NFTCollectionCard 组件 (`src/components/NFTCollectionCard.tsx`)

**主要功能：**
- 图片懒加载
- 悬停效果
- 点击事件处理
- NFT 数量显示

**懒加载实现：**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  if (cardRef.current) {
    observer.observe(cardRef.current);
  }

  return () => observer.disconnect();
}, []);
```

### 3. 样式实现

#### 布局规范
- **卡片尺寸**: 176px × 225px (桌面端)
- **移动端尺寸**: 160px × 200px
- **横滑布局**: `overflow-x: auto` + `display: flex`
- **间距**: 16px gap (桌面端), 12px gap (移动端)

#### CSS 关键样式
```css
/* 横滑容器 */
.collectionsScroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.collectionsScroll::-webkit-scrollbar {
  display: none;
}

/* Collection 卡片 */
.collectionCard {
  width: 11rem; /* 176px */
  height: 14.0625rem; /* 225px */
  background: linear-gradient(121.69deg, rgba(31, 41, 55, 0.2) 22.31%, rgba(63, 79, 103, 0.2) 86.22%, rgba(70, 125, 206, 0.2) 106.88%);
  backdrop-filter: blur(0.9375rem);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collectionCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
}
```

## 后端接口集成

### 1. Alchemy API 使用

#### 主要接口
```typescript
// 获取合约的 NFT 数据
const response = await alchemy.nft.getNftsForContract(
  contractAddress,
  {
    pageSize: 1,        // 只获取一个 NFT 用于获取 collection 信息
    omitMetadata: false, // 包含元数据
  }
);
```

#### 数据提取逻辑
```typescript
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
  };
}
```

### 2. 错误处理策略

#### 多层错误处理
1. **单个 Collection 错误**: 返回基本信息，不影响其他 Collection
2. **整体请求错误**: 显示错误 Toast，展示空列表
3. **网络错误**: 自动重试机制（可扩展）

```typescript
const promises = COLLECTIONS.map(async (collection) => {
  try {
    // API 调用
    const response = await alchemy.nft.getNftsForContract(/*...*/);
    return processResponse(response);
  } catch (error) {
    console.error(`Error fetching collection ${collection.id}:`, error);
    // 返回基本信息，避免整个请求失败
    return getBasicCollectionInfo(collection);
  }
});
```

### 3. 性能优化

#### 并行请求
```typescript
// 并行获取两个 Collection 的数据
const promises = COLLECTIONS.map(async (collection) => {
  return fetchCollectionData(collection);
});

const results = await Promise.all(promises);
```

#### 缓存策略
- **无缓存**: 每次访问都重新获取最新数据
- **可扩展**: 可添加 5 分钟缓存机制（参考 topicStore 实现）

## 交互功能

### 1. 点击事件

#### Collection 卡片点击
```typescript
const handleCollectionClick = (collection: NFTCollection) => {
  // TODO: 跳转到 NFT 列表页面（暂未开发）
  console.log('Collection clicked:', collection);
  showToast({
    message: `${collection.name} NFT list page coming soon!`,
    severity: 'info',
  });
};
```

#### 超链接点击
```typescript
// $MISATO 链接
const handleMisatoClick = () => {
  window.open('https://app.virtuals.io/virtuals/657', '_blank', 'noopener,noreferrer');
};

// NIYOKO 链接  
const handleNiyokoClick = () => {
  window.open('https://app.virtuals.io/virtuals/22053', '_blank', 'noopener,noreferrer');
};
```

### 2. 状态管理

#### 加载状态
```typescript
{nftState.isLoading ? (
  <div className={styles.loadingState}>
    <div className={styles.loadingSpinner}></div>
    <p className={styles.loadingText}>Loading NFT collections...</p>
  </div>
) : /* ... */}
```

#### 空状态
```typescript
{nftState.collections.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📦</div>
    <p className={styles.emptyText}>No NFT collections available</p>
    <p className={styles.emptySubtext}>Collections will appear here once they are loaded</p>
  </div>
) : /* ... */}
```

## 移动端适配

### 响应式断点
```css
@media (max-width: 768px) {
  .collectionCard {
    width: 10rem; /* 160px */
    height: 12.5rem; /* 200px */
  }
  
  .collectionsScroll {
    gap: 0.75rem; /* 12px */
  }
}
```

### 触摸优化
- **横滑滚动**: 原生支持触摸滚动
- **点击反馈**: CSS transition 提供视觉反馈
- **安全区域**: 考虑移动端安全区域适配

## Collection 详情页面实现

### 1. 页面架构

#### 路由集成 (`src/components/MainLayout.tsx`)

**URL 参数格式**:
```
/?collection=contractAddress&name=collectionName&description=description
```

**路由逻辑**:
```typescript
const hasCollection = searchParams.has('collection') && 
                     searchParams.has('name') && 
                     searchParams.has('description');

// 在 Routes 中渲染
hasCollection ? (
  <div className={styles.fullWidthContent}>
    <CollectionPage
      contractAddress={searchParams.get('collection')!}
      name={searchParams.get('name')!}
      description={searchParams.get('description')!}
      onBack={() => window.history.back()}
    />
  </div>
) : /* 其他页面 */
```

#### 页面跳转 (`src/components/NFTSection.tsx`)

**Collection 卡片点击处理**:
```typescript
const handleCollectionClick = (collection: NFTCollection) => {
  const params = new URLSearchParams({
    collection: collection.contractAddress,
    name: collection.name,
    description: collection.description,
  });
  
  const url = `/?${params.toString()}`;
  navigate(url); // 使用 React Router 导航
};
```

### 2. 状态管理 (`src/store/collectionDetailStore.ts`)

#### 数据结构
```typescript
interface NFTItem {
  tokenId: string;           // NFT Token ID
  imageUrl: string;          // NFT 图片 URL
  collectionName: string;    // Collection 名称
  contractAddress: string;   // 合约地址
}

interface CollectionDetail {
  name: string;              // Collection 名称
  contractAddress: string;   // 合约地址
  description: string;       // Collection 描述
  nfts: NFTItem[];          // NFT 列表
  totalCount: number;        // 当前页 NFT 数量
  currentPage: number;       // 当前页码
  hasNextPage: boolean;      // 是否有下一页
  nextPageKey?: string;      // 下一页的 pageKey
}

interface CollectionDetailState {
  collection: CollectionDetail | null;
  isLoading: boolean;
  error: string | null;
}
```

#### 核心 Actions

**获取 Collection 详情**:
```typescript
export const fetchCollectionDetailAtom = atom(
  null,
  async (_, set, params: { 
    contractAddress: string; 
    name: string; 
    description: string; 
    page?: number; 
    pageKey?: string 
  }) => {
    // 设置加载状态
    set(collectionDetailAtom, (prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // 调用 Alchemy API
      const response = await alchemy.nft.getNftsForContract(contractAddress, {
        pageSize: 50,
        pageKey: pageKey,
        omitMetadata: false,
      });

      // 处理 NFT 数据
      const nfts: NFTItem[] = response.nfts.map((nft) => ({
        tokenId: nft.tokenId,
        imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || '',
        collectionName: name,
        contractAddress: contractAddress,
      }));

      // 按 tokenId 排序
      nfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

      // 更新状态
      set(collectionDetailAtom, {
        collection: {
          name,
          contractAddress,
          description,
          nfts,
          totalCount: response.nfts.length,
          currentPage: page || 1,
          hasNextPage: !!response.pageKey,
          nextPageKey: response.pageKey,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // 错误处理
      set(collectionDetailAtom, (prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load collection detail',
      }));
    }
  }
);
```

**无限滚动加载更多**:
```typescript
export const loadMoreNFTsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(collectionDetailAtom);
    const collection = currentState.collection;

    if (!collection || !collection.hasNextPage || !collection.nextPageKey) {
      return;
    }

    // 获取下一页数据
    const response = await alchemy.nft.getNftsForContract(collection.contractAddress, {
      pageSize: 50,
      pageKey: collection.nextPageKey,
      omitMetadata: false,
    });

    // 合并新数据
    const newNfts = response.nfts.map(/* ... */);
    const allNfts = [...collection.nfts, ...newNfts];
    allNfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));

    // 更新状态
    set(collectionDetailAtom, {
      collection: {
        ...collection,
        nfts: allNfts,
        currentPage: collection.currentPage + 1,
        hasNextPage: !!response.pageKey,
        nextPageKey: response.pageKey,
      },
      isLoading: false,
      error: null,
    });
  }
);
```

### 3. 组件实现

#### CollectionPage 主组件 (`src/components/CollectionPage.tsx`)

**组件结构**:
```typescript
const CollectionPage: React.FC<CollectionPageProps> = ({
  contractAddress,
  name,
  description,
  onBack,
}) => {
  // 状态管理
  const [collectionState] = useAtom(collectionDetailAtom);
  const fetchCollectionDetail = useSetAtom(fetchCollectionDetailAtom);
  const clearCollectionDetail = useSetAtom(clearCollectionDetailAtom);

  // 数据获取
  useEffect(() => {
    fetchCollectionDetail({ contractAddress, name, description });
    
    // 清理函数
    return () => {
      clearCollectionDetail();
    };
  }, [contractAddress, name, description]);

  return (
    <div className={styles.collectionPage}>
      <div className={styles.container}>
        {/* Collection 信息区域 */}
        <div className={styles.collectionInfoSection}>
          <CollectionInfo
            name={name}
            contractAddress={contractAddress}
            description={description}
            onBack={onBack}
          />
        </div>

        {/* NFT 列表区域 */}
        <div className={styles.nftListSection}>
          {collectionState.isLoading && !collectionState.collection ? (
            <div className={styles.initialLoadingState}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading collection...</p>
            </div>
          ) : (
            <NFTList />
          )}
        </div>
      </div>
    </div>
  );
};
```

#### CollectionInfo 组件 (`src/components/CollectionInfo.tsx`)

**主要功能**:
- 返回按钮
- Collection 名称显示
- 合约地址复制功能
- MagicEden 链接跳转

**关键实现**:
```typescript
const CollectionInfo: React.FC<CollectionInfoProps> = ({
  name,
  contractAddress,
  description,
  onBack,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // 复制合约地址
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // 跳转到 MagicEden
  const handleMagicEdenClick = () => {
    const magicEdenUrl = `https://magiceden.io/collections/base/${contractAddress}`;
    window.open(magicEdenUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.collectionInfo}>
      <div className={styles.title}>
        <div className={styles.titleContent}>
          <button className={styles.backButton} onClick={onBack}>
            <img src={backIcon} alt="Back" className={styles.backIcon} />
          </button>
          
          <div className={styles.separator}></div>
          
          <h1 className={styles.collectionName}>{name}</h1>
          
          <button className={styles.copyButton} onClick={handleCopyAddress}>
            <img 
              src={isCopied ? doneIcon : copyIcon} 
              alt={isCopied ? "Copied" : "Copy"} 
              className={styles.copyIcon} 
            />
          </button>
          
          <button className={styles.magicEdenButton} onClick={handleMagicEdenClick}>
            <img src={meIcon} alt="MagicEden" className={styles.meIcon} />
          </button>
        </div>
      </div>
      
      <div className={styles.description}>
        <p className={styles.descriptionText}>{description}</p>
      </div>
    </div>
  );
};
```

#### NFTList 组件 (`src/components/NFTList.tsx`)

**主要功能**:
- 网格布局显示 NFT
- 无限滚动加载
- NFT 点击跳转到 MagicEden

**网格布局配置**:
```css
/* 响应式网格 */
.nftGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);  /* 默认6列 */
  gap: 0.75rem;
}

@media (max-width: 1200px) {
  .nftGrid {
    grid-template-columns: repeat(5, 1fr);  /* 5列 */
  }
}

@media (max-width: 900px) {
  .nftGrid {
    grid-template-columns: repeat(4, 1fr);  /* 4列 */
  }
}

@media (max-width: 600px) {
  .nftGrid {
    grid-template-columns: repeat(3, 1fr);  /* 3列 */
  }
}
```

**无限滚动实现**:
```typescript
const NFTList: React.FC = () => {
  const [collectionState] = useAtom(collectionDetailAtom);
  const loadMoreNFTs = useSetAtom(loadMoreNFTsAtom);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 无限滚动监听
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && 
        collectionState.collection?.hasNextPage && 
        !collectionState.isLoading) {
      loadMoreNFTs();
    }
  }, [collectionState.collection?.hasNextPage, collectionState.isLoading, loadMoreNFTs]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  // NFT 点击处理
  const handleNFTClick = (nft: NFTItem) => {
    const magicEdenUrl = `https://magiceden.io/item-details/base/${nft.contractAddress}/${nft.tokenId}`;
    window.open(magicEdenUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.nftList}>
      {nfts.length > 0 ? (
        <>
          <div className={styles.nftGrid}>
            {nfts.map((nft) => (
              <NFTCard
                key={`${nft.contractAddress}-${nft.tokenId}`}
                nft={nft}
                onClick={handleNFTClick}
              />
            ))}
          </div>

          {/* 加载更多触发器 */}
          {collectionState.collection.hasNextPage && (
            <div ref={loadingRef} className={styles.loadingTrigger}>
              {collectionState.isLoading && (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>Loading more NFTs...</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🖼️</div>
          <p className={styles.emptyText}>No NFTs found in this collection</p>
        </div>
      )}
    </div>
  );
};
```

#### NFTCard 组件 (`src/components/NFTCard.tsx`)

**主要功能**:
- NFT 图片显示
- 悬停效果和遮罩
- Token ID 和 Collection 名称显示
- 图片懒加载

**悬停效果实现**:
```css
/* NFT 卡片 */
.nftCard {
  position: relative;
  width: 8.9375rem;  /* 143px */
  height: 8.9375rem; /* 143px */
  background: linear-gradient(90deg, rgba(31, 41, 55, 0.2) 0%, rgba(63, 79, 103, 0.2) 100%);
  backdrop-filter: blur(0.9375rem);
  border-radius: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* 悬停遮罩 */
.hoverOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  border-radius: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  pointer-events: none;
}

.nftCard:hover .hoverOverlay {
  opacity: 1;
}

/* NFT 信息 */
.nftInfo {
  position: relative;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nftCard:hover .nftInfo {
  opacity: 1;
}
```

### 4. 样式设计

#### 页面布局 (`CollectionPage.module.css`)
```css
.collectionPage {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.collectionInfoSection {
  margin-bottom: 2rem;
}

.nftListSection {
  width: 100%;
}
```

#### Collection 信息区域 (`CollectionInfo.module.css`)
```css
.collectionInfo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.titleContent {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.backButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.backButton:hover {
  background: rgba(255, 255, 255, 0.2);
}

.backIcon {
  width: 1rem;   /* 16px */
  height: 1rem;  /* 16px */
}
```

### 5. 用户交互功能

#### 导航功能
- **返回按钮**: 使用 `window.history.back()` 返回上一页
- **面包屑导航**: 显示当前 Collection 名称
- **URL 状态**: 支持浏览器前进/后退

#### 复制功能
- **合约地址复制**: 点击复制按钮复制合约地址到剪贴板
- **视觉反馈**: 复制成功后图标变为勾选状态，3秒后恢复

#### 外部链接
- **MagicEden Collection**: 跳转到 MagicEden 的 Collection 页面
- **MagicEden NFT**: 点击 NFT 跳转到具体的 NFT 详情页面

### 6. 性能优化

#### 数据加载优化
- **分页加载**: 每页加载 50 个 NFT
- **无限滚动**: 使用 Intersection Observer 实现
- **状态缓存**: 页面切换时保持状态，返回时无需重新加载

#### 图片优化
- **懒加载**: NFT 图片进入视口时才加载
- **占位符**: 加载过程中显示骨架屏动画
- **错误处理**: 图片加载失败时显示默认占位符

#### 内存管理
- **状态清理**: 组件卸载时清理 Collection 状态
- **事件监听清理**: 正确清理 Intersection Observer

## 扩展功能

### 1. 已实现功能
- ✅ **Collection 详情页面**: 完整的 Collection 浏览体验
- ✅ **NFT 网格展示**: 响应式网格布局，支持 3-6 列显示
- ✅ **无限滚动**: 自动加载更多 NFT
- ✅ **外部链接集成**: MagicEden 平台跳转
- ✅ **合约地址复制**: 一键复制功能
- ✅ **悬停效果**: 渐变遮罩和信息显示

### 2. 可能的增强功能
- **实时价格**: 集成 OpenSea API 获取实时地板价
- **收藏功能**: 用户收藏 Collection
- **搜索功能**: Collection 名称搜索
- **排序功能**: 按价格、数量等排序
- **筛选功能**: 按属性筛选 NFT
- **NFT 详情模态框**: 在当前页面查看 NFT 详情

## 调试和监控

### 1. 日志记录
```typescript
console.log('[NFTStore] Fetching collections...');
console.log('[NFTStore] Collection data:', collectionsData);
console.error('[NFTStore] Error:', error);
```

### 2. 错误监控
- Toast 通知用户错误
- Console 记录详细错误信息
- 优雅降级处理

### 3. 性能监控
- 图片懒加载减少初始加载时间
- 并行 API 请求提高响应速度
- CSS 动画使用 transform 优化性能

## 部署注意事项

### 1. 环境变量
确保生产环境正确配置 `VITE_ALCHEMY_API_KEY`

### 2. API 限制
- Alchemy API 有请求频率限制
- 考虑添加请求缓存机制
- 监控 API 使用量

### 3. 错误处理
- 生产环境隐藏详细错误信息
- 添加用户友好的错误提示
- 考虑添加重试机制

---

**文档版本**: v2.0  
**最后更新**: 2024年12月  
**维护者**: 开发团队

## 更新日志

### v2.0 (2024年12月)
- ✅ 新增 Collection 详情页面完整实现文档
- ✅ 新增路由集成和页面跳转机制说明
- ✅ 新增状态管理详细架构 (collectionDetailStore)
- ✅ 新增组件实现详解 (CollectionPage, CollectionInfo, NFTList, NFTCard)
- ✅ 新增无限滚动和懒加载实现
- ✅ 新增悬停效果和交互功能说明
- ✅ 新增性能优化策略
- ✅ 更新网格布局为 6-5-4-3 列响应式设计
- ✅ 更新 MagicEden 链接格式为 item-details 模板

### v1.0 (2024年12月)
- 初始版本，包含基础 NFT Collection 功能实现 