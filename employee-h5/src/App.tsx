import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import BindPage from './pages/BindPage';
import HomePage from './pages/HomePage';
import MultiAccountPage from './pages/MultiAccountPage';
import MultiAccountHomePageOptimized from './pages/MultiAccountHomePageOptimized';
import AllAccountsStatsPage from './pages/AllAccountsStatsPage';
import FollowTask from './pages/FollowTask';
import RankingPage from './pages/RankingPage';
import RecordsPage from './pages/RecordsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/bind" element={<BindPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/multi-account" element={<MultiAccountPage />} />
          <Route path="/multi-home" element={<MultiAccountHomePageOptimized />} />
          <Route path="/multi-stats" element={<AllAccountsStatsPage />} />
          <Route path="/follow-task" element={<FollowTask />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
