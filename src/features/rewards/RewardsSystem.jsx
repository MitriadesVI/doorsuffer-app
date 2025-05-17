// src/features/rewards/RewardsSystem.jsx
import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

// --- Helper para generar IDs ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

// --- Subcomponentes para claridad ---

// Tarjeta para recompensa canjeable de la tienda (predefinida)
const RedeemableStoreRewardCard = ({ reward, userPoints, onRedeem, theme }) => {
  const canAfford = userPoints >= reward.cost;
  return (
    <div className="p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300" style={{
      borderWidth: '1px',
      borderColor: 'var(--color-secondary)',
      backgroundColor: theme === THEMES.GOTHIC ? '#252525' : (theme === THEMES.ARTNOUVEAU ? '#fdf6e3' : '#f9fafb'),
    }}>
      <div className="flex items-start mb-3">
        {reward.icon && <span className="text-3xl mr-3 mt-1 flex-shrink-0 transform group-hover:scale-110 transition-transform">{reward.icon}</span>}
        <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg leading-tight" style={{color: 'var(--color-text)'}}>{reward.title}</h4>
            {reward.vendor && <p className="text-xs opacity-60">Vendido por: {reward.vendor}</p>}
        </div>
        <div className="text-xl font-bold whitespace-nowrap" style={{color: 'var(--color-accent)'}}>{reward.cost} pts</div>
      </div>
      <p className="text-sm opacity-80 mb-3 line-clamp-3 h-12" style={{color: 'var(--color-text-secondary)'}}>{reward.description}</p> {/* Altura fija para consistencia */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2 mt-auto pt-2 border-t" style={{borderColor: 'var(--color-border-light)'}}>
        {reward.expiresAt && <span className="opacity-70" style={{color: 'var(--color-text-secondary)'}}>Válido hasta: {new Date(reward.expiresAt).toLocaleDateString()}</span>}
        <button 
          className="py-1.5 px-4 rounded-lg text-white font-medium text-sm w-full sm:w-auto transition-all hover:brightness-110"
          style={{
            backgroundColor: canAfford ? 'var(--color-primary)' : 'var(--color-secondary-disabled, #9ca3af)', 
            opacity: canAfford ? 1 : 0.7,
            cursor: canAfford ? 'pointer' : 'not-allowed'
          }}
          disabled={!canAfford}
          onClick={() => onRedeem(reward)}
        >
          {canAfford ? 'Canjear' : `Faltan ${reward.cost - userPoints} pts`}
        </button>
      </div>
    </div>
  );
};

// Tarjeta para recompensa creada por el usuario
const UserCreatedRewardCard = ({ reward, userPoints, onRedeem, onDelete, onRetry, theme }) => {
  const canAfford = userPoints >= reward.cost;
  const isExpired = reward.deadline && new Date(reward.deadline) < new Date() && !reward.claimed;
  const canRedeem = canAfford && !isExpired && !reward.claimed;

  const cardStyle = {
    borderWidth: '2px', // Borde más grueso para destacar
    borderColor: reward.claimed ? 'var(--color-secondary-disabled)' : (isExpired ? 'var(--color-error-border, #f87171)' : 'var(--color-primary)'),
    backgroundColor: theme === THEMES.GOTHIC ? 
      (reward.claimed ? '#2a2a2a' : (isExpired ? '#3a2525' : '#252b35')) :
      (reward.claimed ? '#e9ecef' : (isExpired ? '#ffe4e6' : '#eef2ff')), // Colores de fondo más distintivos
    opacity: reward.claimed ? 0.65 : 1,
    position: 'relative' // Para el botón de eliminar absoluto
  };

  return (
    <div className="p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col" style={cardStyle}> {/* flex flex-col */}
      <div className="flex items-start mb-3">
        <span className="text-4xl mr-3.5 mt-0.5 flex-shrink-0">{reward.icon || '🎯'}</span> {/* Icono por defecto más temático */}
        <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-lg leading-tight ${reward.claimed ? 'line-through' : ''}`} style={{color: reward.claimed ? 'var(--color-text-disabled)' : 'var(--color-text)'}}>
              {reward.title}
            </h4>
        </div>
        {!reward.claimed && !isExpired && (
          <div className="text-xl font-bold whitespace-nowrap" style={{color: 'var(--color-accent)'}}>{reward.cost} pts</div>
        )}
        {isExpired && !reward.claimed && ( // Asegurarse que no esté reclamada para mostrar expirado
           <span className="text-sm font-semibold px-2.5 py-1 rounded-full shadow-sm" style={{backgroundColor: 'var(--color-error)', color: 'white'}}>Expirado</span>
        )}
        {reward.claimed && (
           <span className="text-sm font-semibold px-2.5 py-1 rounded-full shadow-sm" style={{backgroundColor: 'var(--color-success-accent)', color: 'var(--color-success-text)'}}>Canjeado</span>
        )}
      </div>
      <p className={`text-sm opacity-80 mb-3 line-clamp-3 flex-grow ${reward.claimed ? 'line-through' : ''}`} style={{color: reward.claimed ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)'}}> {/* flex-grow */}
        {reward.description}
      </p>
      
      {reward.deadline && !reward.claimed && (
        <p className={`text-xs mb-2 ${isExpired ? 'text-red-600 font-semibold' : 'opacity-70'}`}>
          Plazo: {new Date(reward.deadline).toLocaleDateString()} {isExpired ? '(Expiró)' : `(Faltan ${Math.max(0, Math.ceil((new Date(reward.deadline) - new Date()) / (1000 * 60 * 60 * 24)))} días)`}
        </p>
      )}
      
      <div className="mt-auto pt-3 border-t" style={{borderColor: 'var(--color-border-light)'}}> {/* Contenedor para botones */}
        {!reward.claimed && !isExpired && (
          <button 
            className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition-all hover:brightness-110"
            style={{
              backgroundColor: canRedeem ? 'var(--color-primary)' : 'var(--color-secondary-disabled, #9ca3af)', 
              opacity: canRedeem ? 1 : 0.7,
              cursor: canRedeem ? 'pointer' : 'not-allowed'
            }}
            disabled={!canRedeem}
            onClick={() => onRedeem(reward)}
          >
            {canRedeem ? 'Canjear Ahora' : (canAfford ? 'Expirado' : `Faltan ${reward.cost - userPoints} pts`)}
          </button>
        )}
        
        {isExpired && !reward.claimed && ( // Asegurarse que no esté reclamada para mostrar reintento
          <div className="mt-2 text-center">
            <p className="text-sm mb-2" style={{color: 'var(--color-text-secondary)'}}>Esta recompensa ha expirado.</p>
            <button 
              onClick={() => onRetry(reward)} // Pasar el objeto reward completo
              className="text-sm py-1.5 px-3.5 rounded-md font-medium transition-colors hover:brightness-110"
              style={{color: 'var(--color-primary-text, var(--color-primary))', backgroundColor: 'var(--color-primary-accent)'}}
            >
              ¿Lo intentamos otra vez? (Recrear)
            </button>
          </div>
        )}
      </div>

      {!reward.claimed && (
          <button 
            onClick={() => onDelete(reward.id)}
            className="absolute top-2 right-2 text-xl p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-red-500 dark:text-red-400 transition-colors"
            title="Eliminar esta recompensa"
          >
            ×
          </button>
      )}
    </div>
  );
};
// --- Fin Subcomponentes ---


const RewardsSystem = ({ goals, completedGoalsCount, onRewardClaimed, points = 0, onSpendPoints, notify }) => {
  const { theme } = useTheme();
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedThresholdRewards, setClaimedThresholdRewards] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_claimedThresholdRewards');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [userCreatedRewards, setUserCreatedRewards] = useState(() => {
    const saved = localStorage.getItem('doorsuffer_userCreatedRewards');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCreateRewardForm, setShowCreateRewardForm] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardDescription, setNewRewardDescription] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [newRewardDeadline, setNewRewardDeadline] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');
  const iconOptions = ['🎁', '⭐', '🎯', '💡', '🎉', '🏆', '🎮', '🍕', '✈️', '🛍️', '🧘', '🌿', '🎟️'];


  const thresholdRewardsList = [
    { id: 'reward_5_goals', title: 'Descanso Premium', description: 'Por completar 5 metas: Tómate un descanso de 30 minutos para hacer lo que quieras.', threshold: 5, icon: '🏆'},
    { id: 'reward_10_goals', title: 'Día de Película', description: 'Por completar 10 metas: Puedes ver una película o serie que hayas querido ver.', threshold: 10, icon: '🎬'},
    { id: 'reward_15_goals', title: 'Salida Especial', description: 'Por completar 15 metas: Planifica una salida especial a tu lugar favorito.', threshold: 15, icon: '🌟'},
    { id: 'reward_20_goals', title: 'Compra Deseada (Pequeña)', description: 'Por completar 20 metas: Permítete comprar algo pequeño que hayas querido.', threshold: 20, icon: '🛍️'},
    { id: 'reward_health_5', title: 'Maestro de la Salud', description: 'Por completar 5 metas de Salud Física: Una hora para tu actividad física favorita.', threshold: 5, category: 'Salud Física', icon: '💪'},
    { id: 'reward_mental_5', title: 'Paz Mental', description: 'Por completar 5 metas de Salud Mental: Una sesión de tu actividad relajante favorita.', threshold: 5, category: 'Salud Mental', icon: '🧘'},
    { id: 'reward_work_5', title: 'Profesional Destacado', description: 'Por completar 5 metas de Trabajo: Un descanso extendido en tu próxima jornada.', threshold: 5, category: 'Trabajo', icon: '💼'}
  ];

  // Lista de recompensas canjeables con puntos (Tienda de Puntos predefinida) - MODIFICADA
  const initialPointStoreRewards = [
    { 
      id: 'store_item_coffee', 
      title: 'Café Especial', 
      description: 'Disfruta de un café gourmet por la mañana, ¡te lo mereces!', 
      cost: 50, 
      icon: '☕',
      category: 'Pequeños Placeres'
    },
    { 
      id: 'store_item_book', 
      title: 'Libro Nuevo', 
      description: 'Compra ese libro que tanto quieres leer y sumérgete en otra historia.', 
      cost: 200, 
      icon: '📚',
      category: 'Cultura y Ocio',
      expiresAt: '2024-12-31'
    },
    { 
      id: 'store_item_game', 
      title: 'Videojuego Indie', 
      description: 'Adquiere un nuevo videojuego indie para tu colección y explora nuevos mundos.', 
      cost: 350, 
      icon: '🎮',
      category: 'Entretenimiento Digital'
    },
    { 
      id: 'store_item_delicious_dinner', // Cambiado
      title: 'Una Cena Deliciosa', 
      description: 'Pide tu comida favorita o cocina algo especial para una cena memorable.', 
      cost: 400, // Ajustar costo
      icon: '🍝', // Nuevo icono
      category: 'Gastronomía'
    },
    {
      id: 'store_item_series_chapter', // Cambiado
      title: 'Un Capítulo de Serie',
      description: 'Disfruta de un capítulo extra de tu serie favorita sin culpas.',
      cost: 75, // Ajustar costo
      icon: '📺', // Nuevo icono
      category: 'Entretenimiento'
    },
    {
      id: 'store_item_beer', // Cambiado
      title: 'Una Cerveza Fría',
      description: 'Relájate con una cerveza artesanal o tu marca preferida.',
      cost: 100, // Ajustar costo
      icon: '🍺', // Nuevo icono
      category: 'Relax'
    }
  ];
  // Estado para manejar las recompensas de la tienda, permitiendo futura "eliminación" visual
  const [pointStoreRewards, setPointStoreRewards] = useState(() => {
      const savedHidden = localStorage.getItem('doorsuffer_hiddenStoreRewards');
      const hiddenIds = savedHidden ? JSON.parse(savedHidden) : [];
      return initialPointStoreRewards.filter(r => !hiddenIds.includes(r.id));
  });
    // En el futuro, si se implementa la eliminación de storeRewards:
    // const hideStoreReward = (rewardId) => {
    //   const hiddenIds = JSON.parse(localStorage.getItem('doorsuffer_hiddenStoreRewards') || '[]');
    //   if (!hiddenIds.includes(rewardId)) {
    //     localStorage.setItem('doorsuffer_hiddenStoreRewards', JSON.stringify([...hiddenIds, rewardId]));
    //     setPointStoreRewards(prev => prev.filter(r => r.id !== rewardId));
    //     if (notify) notify("Recompensa ocultada de la tienda.", "info");
    //   }
    // };


  useEffect(() => {
    localStorage.setItem('doorsuffer_claimedThresholdRewards', JSON.stringify(claimedThresholdRewards));
  }, [claimedThresholdRewards]);

  useEffect(() => {
    localStorage.setItem('doorsuffer_userCreatedRewards', JSON.stringify(userCreatedRewards));
  }, [userCreatedRewards]);

  useEffect(() => {
    if (!goals || goals.length === 0) {
        setAvailableRewards(thresholdRewardsList.filter(reward => 
            !claimedThresholdRewards.includes(reward.id) && completedGoalsCount >= reward.threshold && !reward.category
        ));
        return;
    }
    const categoryCounts = {};
    goals.forEach(goal => {
      if (goal.completed) {
        categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
      }
    });
    const newAvailableRewards = thresholdRewardsList.filter(reward => {
      if (claimedThresholdRewards.includes(reward.id)) return false;
      if (reward.category) {
        return (categoryCounts[reward.category] || 0) >= reward.threshold;
      }
      return completedGoalsCount >= reward.threshold;
    });
    setAvailableRewards(newAvailableRewards);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, completedGoalsCount, claimedThresholdRewards]);

  const claimThresholdReward = (rewardId) => {
    setClaimedThresholdRewards(prev => [...prev, rewardId]);
    const reward = thresholdRewardsList.find(r => r.id === rewardId);
    if (reward) {
      if (onRewardClaimed) onRewardClaimed(reward);
      if (notify) notify(`¡Has reclamado la recompensa "${reward.title}"!`, 'success');
    }
  };

  const redeemStoreReward = (reward) => {
    if (points >= reward.cost) {
      if (onSpendPoints) {
        onSpendPoints(reward.cost, `Canje de recompensa: ${reward.title}`);
        if (notify) notify(`¡Has canjeado "${reward.title}" por ${reward.cost} puntos!`, 'success');
      }
    } else {
      if (notify) notify('No tienes suficientes puntos para canjear esta recompensa.', 'error');
    }
  };

  const handleCreateUserReward = (e) => {
    e.preventDefault();
    if (!newRewardTitle.trim() || !newRewardCost.trim()) {
      notify('El título y el costo en puntos son obligatorios.', 'error');
      return;
    }
    const cost = parseInt(newRewardCost, 10);
    if (isNaN(cost) || cost <= 0) {
      notify('El costo en puntos debe ser un número positivo.', 'error');
      return;
    }
    const newReward = {
      id: generateId(),
      title: newRewardTitle,
      description: newRewardDescription,
      cost: cost,
      deadline: newRewardDeadline || null,
      icon: newRewardIcon,
      claimed: false,
      createdAt: new Date().toISOString()
    };
    setUserCreatedRewards(prev => [...prev, newReward]);
    notify(`¡Recompensa "${newReward.title}" creada!`, 'success');
    // Reset form
    setNewRewardTitle('');
    setNewRewardDescription('');
    setNewRewardCost('');
    setNewRewardDeadline('');
    setNewRewardIcon('🎁');
    setShowCreateRewardForm(false);
  };

  const redeemUserCreatedReward = (rewardToRedeem) => {
     if (points >= rewardToRedeem.cost) {
      if (onSpendPoints) {
        onSpendPoints(rewardToRedeem.cost, `Canje de recompensa personalizada: ${rewardToRedeem.title}`);
        setUserCreatedRewards(prev => prev.map(r => r.id === rewardToRedeem.id ? {...r, claimed: true} : r));
        if (notify) notify(`¡Has canjeado tu recompensa "${rewardToRedeem.title}"!`, 'success');
      }
    } else {
      if (notify) notify('No tienes suficientes puntos para esta recompensa.', 'error');
    }
  };

  const deleteUserCreatedReward = (rewardId) => {
    setUserCreatedRewards(prev => prev.filter(r => r.id !== rewardId));
    notify('Recompensa personalizada eliminada.', 'info');
  };

  const retryUserCreatedReward = (expiredReward) => {
    // Pre-fill form to create a new one based on the expired one
    setNewRewardTitle(expiredReward.title);
    setNewRewardDescription(expiredReward.description);
    setNewRewardCost(String(expiredReward.cost));
    setNewRewardIcon(expiredReward.icon || '🎁');
    setNewRewardDeadline(''); // User sets new deadline
    setShowCreateRewardForm(true);
    // Remove the old, expired one
    // deleteUserCreatedReward(expiredReward.id); // Opcional: eliminarla al reintentar
    notify(`Formulario pre-llenado para recrear "${expiredReward.title}". Define un nuevo plazo si lo deseas.`, 'info');
  };
  
  const hasAnyContent = availableRewards.length > 0 || 
                        claimedThresholdRewards.length > 0 ||
                        pointStoreRewards.length > 0 ||
                        userCreatedRewards.length > 0 ||
                        thresholdRewardsList.filter(r => !claimedThresholdRewards.includes(r.id) && !availableRewards.find(ar => ar.id === r.id)).length > 0;


  if (!hasAnyContent && !showCreateRewardForm) {
     return (
      <section className="card p-6" style={{ 
        backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
        boxShadow: 'var(--box-shadow)',
        borderRadius: 'var(--border-radius)',
        borderColor: 'var(--color-secondary)',
        borderWidth: '1px'
      }}>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Tienda de Recompensas</h2>
            <div className="px-3 py-1.5 rounded-lg text-white font-medium flex items-center shadow"
                 style={{backgroundColor: 'var(--color-accent)'}}>
              <span className="mr-1.5 text-lg">💰</span>
              <span>{points} pts</span>
            </div>
        </div>
        <div className="p-4 py-8 text-center opacity-80">
          <p className="text-lg mb-2">¡Bienvenido a la Tienda de Recompensas!</p>
          <p className="mb-4">Aquí puedes canjear puntos por recompensas predefinidas o crear las tuyas propias.</p>
          <p>Completa metas para ganar recompensas automáticas y puntos.</p>
          <button 
            onClick={() => setShowCreateRewardForm(true)}
            className="mt-6 py-2 px-5 rounded-lg text-white font-semibold transition-transform hover:scale-105"
            style={{backgroundColor: 'var(--color-primary)'}}
            >
            ✨ Crear Mi Primera Recompensa Personalizada
          </button>
        </div>
      </section>
    );
  }


  return (
    <section className="card p-6" style={{ 
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    }}>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Tienda de Recompensas</h2>
        <div className="flex gap-2 items-center">
            <button
                onClick={() => setShowCreateRewardForm(!showCreateRewardForm)}
                className={`py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition-colors hover:brightness-110 ${showCreateRewardForm ? 'bg-red-500 text-white' : 'text-white'}`}
                style={{backgroundColor: showCreateRewardForm ? 'var(--color-error)' : 'var(--color-primary)'}}
            >
                {showCreateRewardForm ? 'Cancelar Creación' : '🎯 Crear Recompensa'}
            </button>
            <div className="px-3 py-1.5 rounded-lg text-white font-medium flex items-center shadow"
                style={{backgroundColor: 'var(--color-accent)'}}>
                <span className="mr-1.5 text-lg">💰</span>
                <span>{points} pts disponibles</span>
            </div>
        </div>
      </div>
      
      {/* --- Formulario para crear recompensa personalizada --- */}
      {showCreateRewardForm && (
        <form onSubmit={handleCreateUserReward} className="mb-8 p-5 border rounded-lg shadow-lg" style={{borderColor: 'var(--color-primary-accent)', backgroundColor: theme === THEMES.GOTHIC ? '#2d2d2d' : '#fdfdff'}}>
          <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--color-primary)'}}>Crear Nueva Recompensa Personalizada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor="newRewardTitle" className="block text-sm font-medium mb-1">Título <span className="text-red-500">*</span></label>
              <input type="text" id="newRewardTitle" value={newRewardTitle} onChange={e => setNewRewardTitle(e.target.value)} required 
                     className="w-full p-2 border rounded" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}/>
            </div>
            <div>
              <label htmlFor="newRewardCost" className="block text-sm font-medium mb-1">Costo en Puntos <span className="text-red-500">*</span></label>
              <input type="number" id="newRewardCost" value={newRewardCost} onChange={e => setNewRewardCost(e.target.value)} required min="1"
                     className="w-full p-2 border rounded" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}/>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="newRewardDescription" className="block text-sm font-medium mb-1">Descripción</label>
            <textarea id="newRewardDescription" value={newRewardDescription} onChange={e => setNewRewardDescription(e.target.value)} rows="2"
                      className="w-full p-2 border rounded" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="newRewardDeadline" className="block text-sm font-medium mb-1">Plazo (Opcional)</label>
                <input type="date" id="newRewardDeadline" value={newRewardDeadline} onChange={e => setNewRewardDeadline(e.target.value)} 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border rounded" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}/>
            </div>
            <div>
                <label htmlFor="newRewardIcon" className="block text-sm font-medium mb-1">Icono</label>
                <select id="newRewardIcon" value={newRewardIcon} onChange={e => setNewRewardIcon(e.target.value)}
                        className="w-full p-2 border rounded" style={{borderColor:'var(--color-border)', backgroundColor: 'var(--color-input-bg)', color:'var(--color-text)'}}>
                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 px-4 rounded-lg text-white font-semibold transition-transform hover:scale-102" style={{backgroundColor: 'var(--color-primary)'}}>
            Guardar Mi Recompensa
          </button>
        </form>
      )}

      {/* --- Mis Recompensas Personalizadas --- */}
      {userCreatedRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b" style={{borderColor: 'var(--color-secondary-accent)', color: 'var(--color-text)'}}>
            Mis Metas de Recompensa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userCreatedRewards.sort((a,b) => (a.claimed ? 1 : -1) || (isExpired(a) ? 1 : -1) || new Date(a.createdAt) - new Date(b.createdAt)).map(reward => ( // Helper isExpired
                 <UserCreatedRewardCard 
                    key={reward.id}
                    reward={reward}
                    userPoints={points}
                    onRedeem={redeemUserCreatedReward}
                    onDelete={deleteUserCreatedReward}
                    onRetry={retryUserCreatedReward}
                    theme={theme}
                 />
            ))}
          </div>
        </div>
      )}
      
      {availableRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 pb-2 border-b" style={{borderColor: 'var(--color-secondary-accent)', color: 'var(--color-text)'}}>
            Recompensas Ganadas (Automáticas)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map(reward => (
              <div 
                key={reward.id} 
                className="p-4 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl shadow-md"
                style={{
                  borderWidth: '1px',
                  borderColor: 'var(--color-success)',
                  backgroundColor: theme === THEMES.GOTHIC ? '#2c3e2c' : (theme === THEMES.ARTNOUVEAU ? '#f0fff0' : '#f0fff4'),
                }}
              >
                <div className="flex items-start mb-2">
                  <span className="text-3xl mr-3.5 mt-0.5 flex-shrink-0">{reward.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg leading-tight" style={{color: 'var(--color-success-dark, var(--color-success))'}}>{reward.title}</h4>
                    <p className="text-sm mt-1 opacity-80 line-clamp-3 h-12" style={{color: 'var(--color-text-secondary)'}}>{reward.description}</p>
                  </div>
                </div>
                <div className="flex justify-end items-center mt-3 pt-2 border-t" style={{borderColor: 'var(--color-border-light)'}}>
                   <span className="text-xs italic mr-3 opacity-70" style={{color: 'var(--color-success-dark)'}}>¡Desbloqueada!</span>
                  <button 
                    onClick={() => claimThresholdReward(reward.id)}
                    className="py-1.5 px-4 rounded-md text-sm font-medium transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--color-success)',
                      color: 'var(--color-text-on-primary, white)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    Reclamar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {pointStoreRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b" style={{borderColor: 'var(--color-secondary-accent)', color: 'var(--color-text)'}}>
            Canjear con Puntos (Tienda)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pointStoreRewards.map(reward => (
              <RedeemableStoreRewardCard 
                key={reward.id} 
                reward={reward} 
                userPoints={points} 
                onRedeem={redeemStoreReward}
                theme={theme}
              />
            ))}
          </div>
        </div>
      )}
      
      {claimedThresholdRewards.filter(crId => thresholdRewardsList.some(tr => tr.id === crId)).length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 pb-2 border-b" style={{borderColor: 'var(--color-secondary-accent)', color: 'var(--color-text)'}}>
            Historial de Recompensas Ganadas
          </h3>
          <div className="space-y-3">
            {claimedThresholdRewards
              .map(rewardId => thresholdRewardsList.find(r => r.id === rewardId))
              .filter(reward => reward)
              .sort((a,b) => claimedThresholdRewards.indexOf(b.id) - claimedThresholdRewards.indexOf(a.id)) // Mostrar más recientes primero
              .map((reward) => (
                <div 
                  key={reward.id} 
                  className="p-3.5 border rounded-lg transition-all"
                  style={{
                    borderColor: 'var(--color-secondary-disabled, #d1d5db)',
                    backgroundColor: theme === THEMES.GOTHIC ? '#202020' : (theme === THEMES.ARTNOUVEAU ? '#f5f2ed' : '#f9fafb'),
                    opacity: 0.75
                  }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3 opacity-70">{reward.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium line-through" style={{color: 'var(--color-text-disabled)'}}>{reward.title}</p>
                      {/* <p className="text-xs opacity-60" style={{color: 'var(--color-text-disabled)'}}>{reward.description}</p> */}
                    </div>
                    <span 
                        className="text-xs py-1 px-2.5 rounded-full font-semibold"
                        style={{
                            backgroundColor: theme === THEMES.GOTHIC ? 'var(--color-bg-alt)' : 'var(--color-secondary-accent)',
                            color: 'var(--color-text-secondary)'
                        }}
                    >
                        Reclamado
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {thresholdRewardsList.filter(reward => !claimedThresholdRewards.includes(reward.id) && !availableRewards.find(r => r.id === reward.id)).length > 0 && (
        <div className="mt-6">
            <h3 className="text-lg font-medium mb-3" style={{color: 'var(--color-text-secondary)'}}>Próximas Recompensas (Automáticas)</h3>
            <div className="p-4 rounded-lg" style={{ 
            backgroundColor: theme === THEMES.GOTHIC ? '#2a2a2a' : (theme === THEMES.ARTNOUVEAU ? '#e7d8c3' : '#f3f4f6'),
            opacity: 0.9
            }}>
            <ul className="space-y-2.5">
                {thresholdRewardsList
                .filter(reward => !claimedThresholdRewards.includes(reward.id) && !availableRewards.find(r => r.id === reward.id))
                .slice(0, 3) 
                .map(reward => (
                    <li key={reward.id} className="flex items-center opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-xl mr-2.5">{reward.icon}</span>
                    <div className="text-sm">
                        <span className="font-medium" style={{color: 'var(--color-text)'}}>{reward.title}</span> - 
                        <span className="opacity-80 ml-1" style={{color: 'var(--color-text-secondary)'}}>
                        {reward.category 
                            ? `Al completar ${reward.threshold} metas de ${reward.category}` 
                            : `Al completar ${reward.threshold} metas en total`}
                        </span>
                    </div>
                    </li>
                ))}
            </ul>
            </div>
        </div>
      )}

      {thresholdRewardsList.filter(reward => !claimedThresholdRewards.includes(reward.id) && !availableRewards.find(r => r.id === reward.id)).length === 0 && userCreatedRewards.filter(r => !r.claimed && !(r.deadline && new Date(r.deadline) < new Date())).length === 0 && (
        <div className="p-5 rounded-lg text-center mt-8" style={{
            backgroundColor: theme === THEMES.GOTHIC ? '#222' : (theme === THEMES.ARTNOUVEAU ? '#e7d8c3' : '#f3f4f6'),
            borderTop: `2px dashed var(--color-secondary-accent)`
        }}>
            <p className="italic text-md" style={{color: 'var(--color-text-secondary)'}}>
                "La disciplina es el puente entre metas y logros." - Jim Rohn
            </p>
            <p className="text-sm mt-2 opacity-70" style={{color: 'var(--color-text-secondary)'}}>
                ¡Sigue así, vas por buen camino! ¿O quizás es momento de crear una nueva meta de recompensa?
            </p>
        </div>
      )}
    </section>
  );
};

export default RewardsSystem;