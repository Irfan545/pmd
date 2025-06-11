import React, { useState } from 'react';

export default function CarPartsSearch() {
  const [maker, setMaker] = useState('');
  const [model, setModel] = useState('');
  const [engine, setEngine] = useState('');

  return (
    <div className="bg-[#f8fafc] p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Search car parts by registration number</label>
        <div className="flex items-center space-x-2">
          <span className="flex items-center bg-blue-700 text-white px-3 py-2 rounded-l-md font-bold text-lg">
            <span className="mr-2">GB</span>
          </span>
          <input
            type="text"
            placeholder="YOUR REG"
            className="flex-1 bg-yellow-200 border-none px-4 py-2 text-lg font-semibold focus:outline-none"
          />
          <button className="bg-blue-600 text-white px-5 py-2 rounded-r-md font-semibold hover:bg-blue-700 transition">Search</button>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select your car to search for auto parts</label>
        <div className="space-y-3">
          {/* Step 1: Maker */}
          <div className={`flex items-center border rounded overflow-hidden ${!maker ? 'border-orange-400' : 'border-gray-300'} bg-white`}> 
            <span className="w-8 h-10 flex items-center justify-center text-white font-bold bg-orange-400 rounded-none">1</span>
            <select
              className="flex-1 px-4 py-2 focus:outline-none bg-transparent"
              value={maker}
              onChange={e => { setMaker(e.target.value); setModel(''); setEngine(''); }}
            >
              <option value="">Select maker</option>
              <option value="Toyota">Toyota</option>
              <option value="Ford">Ford</option>
              <option value="BMW">BMW</option>
            </select>
            <span className="px-2 text-gray-400">▼</span>
          </div>
          {/* Step 2: Model */}
          <div className={`flex items-center border rounded overflow-hidden ${maker ? (!model ? 'border-blue-300' : 'border-gray-300') : 'border-gray-200'} bg-white opacity-${maker ? '100' : '60'}`}> 
            <span className={`w-8 h-10 flex items-center justify-center text-white font-bold rounded-none ${maker ? 'bg-blue-400' : 'bg-gray-300'}`}>2</span>
            <select
              className="flex-1 px-4 py-2 focus:outline-none bg-transparent"
              value={model}
              onChange={e => { setModel(e.target.value); setEngine(''); }}
              disabled={!maker}
            >
              <option value="">Select model</option>
              {maker === 'Toyota' && <option value="Corolla">Corolla</option>}
              {maker === 'Toyota' && <option value="Camry">Camry</option>}
              {maker === 'Ford' && <option value="Focus">Focus</option>}
              {maker === 'Ford' && <option value="Fiesta">Fiesta</option>}
              {maker === 'BMW' && <option value="320i">320i</option>}
              {maker === 'BMW' && <option value="X5">X5</option>}
            </select>
            <span className="px-2 text-gray-400">▼</span>
          </div>
          {/* Step 3: Engine */}
          <div className={`flex items-center border rounded overflow-hidden ${model ? (!engine ? 'border-blue-300' : 'border-gray-300') : 'border-gray-200'} bg-white opacity-${model ? '100' : '60'}`}> 
            <span className={`w-8 h-10 flex items-center justify-center text-white font-bold rounded-none ${model ? 'bg-blue-400' : 'bg-gray-300'}`}>3</span>
            <select
              className="flex-1 px-4 py-2 focus:outline-none bg-transparent"
              value={engine}
              onChange={e => setEngine(e.target.value)}
              disabled={!model}
            >
              <option value="">Select engine</option>
              {model === 'Corolla' && <option value="1.8L">1.8L</option>}
              {model === 'Corolla' && <option value="2.0L">2.0L</option>}
              {model === 'Focus' && <option value="1.6L">1.6L</option>}
              {model === 'Focus' && <option value="2.0L">2.0L</option>}
              {model === '320i' && <option value="2.0L">2.0L</option>}
              {model === 'X5' && <option value="3.0L">3.0L</option>}
            </select>
            <span className="px-2 text-gray-400">▼</span>
          </div>
        </div>
      </div>
      <button className="w-full bg-blue-600 text-white py-3 rounded font-bold text-lg hover:bg-blue-700 transition mb-2">Search</button>
      <div className="text-center">
        <a href="#" className="text-blue-600 text-sm hover:underline">CAN'T FIND YOUR CAR IN THE CATALOGUE?</a>
      </div>
    </div>
  );
} 