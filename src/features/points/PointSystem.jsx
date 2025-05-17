// src/features/points/PointSystem.jsx (Opción B - Tarjeta de Puntos)
import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

const PointSystem = ({ points, transactions = [] }) => {
  const { theme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calcular estadísticas
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return { totalEarned: 0, totalSpent: 0, biggestGain: 0, biggestLoss: 0 };
    }

    let totalEarned = 0;
    let totalSpent = 0;
    let biggestGain = 0;
    let biggestLoss = 0;

    transactions.forEach(t => {
      if (t.amount > 0) {
        totalEarned += t.amount;
        biggestGain = Math.max(biggestGain, t.amount);
      } else {
        totalSpent += Math.abs(t.amount);
        biggestLoss = Math.max(biggestLoss, Math.abs(t.amount));
      }
    });

    return { totalEarned, totalSpent, biggestGain, biggestLoss };
  };

  const stats = calculateStats();

  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Mis Puntos</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center px-3 py-1.5 rounded-lg transition-colors text-sm"
          style={{
            backgroundColor: showHistory ? 'var(--color-primary)' : 'var(--color-secondary)',
            color: showHistory ? 'white' : 'var(--color-text)',
          }}
        >
          <span className="mr-1">{showHistory ? '📊' : '📋'}</span>
          {showHistory ? 'Ver Resumen' : 'Ver Historial'}
        </button>
      </div>

      {!showHistory ? (
        <>
          {/* Tarjeta de puntos */}
          <div className="mb-6 p-4 rounded-lg" style={{
            background: `linear-gradient(135deg, ${theme === THEMES.GOTHIC ? '#333, #111' : '#f9d423, #ff4e50'})`,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white opacity-80 font-medium">PUNTOS DOORSUFFER</span>
              <span className="text-4xl">🏆</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-white">{points}</span>
              <span className="ml-2 text-white opacity-80">pts</span>
            </div>
            <div className="mt-6 text-xs text-white opacity-70">Canjéalos en la tienda de recompensas</div>
          </div>

          {/* Estadísticas de puntos */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg" style={{
              backgroundColor: theme === THEMES.GOTHIC ? '#222' : '#f3f4f6',
            }}>
              <div className="text-sm opacity-70">Total ganado</div>
              <div className="text-2xl font-bold text-green-500">+{stats.totalEarned}</div>
            </div>
            <div className="p-3 rounded-lg" style={{
              backgroundColor: theme === THEMES.GOTHIC ? '#222' : '#f3f4f6',
            }}>
              <div className="text-sm opacity-70">Total gastado</div>
              <div className="text-2xl font-bold text-red-500">-{stats.totalSpent}</div>
            </div>
          </div>

          {/* Gráfico de tendencia */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Últimas Transacciones</h3>
            <div className="h-16 flex items-end space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              {transactions.length === 0 ? (
                <div className="w-full text-center text-sm italic opacity-70 py-4">
                  No hay transacciones para mostrar
                </div>
              ) : (
                transactions.slice(-10).map((transaction, index) => (
                  <div 
                    key={index}
                    className="w-full flex-1 rounded-t-sm hover:opacity-100 transition-all"
                    style={{
                      position: 'relative',
                      height: `${Math.min(100, Math.abs(transaction.amount) * 1.5)}%`,
                      backgroundColor: transaction.amount > 0 
                        ? 'rgba(16, 185, 129, 0.8)' // verde
                        : 'rgba(239, 68, 68, 0.8)', // rojo
                    }}
                    title={`${transaction.description}: ${transaction.amount > 0 ? '+' : ''}${transaction.amount} pts`}
                  ></div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Historial de puntos */
        <div className="mt-2">
          <div className="max-h-80 overflow-y-auto pr-2 space-y-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-secondary) transparent'
          }}>
            {transactions.length === 0 ? (
              <p className="text-center py-4 italic opacity-70">
                No hay transacciones registradas
              </p>
            ) : (
              transactions.slice().reverse().map((transaction, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg flex justify-between items-center"
                  style={{ 
                    backgroundColor: theme === THEMES.GOTHIC ? '#222' : '#f9fafb',
                    borderLeft: '4px solid',
                    borderColor: transaction.amount > 0 
                      ? (theme === THEMES.GOTHIC ? '#4b7340' : '#10b981')
                      : (theme === THEMES.GOTHIC ? '#8f0e0e' : '#ef4444')
                  }}
                >
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs opacity-70">{formatDate(transaction.timestamp)}</p>
                  </div>
                  <span className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PointSystem;