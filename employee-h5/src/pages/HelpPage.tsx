import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import './HelpPage.css';

const HelpPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: '什么是推广码？',
      answer: '推广码是您的专属二维码，其他用户扫描您的推广码关注公众号后，系统会自动记录为您的推广成果。',
    },
    {
      question: '如何分享推广码？',
      answer: '在"我的推广码"页面，您可以点击"复制推广文案"按钮，将推广文案复制到剪贴板，然后通过微信、短信等方式分享给朋友。也可以点击"保存二维码"将图片保存到相册。',
    },
    {
      question: '推广数据如何统计？',
      answer: '系统会自动统计所有扫描您推广码的用户数量，以及其中完成关注公众号的用户数量。数据每小时更新一次。',
    },
    {
      question: '排行榜是如何计算的？',
      answer: '排行榜按照推广效果进行排名，今日排行显示当天的推广数据，本月排行显示本月的累计数据。',
    },
    {
      question: '为什么有些扫码记录没有关注？',
      answer: '有些用户可能只是扫码查看了公众号信息，但未完成关注操作。这类记录会显示为"未关注"状态。',
    },
    {
      question: '如何提高推广转化率？',
      answer: '建议您：1）向朋友介绍公众号的价值和内容；2）分享公众号的优质文章；3）解答朋友关于公众号的疑问；4）定期提醒已经扫码的朋友完成关注。',
    },
    {
      question: '绑定账号后可以更换吗？',
      answer: '账号绑定后不支持更换，每个员工只能绑定一个微信账号。如需帮助，请联系管理员。',
    },
    {
      question: '数据有延迟吗？',
      answer: '推广数据会有5-10分钟的延迟，排行榜数据每小时更新一次。请耐心等待数据更新。',
    },
  ];

  const contactInfo = [
    {
      icon: <UserOutlined />,
      title: '技术支持',
      content: '如有技术问题，请联系 IT 部门',
    },
    {
      icon: <PhoneOutlined />,
      title: '业务咨询',
      content: '如有业务问题，请联系市场部',
    },
    {
      icon: <MailOutlined />,
      title: '管理员',
      content: '如需账号帮助，请联系行政部',
    },
  ];

  return (
    <div className="help-page">
      {/* 导航栏 */}
      <div className="navbar">
        <div className="navbar-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
        </div>
        <div className="navbar-title">帮助说明</div>
        <div className="navbar-action"></div>
      </div>

      {/* 欢迎卡片 */}
      <div className="welcome-card">
        <div className="welcome-icon">👋</div>
        <h2 className="welcome-title">欢迎使用推广系统</h2>
        <p className="welcome-text">
          这里是公众号推广追踪系统的帮助中心，您可以找到常见问题的解答和使用指南。
        </p>
      </div>

      {/* 快速入门 */}
      <div className="section">
        <h3 className="section-title">快速入门</h3>
        <div className="steps-card">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-title">绑定账号</div>
              <div className="step-description">使用工号、姓名和手机号完成账号绑定</div>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-title">获取推广码</div>
              <div className="step-description">在首页查看您的专属推广二维码</div>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-title">分享推广</div>
              <div className="step-description">通过微信等方式分享推广码给朋友</div>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <div className="step-title">查看数据</div>
              <div className="step-description">实时查看推广数据和排行榜</div>
            </div>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="section">
        <h3 className="section-title">常见问题</h3>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">
                <span className="faq-icon">❓</span>
                <span className="faq-question-text">{faq.question}</span>
              </div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 联系我们 */}
      <div className="section">
        <h3 className="section-title">联系我们</h3>
        <div className="contact-list">
          {contactInfo.map((item, index) => (
            <div key={index} className="contact-item">
              <div className="contact-icon-wrapper">{item.icon}</div>
              <div className="contact-content">
                <div className="contact-title">{item.title}</div>
                <div className="contact-text">{item.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="footer-tip">
        <p>感谢您的使用和支持！</p>
        <p>让我们一起为组织发展贡献力量</p>
      </div>
    </div>
  );
};

export default HelpPage;
