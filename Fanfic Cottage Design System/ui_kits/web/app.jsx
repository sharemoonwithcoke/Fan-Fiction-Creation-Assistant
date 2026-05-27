/* ui_kits/web/app.jsx — top-level routing & state */

function App() {
  const [user, setUser] = React.useState({ nickname: 'Quill', email: 'quill@cottage.co' });
  const [route, setRoute] = React.useState('home');

  function logout() { setUser(null); setRoute('login'); }
  function login(u) { setUser(u); setRoute('home'); }

  if (!user || route === 'login') {
    return <LoginScreen onLogin={login} onGoRegister={() => login({ nickname: 'Reader', email: 'new@cottage.co' })}/>;
  }

  return (
    <div className="app-shell">
      <Header route={route} onNavigate={setRoute} user={user} onLogout={logout}/>
      <div className="app-main" key={route}>
        {route === 'home'     && <DashboardScreen   user={user} onNavigate={setRoute}/>}
        {route === 'projects' && <ProjectsScreen    onNavigate={setRoute}/>}
        {route === 'image'    && <TextToImageScreen/>}
        {route === 'forum'    && <ForumPostScreen/>}
        {route === 'novel'    && <VisualNovelScreen/>}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>);
