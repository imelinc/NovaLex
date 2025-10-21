import './App.css'
import ChatBot from './components/ChatBot'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>NovaLex</h1>
        <p>Tu asistente virtual legal</p>
      </header>
      <main className="app-main">
        <ChatBot />
      </main>
    </div>
  )
}

export default App
