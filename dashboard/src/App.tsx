import { ApiProvider } from './context'

function App() {
  return (
    <ApiProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Fleet Management Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time dashboard
          </p>
        </div>
      </div>
    </ApiProvider>
  )
}

export default App
