'use client';

import { useState, useEffect } from 'react';
import { Route, loadRoutes, getRandomRoute } from '../lib/routes';
import RouteCard from './RouteCard';

type GameState = 'loading' | 'start' | 'playing' | 'counting' | 'correct' | 'wrong';

export default function Game() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [nextRoute, setNextRoute] = useState<Route | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [countingValue, setCountingValue] = useState(0);
  const [pendingResult, setPendingResult] = useState<'correct' | 'wrong' | null>(null);
  const [isSliding, setIsSliding] = useState(false);

  // Load routes on mount
  useEffect(() => {
    loadRoutes().then((data) => {
      setRoutes(data);
      // Load high score from localStorage
      const saved = localStorage.getItem('routeGameHighScore');
      if (saved) setHighScore(parseInt(saved, 10));
    });
  }, []);

  // Show start screen when routes are loaded
  useEffect(() => {
    if (routes.length > 0 && gameState === 'loading') {
      setGameState('start');
    }
  }, [routes, gameState]);

  const startGame = () => {
    if (routes.length < 2) return;
    const first = getRandomRoute(routes);
    const second = getRandomRoute(routes, first);
    setCurrentRoute(first);
    setNextRoute(second);
    setScore(0);
    setGameState('playing');
  };

  const continueGame = () => {
    if (!nextRoute) return;

    // Start fade out
    setIsSliding(true);

    // After fade out, update state and fade back in
    setTimeout(() => {
      setCurrentRoute(nextRoute);
      setNextRoute(getRandomRoute(routes, nextRoute));
      setGameState('playing');

      // Small delay then fade in
      setTimeout(() => {
        setIsSliding(false);
      }, 50);
    }, 300);
  };

  const handleGuess = (guessHigher: boolean) => {
    if (!currentRoute || !nextRoute || gameState !== 'playing') return;

    const isHigher = nextRoute.avg_journey_min > currentRoute.avg_journey_min;
    const isEqual = nextRoute.avg_journey_min === currentRoute.avg_journey_min;
    const isCorrect = isEqual || (guessHigher === isHigher);

    // Store the result and start counting
    setPendingResult(isCorrect ? 'correct' : 'wrong');
    setCountingValue(0);
    setGameState('counting');
  };

  // Counting animation effect
  useEffect(() => {
    if (gameState !== 'counting' || !nextRoute) return;

    const targetValue = nextRoute.avg_journey_min;
    const duration = 1000; // 1 second
    const steps = 30; // 30 steps for smooth animation
    const stepDuration = duration / steps;
    const increment = targetValue / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCountingValue(targetValue);
        clearInterval(timer);

        // Show the result after counting completes
        setTimeout(() => {
          if (pendingResult === 'correct') {
            const newScore = score + 1;
            setScore(newScore);
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('routeGameHighScore', newScore.toString());
            }
          }
          setGameState(pendingResult!);
        }, 300);
      } else {
        setCountingValue(Math.round(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [gameState, nextRoute, pendingResult, score, highScore]);

  if (gameState === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1c2c] scanlines relative">
        <div className="text-sm text-[#94b0c2] animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (gameState === 'start') {
    return (
      <div className="h-dvh bg-[#1a1c2c] flex flex-col items-center justify-center p-6 scanlines relative">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-[#ffcd75] mb-4 drop-shadow-[4px_4px_0_#000]">
              🚂 HS3
            </h1>
            <p className="text-xs text-[#94b0c2]">THE UK RAIL GAME</p>
          </div>

          <div className="pixel-card bg-[#41a6f6] p-6 text-left space-y-4">
            <h2 className="text-sm font-bold text-[#1a1c2c]">HOW TO PLAY</h2>
            <ul className="space-y-4 text-xs text-[#1a1c2c]">
              <li className="flex gap-3 items-start">
                <span className="text-[#ffcd75]">►</span>
                <span>TWO TRAIN ROUTES APPEAR</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#ffcd75]">►</span>
                <span>FIRST SHOWS JOURNEY TIME</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#ffcd75]">►</span>
                <span>GUESS HIGHER OR LOWER?</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-[#ffcd75]">►</span>
                <span>CHAIN CORRECT ANSWERS!</span>
              </li>
            </ul>
          </div>

          {highScore > 0 && (
            <p className="text-xs text-[#94b0c2]">
              HIGH SCORE: <span className="text-[#ffcd75]">{highScore}</span>
            </p>
          )}

          <button
            onClick={startGame}
            className="pixel-btn w-full py-4 bg-[#38b764] text-[#1a1c2c] text-sm font-bold"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  const isRevealing = gameState === 'correct' || gameState === 'wrong';
  const isCounting = gameState === 'counting';

  return (
    <div className="h-dvh bg-[#1a1c2c] flex flex-col overflow-hidden scanlines relative">
      {/* Header */}
      <header className="shrink-0 p-4 mt-2 flex items-center justify-between max-w-md mx-auto w-full">
        <h1 className="text-sm font-bold text-[#ffcd75] drop-shadow-[2px_2px_0_#000]">HS3</h1>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-[#94b0c2]">SCORE:</span>
            <span className="text-[#38b764] ml-1">{score}</span>
          </div>
          <div>
            <span className="text-[#94b0c2]">BEST:</span>
            <span className="text-[#ffcd75] ml-1">{highScore}</span>
          </div>
        </div>
      </header>

      {/* Game area */}
      <main className="flex-1 flex flex-col items-center justify-between p-3 py-2 gap-2 max-w-md mx-auto w-full overflow-y-auto">
        {/* Divider */}
        <div className="w-full h-1 bg-[#3b5dc9] shrink-0" />

        {/* Top card */}
        <div className={`w-full transition-opacity duration-300 ${isSliding ? 'opacity-0' : 'opacity-100'}`}>
          {isRevealing ? (
            <div className={`
              pixel-card p-4 w-full
              ${gameState === 'correct' 
                ? 'bg-[#38b764]' 
                : 'bg-[#b13e53]'}
            `}>
              <div className="flex gap-3 items-center w-full">
                {/* Spacer matching map size exactly */}
                <div className="shrink-0 w-36 aspect-3/4 flex items-center justify-center bg-[#1a1c2c] border-4 border-black">
                  <span className="text-4xl">{gameState === 'correct' ? '✓' : '✗'}</span>
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#1a1c2c]">
                    {gameState === 'correct' ? 'CORRECT!' : 'WRONG!'}
                  </div>
                  <div className="text-xs text-[#1a1c2c] mt-2">
                    {score} IN A ROW
                  </div>
                  {score === highScore && score > 0 && (
                    <div className="text-xs text-[#ffcd75] mt-2">★ NEW BEST! ★</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            currentRoute && <RouteCard route={currentRoute} showTime={true} />
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-1 bg-[#3b5dc9] shrink-0" />

        {/* Bottom card */}
        <div className={`w-full transition-opacity duration-300 ${isSliding ? 'opacity-0' : 'opacity-100'}`}>
          {nextRoute && (
            <RouteCard
              route={nextRoute}
              showTime={isCounting || isRevealing}
              isRevealing={isRevealing}
              displayTime={isCounting ? countingValue : undefined}
            />
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-1 bg-[#3b5dc9] shrink-0" />

        {/* Buttons */}
        <div className="flex gap-3 w-full shrink-0 mt-2 mb-4">
          {isRevealing ? (
            gameState === 'correct' ? (
              <button
                onClick={continueGame}
                className="pixel-btn flex-1 py-4 bg-[#41a6f6] text-[#1a1c2c] text-xs font-bold"
              >
                NEXT ►
              </button>
            ) : (
              <button
                onClick={startGame}
                className="pixel-btn flex-1 py-4 bg-[#41a6f6] text-[#1a1c2c] text-xs font-bold"
              >
                RETRY
              </button>
            )
          ) : (
            <>
              <button
                onClick={() => handleGuess(true)}
                disabled={isCounting}
                className={`pixel-btn flex-1 py-4 text-xs font-bold ${
                  isCounting 
                    ? 'bg-[#566c86] text-[#333c57] cursor-not-allowed' 
                    : 'bg-[#38b764] text-[#1a1c2c]'
                }`}
              >
                ▲ HIGHER
              </button>
              <button
                onClick={() => handleGuess(false)}
                disabled={isCounting}
                className={`pixel-btn flex-1 py-4 text-xs font-bold ${
                  isCounting 
                    ? 'bg-[#566c86] text-[#333c57] cursor-not-allowed' 
                    : 'bg-[#b13e53] text-[#f4f4f4]'
                }`}
              >
                ▼ LOWER
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
