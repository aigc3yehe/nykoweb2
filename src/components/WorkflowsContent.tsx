import React, { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import styles from './WorkflowsContent.module.css';
import { workflowListAtom, fetchWorkflows } from '../store/workflowStore';
import WorkflowCard from './WorkflowCard';
import StatePrompt from './StatePrompt';
import { accountAtom } from '../store/accountStore';

interface WorkflowsContentProps {
  ownedOnly: boolean;
  sortOption: 'New Model' | 'Popular';
  onWorkflowClick: (workflowId: number, workflowName: string) => void;
}

const WorkflowsContent: React.FC<WorkflowsContentProps> = ({ ownedOnly, sortOption, onWorkflowClick }) => {
  const [workflowListState] = useAtom(workflowListAtom);
  const [accountState] = useAtom(accountAtom);
  const fetchWorkflowsList = useSetAtom(fetchWorkflows);

  const { workflows = [], isLoading, error, hasMore } = workflowListState;
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const order = sortOption == 'Popular' ? "usage" : "created_at"

  // 根据用户角色和ownedOnly决定view参数
  // 如果是用户自己的模型列表(ownedOnly=true)，不需要传view参数
  // 如果是admin查看所有模型，不传view参数，显示所有模型
  // 如果是普通用户查看所有模型，设置view=true，只显示可见的模型
  const viewParam = ownedOnly ? undefined : (accountState.role === 'admin' ? undefined : true);

  useEffect(() => {
    fetchWorkflowsList({ reset: true, ownedOnly, order, view: viewParam });
  }, [order, sortOption, ownedOnly, fetchWorkflowsList, viewParam]);

  const filteredWorkflows = workflows || [];

  const lastWorkflowElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchWorkflowsList({ reset: false, ownedOnly, order, view: viewParam });
      }
    }, {
      root: null,
      rootMargin: '256px', // 增加根元素边距，提前触发加载
      threshold: 0.1
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, fetchWorkflowsList, ownedOnly, order, viewParam]);

  return (
    <div className={styles.workflowsContent} ref={scrollContainerRef}>
      {filteredWorkflows.length === 0 && !isLoading ? (
        <StatePrompt
          message={ownedOnly ? "You Don't Own Any Workflows" : "No Workflows Found"}
        />
      ) : (
        <div className={styles.workflowsGrid}>
          {filteredWorkflows.map((workflow, index) => {
            if (index === filteredWorkflows.length - 1) {
              return (
                <div
                  ref={lastWorkflowElementRef}
                  key={workflow.id}
                  className={styles.workflowCardContainer}
                  onClick={() => onWorkflowClick(workflow.id, workflow.name)}
                >
                  <WorkflowCard
                    workflow={workflow}
                  />
                </div>
              );
            } else {
              return (
                <div
                  key={workflow.id}
                  className={styles.workflowCardContainer}
                  onClick={() => onWorkflowClick(workflow.id, workflow.name)}
                >
                  <WorkflowCard
                    workflow={workflow}
                  />
                </div>
              );
            }
          })}
        </div>
      )}

      {isLoading && (
        <StatePrompt message="Loading Workflows..." showIcon={false} />
      )}

      {error && (
        <StatePrompt
          message="Failed to Load Workflows"
          action={{
            text: 'Retry',
            onClick: () => fetchWorkflowsList({ reset: false, ownedOnly, order, view: viewParam }),
          }}
        />
      )}
    </div>
  );
};

export default WorkflowsContent;