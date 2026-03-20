import { useState } from 'react';
import type { PosterTemplate } from '../types';
import './PosterTemplateSelector.css';

interface PosterTemplateSelectorProps {
  templates: PosterTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: PosterTemplate) => void;
  onClose: () => void;
}

const PosterTemplateSelector = ({
  templates,
  selectedTemplateId,
  onSelect,
  onClose,
}: PosterTemplateSelectorProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<PosterTemplate | null>(null);

  const handleSelect = (template: PosterTemplate) => {
    onSelect(template);
    onClose();
  };

  return (
    <div className="template-selector-overlay" onClick={onClose}>
      <div className="template-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-selector-header">
          <h3>选择海报模板</h3>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="template-selector-content">
          <div className="template-grid">
            {templates.filter(t => t.isActive).map((template) => (
              <div
                key={template.id}
                className={`template-item ${selectedTemplateId === template.id ? 'selected' : ''}`}
                onClick={() => handleSelect(template)}
              >
                <div className="template-preview">
                  {/* 使用渐变色块作为预览占位 */}
                  <div 
                    className="template-preview-placeholder"
                    style={{
                      background: template.id === 'tpl_001' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : template.id === 'tpl_002'
                        ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                        : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                    }}
                  >
                    <div className="template-qrcode-placeholder"></div>
                  </div>
                  <div className="template-overlay">
                    <span>点击选择</span>
                  </div>
                </div>
                <div className="template-info">
                  <p className="template-name">{template.name}</p>
                  <p className="template-size">{template.width} × {template.height}</p>
                </div>
                {selectedTemplateId === template.id && (
                  <div className="selected-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="template-selector-footer">
          <p className="template-tip">💡 选择模板后将生成带有您的专属二维码的海报</p>
        </div>
      </div>

      {/* 预览弹窗 */}
      {previewTemplate && (
        <div className="preview-overlay" onClick={() => setPreviewTemplate(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewTemplate.previewUrl} alt={previewTemplate.name} />
            <button onClick={() => setPreviewTemplate(null)}>关闭预览</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterTemplateSelector;