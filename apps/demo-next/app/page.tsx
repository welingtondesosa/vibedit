'use client';

import { useState } from 'react';
import { Hero } from '../components/Hero';
import { Card } from '../components/Card';

type Lang = 'en' | 'es' | 'pt';

const T = {
  en: {
    cards: [
      {
        title: 'Shadow DOM Isolation',
        description: 'The editor overlay lives in its own Shadow DOM, so styles never leak into your app.',
        icon: '🔒',
      },
      {
        title: 'AST-powered Writes',
        description: 'Changes are written back to your source files using ts-morph — no regex hacks.',
        icon: '🌳',
      },
      {
        title: 'WebSocket Hot-Sync',
        description: 'Edits travel over a local WebSocket. Save, undo, and see changes instantly.',
        icon: '⚡',
      },
      {
        title: 'Zero Cloud, Zero AI',
        description: 'Everything runs locally. No accounts, no credits, no tracking.',
        icon: '🏠',
      },
      {
        title: 'Multi-framework',
        description: 'Works with Next.js, Vite, and any React-based framework. One plugin, any setup.',
        icon: '🔌',
      },
      {
        title: 'Full Undo History',
        description: 'Every change is tracked. Undo anything, one step at a time, without leaving the browser.',
        icon: '↩️',
      },
    ],
  },
  es: {
    cards: [
      {
        title: 'Aislamiento con Shadow DOM',
        description: 'El overlay vive en su propio Shadow DOM, así los estilos nunca se mezclan con tu app.',
        icon: '🔒',
      },
      {
        title: 'Escritura con AST',
        description: 'Los cambios se escriben en tus archivos fuente con ts-morph — sin hacks de regex.',
        icon: '🌳',
      },
      {
        title: 'Sincronización por WebSocket',
        description: 'Las ediciones viajan por WebSocket local. Guardá, deshacé y ves los cambios al instante.',
        icon: '⚡',
      },
      {
        title: 'Sin Cloud, Sin IA',
        description: 'Todo corre localmente. Sin cuentas, sin créditos, sin rastreo.',
        icon: '🏠',
      },
      {
        title: 'Multi-framework',
        description: 'Funciona con Next.js, Vite y cualquier framework basado en React. Un plugin, cualquier setup.',
        icon: '🔌',
      },
      {
        title: 'Historial de deshacer',
        description: 'Cada cambio queda registrado. Deshacé cualquier edición, paso a paso, sin salir del navegador.',
        icon: '↩️',
      },
    ],
  },
  pt: {
    cards: [
      {
        title: 'Isolamento com Shadow DOM',
        description: 'O overlay vive em seu próprio Shadow DOM, então os estilos nunca vazam para seu app.',
        icon: '🔒',
      },
      {
        title: 'Escritas com AST',
        description: 'As mudanças são gravadas nos arquivos fonte com ts-morph — sem hacks de regex.',
        icon: '🌳',
      },
      {
        title: 'Sincronização via WebSocket',
        description: 'As edições viajam por WebSocket local. Salve, desfaça e veja as mudanças na hora.',
        icon: '⚡',
      },
      {
        title: 'Sem Cloud, Sem IA',
        description: 'Tudo roda localmente. Sem contas, sem créditos, sem rastreamento.',
        icon: '🏠',
      },
      {
        title: 'Multi-framework',
        description: 'Funciona com Next.js, Vite e qualquer framework baseado em React. Um plugin, qualquer setup.',
        icon: '🔌',
      },
      {
        title: 'Histórico de desfazer',
        description: 'Cada mudança é registrada. Desfaça qualquer edição, passo a passo, sem sair do navegador.',
        icon: '↩️',
      },
    ],
  },
} satisfies Record<Lang, { cards: { title: string; description: string; icon: string }[] }>;

const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 24px 0',
          gap: '8px',
        }}
      >
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: lang === l ? '#6366f1' : '#2a2a45',
              background: lang === l ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: lang === l ? '#a5b4fc' : '#64748b',
              fontSize: '13px',
              fontWeight: lang === l ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <Hero lang={lang} />

      <section
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {T[lang].cards.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </section>
    </main>
  );
}
