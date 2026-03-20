import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpPage.css';

interface FAQItem {
  question: string;
  answer: string;
}

const HelpPage = () => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqList: FAQItem[] = [
    {
      question: '如何获取推广码？',
      answer: '绑定账号后，系统会自动生成您的专属推广码。在首页点击"推广码"标签即可查看和保存您的推广码图片。',
    },
    {
      question: '推广码如何使用？',
      answer: '将推广码分享给客户，客户扫码后会自动关联到您的账号。客户关注公众号后，系统会记录您的推广业绩。',
    },
    {
      question: '如何查看推广数据？',
      answer: '在首页可以看到今日和累计的扫码数、关注数等数据。点击"推广记录"可以查看详细的推广记录列表。',
    },
    {
      question: '排行榜是如何计算的？',
      answer: '排行榜根据关注数进行排名，关注数相同的情况下按扫码数排名。可以选择查看今日、本周、本月或累计排行。',
    },
    {
      question: '为什么扫码后没有记录？',
      answer: '可能的原因：1) 客户之前已经扫过其他人的推广码；2) 客户未完成关注流程；3) 系统数据同步有延迟，请稍后刷新查看。',
    },
    {
      question: '如何修改个人信息？',
      answer: '目前个人信息不支持自行修改。如需修改，请联系管理员进行处理。',
    },
    {
      question: '忘记工号怎么办？',
      answer: '请联系您所在部门的管理员或人事部门查询工号信息。',
    },
    {
      question: '推广奖励如何发放？',
      answer: '推广奖励按照公司规定的规则进行统计和发放，具体政策请咨询您的部门主管或人力资源部门。',
    },
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="help-page">
      {/* 顶部导航 */}
      <div className="navbar">
        <div className="navbar-left" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <div className="navbar-title">帮助中心</div>
        <div className="navbar-right"></div>
      </div>

      {/* 快捷入口 */}
      <div className="quick-actions">
        <h3 className="section-title">快捷操作</h3>
        <div className="action-grid">
          <div className="action-item" onClick={() => navigate('/')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <span className="action-label">我的推广码</span>
          </div>

          <div className="action-item" onClick={() => navigate('/records')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span className="action-label">推广记录</span>
          </div>

          <div className="action-item" onClick={() => navigate('/ranking')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <span className="action-label">排行榜</span>
          </div>

          <div className="action-item" onClick={() => navigate('/profile')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="action-label">个人中心</span>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="faq-section">
        <h3 className="section-title">常见问题</h3>
        <div className="faq-list">
          {faqList.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${expandedIndex === index ? 'expanded' : ''}`}
              onClick={() => handleToggle(index)}
            >
              <div className="faq-question">
                <span className="faq-icon">Q</span>
                <span className="faq-text">{item.question}</span>
                <svg 
                  className="faq-arrow" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {expandedIndex === index && (
                <div className="faq-answer">
                  <span className="faq-icon answer">A</span>
                  <span className="faq-text">{item.answer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 联系支持 */}
      <div className="support-section">
        <h3 className="section-title">需要更多帮助？</h3>
        <div className="support-card">
          <div className="support-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div className="support-info">
            <div className="support-title">联系管理员</div>
            <div className="support-desc">工作时间：周一至周五 9:00-18:00</div>
          </div>
          <a href="tel:400-123-4567" className="support-action">
            拨打电话
          </a>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="help-footer">
        <p>如有其他问题，请联系部门管理员</p>
      </div>
    </div>
  );
};

export default HelpPage;