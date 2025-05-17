// src/features/motivation/DailyWord.jsx
import React from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

// Lista de palabras motivacionales con significados
const MOTIVATIONAL_WORDS = [
  {
    word: "Disciplina",
    meaning: "Capacidad de las personas para poner en práctica una serie de principios relativos al orden y la constancia.",
    quote: "La disciplina es el puente entre objetivos y logros."
  },
  {
    word: "Perseverancia",
    meaning: "Firmeza y constancia en la ejecución de los propósitos y resoluciones del ánimo o en las acciones.",
    quote: "La perseverancia no es una carrera larga, es muchas carreras cortas una tras otra."
  },
  {
    word: "Enfoque",
    meaning: "Concentración de la atención o el esfuerzo en un asunto o actividad concretos.",
    quote: "Donde va la atención, fluye la energía."
  },
  {
    word: "Determinación",
    meaning: "Firmeza en los propósitos, tenacidad y decisión para conseguir un objetivo.",
    quote: "La determinación de hoy es el éxito de mañana."
  },
  {
    word: "Constancia",
    meaning: "Firmeza y perseverancia del ánimo en las resoluciones y en los propósitos.",
    quote: "La constancia convierte lo ordinario en extraordinario."
  }
];

const DailyWord = () => {
  const { theme } = useTheme();
  
  // Obtener una palabra basada en la fecha actual (cambia cada día)
  const getWordOfTheDay = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % MOTIVATIONAL_WORDS.length;
    return MOTIVATIONAL_WORDS[index];
  };
  
  const wordOfTheDay = getWordOfTheDay();

  // Estilos específicos para cada tema
  const getStyles = () => {
    const baseCardStyle = {
      backgroundColor: theme === THEMES.GOTHIC ? '#1a1a1a' : 'white',
      boxShadow: 'var(--box-shadow)',
      borderRadius: 'var(--border-radius)',
      borderColor: 'var(--color-secondary)',
      borderWidth: '1px'
    };

    // Estilos adicionales específicos de cada tema
    if (theme === THEMES.ARTNOUVEAU) {
      baseCardStyle.position = 'relative';
      baseCardStyle.overflow = 'hidden';
    }

    return { baseCardStyle };
  };

  const { baseCardStyle } = getStyles();

  return (
    <section className="card p-6" style={baseCardStyle}>
      {theme === THEMES.ARTNOUVEAU && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #a86f3e, #d4a76a, #a86f3e)',
            borderTopLeftRadius: 'var(--border-radius)',
            borderTopRightRadius: 'var(--border-radius)'
          }}
        />
      )}
      
      <h2 
        className="text-2xl font-semibold mb-3"
        style={{ 
          color: 'var(--color-text)',
          textTransform: theme === THEMES.GOTHIC ? 'uppercase' : 'none',
          letterSpacing: theme === THEMES.GOTHIC ? '0.05em' : 'normal'
        }}
      >
        Palabra del Día
      </h2>
      
      <div className="text-center">
        <p 
          className="text-3xl font-bold mb-2"
          style={{ 
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {wordOfTheDay.word}
        </p>
        
        <p 
          className="text-sm mb-4"
          style={{ 
            color: 'var(--color-text)',
            opacity: 0.8 
          }}
        >
          {wordOfTheDay.meaning}
        </p>
        
        <blockquote 
          className="italic border-l-4 pl-4 py-2 mx-auto max-w-md text-left" 
          style={{ 
            borderColor: 'var(--color-primary)',
            backgroundColor: theme === THEMES.GOTHIC ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            padding: '12px 16px',
            borderRadius: '0 var(--border-radius) var(--border-radius) 0'
          }}
        >
          "{wordOfTheDay.quote}"
        </blockquote>
      </div>
    </section>
  );
};

export default DailyWord;