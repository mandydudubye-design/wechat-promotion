import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { EmployeePromotionCode, PosterTemplate } from '../types';
import { generatePoster, downloadPoster, sharePoster, canShare } from '../utils/posterGenerator';
import { useToast } from './Toast';
import './PromotionCodeCard.css';

interface PromotionCodeCardProps {
  promotionCode: EmployeePromotionCode;
  templates: PosterTemplate[];
  employeeName: string;
  employeeDepartment: string;
}

const PromotionCodeCard = ({
  promotionCode,
  templates,
  employeeName,
  employeeDepartment,
}: PromotionCodeCardProps) => {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate | null>(
    templates[0] || null
  );

  const { account, qrCodeUrl, parameter } = promotionCode;

  // 复制推广参数
  const handleCopyParameter = () => {
    navigator.clipboard.writeText(parameter);
    showToast('推广参数已复制', 'success');
  };

  // 生成长按保存的海报
  const handleGeneratePoster = async () => {
    if (!selectedTemplate) {
      showToast('请先选择海报模板', 'error');
      return;
    }

    setGenerating(true);
    try {
      const url = await generatePoster({
        template: selectedTemplate,
        employee: {
          id: '',
          employeeId: parameter.split('_')[0] || '',
          name: employeeName,
          department: employeeDepartment,
          isBound: true,
          createdAt: '',
        },
        account,
        qrCodeUrl,
      });
      
      setPosterUrl(url);
      showToast('海报生成成功', 'success');
    } catch (error) {
      console.error('海报生成失败:', error);
      showToast('海报生成失败，请重试', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // 下载海报
  const handleDownloadPoster = () => {
    if (posterUrl) {
      downloadPoster(posterUrl, `${account.name}_推广海报.png`);
      showToast('海报已保存', 'success');
    }
  };

  // 分享海报
  const handleSharePoster = async () => {
    if (!posterUrl) return;
    
    const success = await sharePoster(posterUrl, `${account.name}推广海报`);
    if (!success) {
      showToast('当前环境不支持分享，请长按保存图片', 'error');
    }
  };

  return (
    <div className={`promotion-code-card ${expanded ? 'expanded' : ''} ${account.isPrimary ? 'is-primary' : ''}`}>
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <div className="account-info">
          <div className="account-avatar">
            {account.avatar ? (
              <img src={account.avatar} alt={account.name} />
            ) : (
              <div className="avatar-placeholder">
                {account.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="account-details">
            <div className="account-name-row">
              <h4 className="account-name">{account.name}</h4>
              {account.isPrimary && (
                <span className="primary-tag">主推</span>
              )}
            </div>
            {account.description && (
              <p className="account-desc">{account.description}</p>
            )}
          </div>
        </div>
        <div className={`expand-icon ${expanded ? 'rotated' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="card-content">
          {/* 二维码展示 */}
          <div className="qrcode-section">
            <div className="qrcode-container">
              {posterUrl ? (
                <img src={posterUrl} alt="推广海报" className="poster-image" />
              ) : (
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={true}
                />
              )}
            </div>
            <p className="qrcode-tip">
              {posterUrl ? '长按保存海报' : '扫码关注公众号'}
            </p>
          </div>

          {/* 推广参数 */}
          <div className="parameter-section">
            <div className="parameter-label">推广参数</div>
            <div className="parameter-value">
              <span>{parameter}</span>
              <button className="copy-btn" onClick={handleCopyParameter}>
                复制
              </button>
            </div>
          </div>

          {/* 海报模板选择 */}
          {templates.length > 0 && (
            <div className="template-section">
              <div className="template-label">海报模板</div>
              <div 
                className="selected-template"
                onClick={() => setShowTemplateSelector(true)}
              >
                {selectedTemplate ? (
                  <>
                    <span>{selectedTemplate.name}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </>
                ) : (
                  <span className="placeholder">请选择模板</span>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="action-buttons">
            {!posterUrl ? (
              <button 
                className="generate-btn primary"
                onClick={handleGeneratePoster}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="loading-spinner"></span>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    生成推广海报
                  </>
                )}
              </button>
            ) : (
              <>
                <button className="action-btn" onClick={handleDownloadPoster}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  保存图片
                </button>
                {canShare() && (
                  <button className="action-btn primary" onClick={handleSharePoster}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    分享
                  </button>
                )}
                <button 
                  className="action-btn"
                  onClick={() => {
                    setPosterUrl(null);
                    setShowTemplateSelector(true);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  换模板
                </button>
              </>
            )}
          </div>

          {/* 提示信息 */}
          <div className="tips-section">
            <p>💡 生成海报后，可长按保存或分享给好友</p>
          </div>
        </div>
      )}

      {/* 模板选择器弹窗 */}
      {showTemplateSelector && (
        <div className="template-selector-popup">
          <div className="popup-header">
            <h4>选择海报模板</h4>
            <button onClick={() => setShowTemplateSelector(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="popup-content">
            <div className="template-list">
              {templates.filter(t => t.isActive).map((template) => (
                <div
                  key={template.id}
                  className={`template-option ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTemplateSelector(false);
                  }}
                >
                  <div 
                    className="template-thumb"
                    style={{
                      background: template.id === 'tpl_001' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : template.id === 'tpl_002'
                        ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                        : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                    }}
                  ></div>
                  <span>{template.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionCodeCard;