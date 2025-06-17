import React, { useState } from 'react';
import styles from './ContentExtensionsSection.module.css';
import TextContentModal from './TextContentModal';
import nykoImage from '../assets/nyko150.png';

interface ExtensionCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  content: string;
}

const extensionCards: ExtensionCard[] = [
  {
    id: 'modify',
    title: 'Modify',
    subtitle: 'Powered by GPT-image & Flux Kontext',
    description: 'Advanced image modification with AI-powered precision editing capabilities.',
    content: `Modify is an advanced AI-powered image editing tool that leverages the combined power of GPT-image and Flux Kontext technologies.

Key Features:
• Intelligent object recognition and selection
• Context-aware modifications that preserve image harmony
• Natural language instructions for precise edits
• Real-time preview of modifications
• Support for complex multi-object editing scenarios

This tool allows users to make sophisticated edits to their images using simple text descriptions, making professional-level image editing accessible to everyone.

Technical Implementation:
The system uses advanced computer vision algorithms to understand image content and context, enabling precise modifications while maintaining visual coherence and quality.`
  },
  {
    id: 'animate',
    title: 'Animate',
    subtitle: 'Powered by Kling & VEO3',
    description: 'Transform static images into dynamic animations with cutting-edge AI technology.',
    content: `Animate brings your static images to life using state-of-the-art AI animation technologies powered by Kling and VEO3.

Key Features:
• Automatic motion detection and generation
• Smooth, natural animation transitions
• Customizable animation styles and speeds
• High-quality output with preserved image details
• Support for various animation types (subtle motion, dramatic effects)

Animation Capabilities:
• Character animation with realistic movements
• Environmental effects (wind, water, fire)
• Object interactions and physics simulation
• Facial expressions and emotion animation
• Background motion and atmospheric effects

The system intelligently analyzes your image content and generates appropriate animations that enhance the visual storytelling while maintaining the original artistic intent.`
  }
];

const ContentExtensionsSection: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<ExtensionCard | null>(null);

  const handleCardClick = (card: ExtensionCard) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className={styles.extensionsSection}>
      <h2 className={styles.sectionTitle}>
        Content Extensions
      </h2>
      
      <div className={styles.cardsContainer}>
        {extensionCards.map((card) => (
          <div 
            key={card.id}
            className={styles.extensionCard}
            onClick={() => handleCardClick(card)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.providerIcon}>
                <img 
                  src={nykoImage} 
                  alt="Provider" 
                  className={styles.providerImage}
                  title="@niyoko_agent"
                />
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardSubtitle}>{card.subtitle}</p>
              <p className={styles.cardDescription}>{card.description}</p>
            </div>
            <div className={styles.cardAction}>
              <span className={styles.actionText}>Learn More</span>
              <span className={styles.actionArrow}>→</span>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <TextContentModal
          isOpen={true}
          onClose={handleCloseModal}
          title={selectedCard.title}
          subtitle={selectedCard.subtitle}
          content={selectedCard.content}
        />
      )}
    </div>
  );
};

export default ContentExtensionsSection; 