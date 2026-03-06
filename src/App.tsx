import React, { useState, useEffect } from 'react';
import { createDeck, shuffle, evaluateHand, compareResults, getBullName, Card, HandResult } from './utils/gameLogic';
import { CardView } from './components/CardView';
import { Share2, RotateCcw, Play, Eye, Users, Trophy, Settings, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Opponent {
  id: number;
  hand: Card[];
  result: HandResult | null;
  score: number;
}

export default function App() {
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [targetScore, setTargetScore] = useState(3);
  const [opponentCount, setOpponentCount] = useState(1);
  
  const [deck, setDeck] = useState<Card[]>([]);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playerResult, setPlayerResult] = useState<HandResult | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'dealt' | 'revealed'>('idle');
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [overallWinners, setOverallWinners] = useState<string[]>([]);

  const [showShareModal, setShowShareModal] = useState(false);

  const initGame = (count: number) => {
    setDeck(shuffle(createDeck()));
    setOpponents(Array.from({ length: count }).map((_, i) => ({
      id: i + 1,
      hand: [],
      result: null,
      score: 0
    })));
    setPlayerScore(0);
    setGameState('idle');
    setPlayerHand([]);
    setWinnerIds([]);
    setOverallWinners([]);
  };

  const startMatch = () => {
    initGame(opponentCount);
    setGamePhase('playing');
  };

  const startRound = () => {
    let currentDeck = deck;
    const totalNeeded = (opponentCount + 1) * 5;
    if (currentDeck.length < totalNeeded) {
      currentDeck = shuffle(createDeck());
    }
    
    const newPlayerHand = currentDeck.slice(0, 5);
    const newOpponents = opponents.map((opp, i) => ({
      ...opp,
      hand: currentDeck.slice(5 + i * 5, 10 + i * 5),
      result: null
    }));
    
    setPlayerHand(newPlayerHand);
    setOpponents(newOpponents);
    setDeck(currentDeck.slice(totalNeeded));
    setGameState('dealt');
    setPlayerResult(null);
    setWinnerIds([]);
  };

  const revealCards = () => {
    const pResult = evaluateHand(playerHand);
    const oResults = opponents.map(o => evaluateHand(o.hand));
    
    let bestResult = pResult;
    let currentWinnerIds = ['player'];
    
    oResults.forEach((res, idx) => {
      const cmp = compareResults(res, bestResult);
      if (cmp > 0) {
        bestResult = res;
        currentWinnerIds = [`opponent-${idx}`];
      } else if (cmp === 0) {
        currentWinnerIds.push(`opponent-${idx}`);
      }
    });
    
    setPlayerResult(pResult);
    setWinnerIds(currentWinnerIds);
    
    let newPlayerScore = playerScore;
    if (currentWinnerIds.includes('player')) {
      newPlayerScore += 1;
      setPlayerScore(newPlayerScore);
    }
    
    const newOpponents = opponents.map((opp, i) => {
      const isWinner = currentWinnerIds.includes(`opponent-${i}`);
      return {
        ...opp,
        result: oResults[i],
        score: isWinner ? opp.score + 1 : opp.score
      };
    });
    setOpponents(newOpponents);
    setGameState('revealed');

    // Check for match winner
    const matchWinners: string[] = [];
    if (newPlayerScore >= targetScore) matchWinners.push('player');
    newOpponents.forEach((opp, i) => {
      if (opp.score >= targetScore) matchWinners.push(`opponent-${i}`);
    });

    if (matchWinners.length > 0) {
      setOverallWinners(matchWinners);
      setTimeout(() => {
        setGamePhase('gameover');
      }, 2000); // Show results for 2 seconds before game over screen
    }
  };

  const returnToSetup = () => {
    setGamePhase('setup');
  };

  const shareGame = () => {
    setShowShareModal(true);
  };

  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-emerald-800 text-white font-sans flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-900/80 p-8 rounded-3xl shadow-2xl border border-emerald-500/30 max-w-md w-full text-center"
        >
          <h1 className="text-4xl font-black tracking-wider text-yellow-400 drop-shadow-md mb-8">欢乐斗牛</h1>
          
          <div className="space-y-6 text-left">
            <div className="bg-black/20 p-4 rounded-xl">
              <label className="flex items-center gap-2 text-emerald-200 font-bold mb-3">
                <Users size={20} /> 对手数量
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setOpponentCount(num)}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      opponentCount === num 
                        ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                        : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
                    }`}
                  >
                    {num} 人
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-xl">
              <label className="flex items-center gap-2 text-emerald-200 font-bold mb-3">
                <Trophy size={20} /> 目标分数 (赢几局结束)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 10, 15].map(num => (
                  <button
                    key={num}
                    onClick={() => setTargetScore(num)}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      targetScore === num 
                        ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                        : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
                    }`}
                  >
                    {num} 局
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startMatch}
            className="mt-8 w-full py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold rounded-xl shadow-xl text-xl flex items-center justify-center gap-2 hover:from-yellow-300 hover:to-yellow-500 transition-all border-2 border-yellow-200"
          >
            <Play fill="currentColor" /> 开始对局
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (gamePhase === 'gameover') {
    const isPlayerWinner = overallWinners.includes('player');
    return (
      <div className="min-h-screen bg-emerald-800 text-white font-sans flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-900/90 p-8 rounded-3xl shadow-2xl border border-yellow-500/50 max-w-lg w-full text-center relative overflow-hidden"
        >
          {isPlayerWinner && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle,rgba(250,204,21,0.8)_0%,transparent_70%)] animate-pulse"></div>
            </div>
          )}
          
          <Trophy size={64} className={`mx-auto mb-4 ${isPlayerWinner ? 'text-yellow-400' : 'text-gray-400'}`} />
          
          <h2 className={`text-4xl font-black mb-2 ${isPlayerWinner ? 'text-yellow-400' : 'text-white'}`}>
            {isPlayerWinner ? '恭喜你，获得最终胜利！' : '很遗憾，你输了'}
          </h2>
          
          <p className="text-emerald-200 mb-8">
            {overallWinners.length > 1 && isPlayerWinner ? '(平局胜利)' : ''}
            {!isPlayerWinner && `获胜者: 对手 ${overallWinners.map(id => parseInt(id.split('-')[1]) + 1).join(', ')}`}
          </p>

          <div className="bg-black/30 rounded-xl p-4 mb-8">
            <h3 className="text-lg font-bold text-emerald-300 mb-3 border-b border-emerald-700/50 pb-2">最终得分</h3>
            <div className="flex flex-col gap-2 text-left">
              <div className={`flex justify-between items-center p-2 rounded ${isPlayerWinner ? 'bg-yellow-500/20 text-yellow-400 font-bold' : 'text-white'}`}>
                <span>你</span>
                <span className="text-xl">{playerScore}</span>
              </div>
              {opponents.map((opp, i) => {
                const isOppWinner = overallWinners.includes(`opponent-${i}`);
                return (
                  <div key={opp.id} className={`flex justify-between items-center p-2 rounded ${isOppWinner ? 'bg-yellow-500/20 text-yellow-400 font-bold' : 'text-gray-300'}`}>
                    <span>对手 {opp.id}</span>
                    <span className="text-xl">{opp.score}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startMatch}
              className="px-6 py-3 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold rounded-full shadow-lg flex items-center gap-2"
            >
              <RotateCcw size={20} /> 再来一局
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={returnToSetup}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg flex items-center gap-2 border border-emerald-500"
            >
              <Settings size={20} /> 重新设置
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-800 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="p-4 flex flex-wrap justify-between items-center gap-4 bg-emerald-900/50 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-yellow-400 drop-shadow-md">欢乐斗牛</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-800/80 rounded-full px-4 py-1.5 border border-emerald-600">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-sm font-bold text-emerald-100">目标: {targetScore} 局</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={returnToSetup}
            className="p-2 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors"
            title="返回设置"
          >
            <Home size={20} />
          </button>
          <button 
            onClick={shareGame}
            className="p-2 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors flex items-center gap-2 px-4"
          >
            <Share2 size={20} />
            <span className="hidden sm:inline text-sm font-medium">分享给家人</span>
          </button>
        </div>
      </header>

      {/* Score Board - Horizontal */}
      <div className="bg-black/40 border-b border-white/10 p-2 sm:p-3 flex justify-center gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap shadow-inner w-full">
        <div className="flex items-center gap-2 bg-emerald-900/50 px-4 py-1.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(250,204,21,0.1)]">
          <span className="text-emerald-200 text-sm font-bold">你:</span>
          <span className="text-yellow-400 font-mono font-black text-xl">{playerScore}</span>
        </div>
        {opponents.map(opp => (
          <div key={opp.id} className="flex items-center gap-2 bg-emerald-900/50 px-4 py-1.5 rounded-full border border-emerald-500/30">
            <span className="text-emerald-200 text-sm font-bold">对手 {opp.id}:</span>
            <span className="text-white font-mono font-bold text-xl">{opp.score}</span>
          </div>
        ))}
      </div>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 max-w-6xl mx-auto w-full relative">
        
        {/* Opponents Area */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-4 sm:mt-0">
          {opponents.map((opp, idx) => {
            const isWinner = gameState === 'revealed' && winnerIds.includes(`opponent-${idx}`);
            const isLoser = gameState === 'revealed' && !isWinner;
            
            return (
              <div key={opp.id} className={`flex flex-col items-center relative transition-all duration-500 ${isWinner ? 'scale-110 z-10' : ''} ${isLoser ? 'opacity-50 scale-95' : ''}`}>
                {isWinner && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 text-yellow-400 font-black text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-bounce whitespace-nowrap z-20"
                  >
                    🏆 胜
                  </motion.div>
                )}
                <div className="text-emerald-200 text-sm mb-2 font-bold flex items-center gap-1">
                  对手 {opp.id}
                </div>
                <div className={`flex justify-center gap-1 sm:gap-2 h-24 sm:h-32 p-2 rounded-xl transition-all ${isWinner ? 'bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.4)] border border-yellow-400/50' : ''}`}>
                  <AnimatePresence>
                    {opp.hand.map((card, cIdx) => (
                      <CardView 
                        key={`opp-${opp.id}-${cIdx}`} 
                        card={card} 
                        faceUp={gameState === 'revealed'} 
                        highlighted={gameState === 'revealed' && opp.result?.highlightIndices.includes(cIdx)}
                        index={cIdx}
                        size={opponentCount > 2 ? 'sm' : 'md'}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {gameState === 'revealed' && opp.result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-2 px-3 py-1 rounded-full border font-bold text-sm sm:text-base shadow-[0_0_10px_rgba(0,0,0,0.5)]
                      ${isWinner ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 'bg-black/60 border-gray-500/30 text-gray-300'}
                    `}
                  >
                    {getBullName(opp.result.bullValue)}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Center Action Area */}
        <div className="flex flex-col items-center justify-center my-8 min-h-[120px]">
          {gameState === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRound}
              className="px-8 py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold rounded-full shadow-xl text-xl flex items-center gap-2 hover:from-yellow-300 hover:to-yellow-500 transition-all border-2 border-yellow-200"
            >
              <Play fill="currentColor" /> 发牌
            </motion.button>
          )}

          {gameState === 'dealt' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={revealCards}
              className="px-8 py-4 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold rounded-full shadow-xl text-xl flex items-center gap-2 hover:from-blue-400 hover:to-blue-600 transition-all border-2 border-blue-300"
            >
              <Eye /> 开牌比大小
            </motion.button>
          )}

          {gameState === 'revealed' && overallWinners.length === 0 && (
            <div className="flex flex-col items-center gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl sm:text-4xl font-black tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-center
                  ${winnerIds.includes('player') ? 'text-yellow-400' : 'text-red-400'}
                `}
              >
                {winnerIds.includes('player') && winnerIds.length === 1 
                  ? '你赢了！' 
                  : winnerIds.includes('player') 
                    ? '平局 (你与对手同分)' 
                    : `对手 ${winnerIds.map(id => parseInt(id.split('-')[1]) + 1).join(', ')} 赢了`}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRound}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full backdrop-blur-sm transition-all border border-white/30"
              >
                下一局
              </motion.button>
            </div>
          )}
          
          {gameState === 'revealed' && overallWinners.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl font-bold text-yellow-400 animate-pulse"
            >
              比赛结束！结算中...
            </motion.div>
          )}
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center mb-4 sm:mb-0">
          {(() => {
            const isPlayerWinner = gameState === 'revealed' && winnerIds.includes('player');
            const isPlayerLoser = gameState === 'revealed' && !isPlayerWinner;
            
            return (
              <div className={`flex flex-col items-center relative transition-all duration-500 ${isPlayerWinner ? 'scale-110 z-10' : ''} ${isPlayerLoser ? 'opacity-50 scale-95' : ''}`}>
                {isPlayerWinner && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 text-yellow-400 font-black text-2xl sm:text-3xl drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce whitespace-nowrap z-20"
                  >
                    🏆 本局获胜
                  </motion.div>
                )}
                
                {gameState === 'revealed' && playerResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mb-2 px-6 py-2 rounded-full border font-bold text-xl shadow-[0_0_15px_rgba(0,0,0,0.5)]
                      ${isPlayerWinner ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 'bg-black/60 border-gray-500/30 text-gray-300'}
                    `}
                  >
                    你: {getBullName(playerResult.bullValue)}
                  </motion.div>
                )}
                
                <div className={`flex justify-center gap-2 sm:gap-4 h-36 p-4 rounded-2xl transition-all ${isPlayerWinner ? 'bg-yellow-400/20 shadow-[0_0_30px_rgba(250,204,21,0.4)] border border-yellow-400/50' : ''}`}>
                  <AnimatePresence>
                    {playerHand.map((card, idx) => (
                      <CardView 
                        key={`player-${idx}`} 
                        card={card} 
                        faceUp={true} 
                        highlighted={gameState === 'revealed' && playerResult?.highlightIndices.includes(idx)}
                        index={idx}
                        size="lg"
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="mt-2 text-emerald-200 font-bold text-lg flex items-center gap-2">
                  你的牌
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-emerald-900 border border-emerald-500/50 p-6 rounded-2xl shadow-2xl max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Share2 size={24} /> 分享给家人
              </h3>
              
              <div className="bg-white p-4 rounded-xl text-black text-left space-y-3 mb-6 max-h-64 overflow-y-auto">
                <p className="font-bold text-emerald-700 text-lg border-b pb-2">📱 平板专属部署教程 (免电脑)</p>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-blue-700">第一步：注册 GitHub 并建库</p>
                    <p className="text-gray-700 mt-1">在平板浏览器打开 <a href="https://github.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">GitHub</a>，注册账号。点击右上角 "+" 选择 "New repository"，随便起个名字（比如 douniu），点击 "Create repository"。</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-blue-700">第二步：直接在网页上建文件</p>
                    <p className="text-gray-700 mt-1">在新建的仓库页面，点击 "creating a new file"。您需要建几个核心文件（比如 package.json, src/App.tsx 等）。您可以直接让我把代码发给您，您复制粘贴进去，然后点击 "Commit changes" 保存。</p>
                  </div>

                  <div>
                    <p className="font-bold text-blue-700">第三步：用 Vercel 一键发布</p>
                    <p className="text-gray-700 mt-1">打开 <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">Vercel</a>，选择 "Continue with GitHub" 登录。点击 "Add New" → "Project"，导入您刚才建的 GitHub 仓库，直接点击 "Deploy"。</p>
                  </div>

                  <div>
                    <p className="font-bold text-blue-700">第四步：获取新链接</p>
                    <p className="text-gray-700 mt-1">等大概1分钟，Vercel 会给您生成一个全新的网址。把这个网址发到微信，家人就能直接点开了！</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold transition-colors border border-emerald-600"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
