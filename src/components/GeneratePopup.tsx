import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { generatePopupAtom, generate, setAspectRatio } from '../store/generatePopupStore';
import styles from './GeneratePopup.module.css';
import closeImgSvg from '../assets/close_img.svg';
import generateBgSvg from '../assets/generate-bg.svg';
import imageIcon from '../assets/image.svg';
import downIcon from '../assets/down.svg';
import createSvg from '../assets/create.svg';
import statusSvg from '../assets/status.svg';
import downloadSvg from '../assets/download.svg';
import { aspectRatios, AspectRatio } from '../store/chatStore';

interface GeneratePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneratePopup: React.FC<GeneratePopupProps> = ({
  isOpen,
  onClose
}) => {
  const [generatePopupState] = useAtom(generatePopupAtom);
  const [prompt, setPrompt] = useState('');
  const [loraStrength, setLoraStrength] = useState(generatePopupState.loraWeight || 0.9);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const [, generateAction] = useAtom(generate);
  const [, setAspectRatioAction] = useAtom(setAspectRatio);

  const ratioDropdownRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 生成过程中的随机文案
  const generatingTips = [
    "Evaluating prompt",
    "Taking a deep breath",
    "Allocating compute power",
    "Reasoning in progress",
    "Enhancing visuals",
    "Packaging output",
    "Procuring bandwidth",
    "Entering competition"
  ];

  // 每3秒切换一次文案
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (generatePopupState.isGenerating) {
      interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentTipIndex(prev => (prev + 1) % generatingTips.length);
          setIsAnimating(false);
        }, 300); // 动画持续时间
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generatePopupState.isGenerating, generatingTips.length]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ratioDropdownRef.current && !ratioDropdownRef.current.contains(event.target as Node)) {
        setShowRatioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理滑块点击和拖动的统一逻辑
  const handleSliderInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    let newStrength = Math.max(0, Math.min(1, x / width));
    // 四舍五入到两位小数
    newStrength = Math.round(newStrength * 100) / 100;

    setLoraStrength(newStrength);
  }, []);

  // 处理滑块拖动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderInteraction(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleSliderInteraction]);

  // 切换宽高比下拉菜单
  const handleAspectRatioClick = () => {
    setShowRatioDropdown(prev => !prev);
  };

  // 选择宽高比
  const handleAspectRatioSelect = (ratio: AspectRatio) => {
    setAspectRatioAction(ratio);
    setShowRatioDropdown(false);
  };

  // 计算生成图片的宽度
  const calculateImageWidth = () => {
    const resultRadio = generatePopupState.resultAspectRatio
    const height = 25; // 固定高度400px 25rem
    if (!resultRadio) return height;
    const width = (height * resultRadio.width) / resultRadio.height;
    return width;
  };

  // 处理图片下载
  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 实现下载逻辑
    const generatedImageUrl = generatePopupState.imageUrl;
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 处理生成请求
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generateAction(
      prompt.trim(),
      loraStrength
    );
  };

  // 处理输入变化
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  // 判断是否在生成中
  const isGenerating = generatePopupState.isGenerating;

  const isCompleted = generatePopupState.isCompleted;
  const generatedImageUrl = generatePopupState.imageUrl;
  const model = generatePopupState.model;
  const selectedRatio = generatePopupState.selectedAspectRatio;

  if (!model) return null;

  if (!isOpen) return null;

  return (
    <div className={styles.generatePopupOverlay}>
      <div className={styles.generatePopupContent}>
        {/* 标题栏 */}
        <div className={styles.titleBar}>
          <div className={styles.modelInfo}>
            <img
              src={model.cover}
              alt={`Model ${model.name} cover`}
              className={styles.modelCover}
            />
            <div className={styles.modelName}>
              <div className={styles.modelLabel}>MODEL</div>
              <div className={styles.modelTitle}>{model.name}</div>
            </div>
          </div>

          <button className={styles.closeButton} onClick={onClose}>
            <img src={closeImgSvg} alt="关闭" />
          </button>
        </div>

        {/* 出图区域 */}
        <div className={styles.imageArea}>
          <img src={generateBgSvg} alt="Generation background" className={styles.generateBg} />

          {/* 初始状态 */}
          {!isGenerating && !isCompleted && (
            <div className={styles.initialContainer}>
              <div className={styles.statusIconContainer}>
                <img src={statusSvg} alt="Status" className={styles.statusIcon} />
              </div>
            </div>
          )}

          {/* 生成中状态 */}
          {isGenerating && (
            <div className={styles.generatingContainer}>
              <div className={styles.generatingContent}>
                <div className={styles.generatingStatus}>
                  <div className={styles.generatingText}>Image Generating...</div>
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.progressBarContainer}>
                      <div className={styles.progressBarAnimation}></div>
                    </div>
                  </div>
                  <div className={`${styles.generatingTip} ${isAnimating ? styles.animateOut : ''}`}>
                    {generatingTips[currentTipIndex]}
                  </div>
                </div>
                <div className={styles.statusIconContainer}>
                  <img src={statusSvg} alt="Generating status" className={styles.statusIcon} />
                </div>
              </div>
            </div>
          )}

          {/* 生成完成状态 */}
          {isCompleted && generatedImageUrl && (
            <div className={styles.completedContainer}>
              <div className={styles.generatedImageWrapper} style={{ width: `${calculateImageWidth()}rem` }}>
                <img
                  src={generatedImageUrl}
                  alt="Generated image"
                  className={styles.generatedImage}
                />
                <button
                  className={styles.downloadButton}
                  onClick={handleDownloadImage}
                >
                  <img src={downloadSvg} alt="Download" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 参数选择区域 */}
        <div className={styles.parameterArea}>
          {/* 图片尺寸选择 */}
          <div
            className={`${styles.aspectRatioSelector} ${isGenerating ? styles.disabled : ''}`}
            onClick={isGenerating ? undefined : handleAspectRatioClick}
            ref={ratioDropdownRef}
          >
            <img src={imageIcon} alt="Image" className={styles.aspectRatioIcon} />
            <span className={styles.aspectRatioText}>{selectedRatio.value}</span>
            <img src={downIcon} alt="Down" className={styles.aspectRatioIcon} />

            {/* 宽高比下拉菜单 */}
            {showRatioDropdown && (
              <div className={styles.ratioDropdown}>
                {aspectRatios.map((ratio) => (
                  <div
                    key={ratio.value}
                    className={`${styles.ratioItem} ${selectedRatio.value === ratio.value ? styles.ratioItemSelected : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAspectRatioSelect(ratio);
                    }}
                  >
                    {ratio.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lora权重选择 */}
          <div
            className={`${styles.loraStrengthSelector} ${isGenerating ? styles.disabled : ''}`}
            ref={sliderRef}
            onClick={isGenerating ? undefined : handleSliderInteraction}
            onMouseDown={isGenerating ? undefined : (e) => {
              e.preventDefault();
              setIsDragging(true);
              handleSliderInteraction(e);
            }}
          >
            <span className={styles.strengthLabel}>Strength:</span>
            <div
              className={styles.strengthBackground}
              style={{
                width: `${loraStrength * 100}%`,
                transition: isDragging ? 'none' : 'width 0.1s ease-out',
                borderRadius: loraStrength >= 0.95 ? '0.25rem' : '0.25rem 0 0 0.25rem'
              }}
            ></div>
            <span className={styles.strengthValue}>{loraStrength.toFixed(2)}</span>
          </div>
        </div>

        {/* Prompt输入模块 */}
        <div className={styles.promptArea}>
          <input
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Input Your Prompt..."
            className={styles.promptInput}
            disabled={isGenerating}
          />
          <button
            className={`${styles.generateButton} ${prompt.trim() && !isGenerating ? styles.active : ''}`}
            onClick={isGenerating ? undefined : handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            <img src={createSvg} alt="Generate" className={styles.generateButtonIcon} />
            <span className={styles.generateButtonText}>Generate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePopup;