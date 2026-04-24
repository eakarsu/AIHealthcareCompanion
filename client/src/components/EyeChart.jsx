import { useState } from 'react';
import { Eye, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';

const SNELLEN_CHART = [
  { line: 1, letters: 'E', size: 72, vision: '20/200' },
  { line: 2, letters: 'FP', size: 60, vision: '20/100' },
  { line: 3, letters: 'TOZ', size: 48, vision: '20/70' },
  { line: 4, letters: 'LPED', size: 40, vision: '20/50' },
  { line: 5, letters: 'PECFD', size: 32, vision: '20/40' },
  { line: 6, letters: 'EDFCZP', size: 26, vision: '20/30' },
  { line: 7, letters: 'FELOPZD', size: 22, vision: '20/25' },
  { line: 8, letters: 'DEFPOTEC', size: 18, vision: '20/20' },
  { line: 9, letters: 'LEFODPCT', size: 14, vision: '20/15' },
  { line: 10, letters: 'FDPLTCEO', size: 11, vision: '20/10' }
];

const COLOR_VISION_TESTS = [
  { id: 1, colors: ['#FF0000', '#00FF00'], correct: 0, question: 'Which circle is red?' },
  { id: 2, colors: ['#0000FF', '#FF0000'], correct: 0, question: 'Which circle is blue?' },
  { id: 3, colors: ['#00FF00', '#FFFF00'], correct: 1, question: 'Which circle is yellow?' },
  { id: 4, colors: ['#FF00FF', '#00FFFF'], correct: 1, question: 'Which circle is cyan?' },
];

export default function EyeChart({ onComplete }) {
  const [testMode, setTestMode] = useState('select'); // select, distance, color
  const [currentLine, setCurrentLine] = useState(0);
  const [testingEye, setTestingEye] = useState('right'); // right, left
  const [results, setResults] = useState({ left: null, right: null, color: null });
  const [colorTestIndex, setColorTestIndex] = useState(0);
  const [colorCorrect, setColorCorrect] = useState(0);

  const startDistanceTest = () => {
    setTestMode('distance-intro');
  };

  const beginDistanceTest = () => {
    setCurrentLine(0);
    setTestingEye('right');
    setTestMode('distance');
  };

  const handleCanRead = () => {
    if (currentLine < SNELLEN_CHART.length - 1) {
      setCurrentLine(prev => prev + 1);
    } else {
      finishEyeTest();
    }
  };

  const handleCannotRead = () => {
    finishEyeTest();
  };

  const finishEyeTest = () => {
    const result = currentLine > 0 ? SNELLEN_CHART[currentLine - 1].vision : SNELLEN_CHART[0].vision;

    if (testingEye === 'right') {
      setResults(prev => ({ ...prev, right: result }));
      setTestingEye('left');
      setCurrentLine(0);
    } else {
      setResults(prev => ({ ...prev, left: result }));
      setTestMode('color-intro');
    }
  };

  const startColorTest = () => {
    setColorTestIndex(0);
    setColorCorrect(0);
    setTestMode('color');
  };

  const handleColorChoice = (choice) => {
    if (choice === COLOR_VISION_TESTS[colorTestIndex].correct) {
      setColorCorrect(prev => prev + 1);
    }

    if (colorTestIndex < COLOR_VISION_TESTS.length - 1) {
      setColorTestIndex(prev => prev + 1);
    } else {
      const colorResult = colorCorrect >= 3 ? 'Normal' : colorCorrect >= 2 ? 'Mild deficiency' : 'Deficiency detected';
      setResults(prev => ({ ...prev, color: colorResult }));
      setTestMode('complete');
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(results);
    }
  };

  // Test Selection Screen
  if (testMode === 'select') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="w-6 h-6 text-orange-600" />
          Interactive Vision Test
        </h3>
        <p className="text-gray-600 mb-6">
          This basic vision screening will test your distance vision and color perception.
          For accurate results, position yourself about 6 feet (2 meters) from your screen.
        </p>
        <button
          onClick={startDistanceTest}
          className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
        >
          Start Vision Test
        </button>
      </div>
    );
  }

  // Distance Test Introduction
  if (testMode === 'distance-intro') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Distance Vision Test</h3>
        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-orange-800 mb-2">Instructions:</h4>
          <ul className="text-orange-700 space-y-2 text-sm">
            <li>1. Position yourself about 6 feet (2 meters) from your screen</li>
            <li>2. Cover your LEFT eye first (we'll test RIGHT eye)</li>
            <li>3. Read the letters shown on screen</li>
            <li>4. Click "I can read this" if you can see the letters clearly</li>
            <li>5. Click "I cannot read this" when the letters become too small</li>
          </ul>
        </div>
        <button
          onClick={beginDistanceTest}
          className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
        >
          Begin Test (Right Eye First)
        </button>
      </div>
    );
  }

  // Distance Vision Test
  if (testMode === 'distance') {
    const currentRow = SNELLEN_CHART[currentLine];
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Testing: {testingEye === 'right' ? 'Right' : 'Left'} Eye
          </h3>
          <span className="text-sm text-gray-500">Line {currentLine + 1}/10</span>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-blue-700">
            {testingEye === 'right' ? 'Cover your LEFT eye' : 'Cover your RIGHT eye'}
          </p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6 text-center min-h-[200px] flex items-center justify-center">
          <span
            style={{ fontSize: `${currentRow.size}px`, fontFamily: 'monospace', fontWeight: 'bold' }}
            className="tracking-widest"
          >
            {currentRow.letters}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCanRead}
            className="py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            I can read this
          </button>
          <button
            onClick={handleCannotRead}
            className="py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Too blurry
          </button>
        </div>
      </div>
    );
  }

  // Color Test Introduction
  if (testMode === 'color-intro') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Color Vision Test</h3>
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-green-700">
            Distance vision test complete! Now let's test your color perception.
            You'll be shown pairs of colors and asked to identify specific ones.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Right Eye</p>
            <p className="text-xl font-bold text-gray-800">{results.right}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Left Eye</p>
            <p className="text-xl font-bold text-gray-800">{results.left}</p>
          </div>
        </div>
        <button
          onClick={startColorTest}
          className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
        >
          Start Color Test
        </button>
      </div>
    );
  }

  // Color Vision Test
  if (testMode === 'color') {
    const currentTest = COLOR_VISION_TESTS[colorTestIndex];
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Color Vision Test</h3>
          <span className="text-sm text-gray-500">{colorTestIndex + 1}/{COLOR_VISION_TESTS.length}</span>
        </div>
        <p className="text-center text-gray-700 mb-6 font-medium">{currentTest.question}</p>
        <div className="flex justify-center gap-8 mb-6">
          {currentTest.colors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorChoice(index)}
              className="w-24 h-24 rounded-full border-4 border-gray-200 hover:border-gray-400 transition-colors shadow-lg"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">Click the circle that matches the color asked</p>
      </div>
    );
  }

  // Test Complete
  if (testMode === 'complete') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Test Complete!</h3>
        <div className="bg-green-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-green-800 mb-4 text-center">Your Results</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Right Eye</p>
              <p className="text-xl font-bold text-gray-800">{results.right}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Left Eye</p>
              <p className="text-xl font-bold text-gray-800">{results.left}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Color Vision</p>
              <p className="text-lg font-bold text-gray-800">{results.color}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This is a basic screening test. For a comprehensive eye examination,
            please consult an eye care professional.
          </p>
        </div>
        <button
          onClick={handleComplete}
          className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
        >
          Save Results
        </button>
      </div>
    );
  }

  return null;
}
