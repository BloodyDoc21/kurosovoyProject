import Navbar from './components/Navbar'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <AppRouter />
      </main>
    </div>
  )
}