import React, { useState } from 'react';

function App() {
    const [isActive, setIsActive] = useState(false);

  return (
  <div class="min-h-screen bg-yellow-400 text-white flex items-center justify-center">

    <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">ABC Staking</h1>
        <p className="text-yellow-600">Tailwind is working</p>
      <button 
      onClick={() => setIsActive(!isActive)}
      className={`rounded-lg px-4 py-2 text-white transition-colors ${
        isActive ? "bg-purple-600" : "bg-gray-700"
      }`}
    >
      Click
    </button>

    </div>
  </div>
  )
}

export default App
