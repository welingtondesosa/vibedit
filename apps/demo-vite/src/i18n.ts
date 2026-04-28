export type Lang = 'en' | 'es' | 'pt';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

interface Step {
  number: string;
  title: string;
  description: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface OpenSourceCard {
  icon: string;
  title: string;
  description: string;
}

export interface Translations {
  hero: {
    badge: string;
    headline: string;
    localBadge: string;
    sub: string;
    copy: string;
    copied: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Step[];
  };
  features: {
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  ai: {
    badge: string;
    headline: string;
    sub: string;
    steps: string[];
    note: string;
    cta: string;
  };
  install: {
    title: string;
    subtitle: string;
    runNote: string;
    runNote2: string;
    copy: string;
    copied: string;
    updateTitle: string;
    updateLabel: string;
    uninstallTitle: string;
    uninstallDesc: string;
  };
  openSource: {
    title: string;
    subtitle: string;
    cards: OpenSourceCard[];
  };
  footer: {
    reportIssue: string;
  };
}

export const T: Record<Lang, Translations> = {
  en: {
    hero: {
      badge: 'Open Source · Free · MIT License',
      headline: 'Stop wasting AI credits on visual tweaks.',
      localBadge: '100% local · Free AI via Ollama · No cloud · No credits',
      sub: 'You know the loop: open DevTools, guess the class name, hunt the file, edit, save, check. Vibedit replaces that loop — click any element, edit from a panel, and watch your source files update instantly.',
      copy: 'copy',
      copied: '✓ copied',
    },
    howItWorks: {
      title: 'How it works',
      subtitle: 'From install to your first live edit in under two minutes.',
      steps: [
        {
          number: '01',
          title: 'Install the plugin',
          description:
            'One command. It integrates as a dev-only plugin for Vite or Next.js — zero impact on your production build. Nothing changes in how your app runs.',
        },
        {
          number: '02',
          title: 'Click any element',
          description:
            'Activate the editor with the floating button. Click any element in your app — a panel slides in showing its styles, text, and props. No DevTools needed.',
        },
        {
          number: '03',
          title: 'Your source files update',
          description:
            'Adjust colors, spacing, typography, or text. Every change is written directly to your source files using AST — not string replacement. The result is exactly what you would have typed.',
        },
      ],
    },
    features: {
      title: 'Built for the real workflow',
      subtitle: 'Every feature exists to eliminate a specific friction point in UI iteration.',
      items: [
        {
          icon: '🎨',
          title: 'No more DevTools guesswork',
          description:
            'Edit colors, spacing, typography, borders, and shadows from a clean panel. See the result in the browser and in your code — at the same time.',
        },
        {
          icon: '✏️',
          title: 'Text changes in 3 seconds',
          description:
            'Click any text, type the new content, press Enter. Works even when text comes from props or i18n translation files — no file hunting required.',
        },
        {
          icon: '🌳',
          title: 'Code that stays yours',
          description:
            'Changes are written using ts-morph AST parsing — not regex or string replacement. The output is clean, formatted code that looks like you wrote it.',
        },
        {
          icon: '↩️',
          title: 'Instant undo on every change',
          description:
            'Changed the wrong thing? Every edit is tracked. Hit Ctrl+Z in the browser to undo, one step at a time, without touching the terminal.',
        },
        {
          icon: '✨',
          title: 'AI-powered editing — local and free',
          description:
            'Type "make it more modern" and get CSS suggestions from a local AI (Ollama). No cloud, no API keys, no credits. Apply suggestions with one click — changes go straight to your files.',
        },
        {
          icon: '📱',
          title: 'Mobile vs desktop — edit by breakpoint',
          description:
            'Switch between All, Mobile and Desktop before editing. Changes go into a @media rule — not inline, not global. Works in React and plain HTML.',
        },
        {
          icon: '🏠',
          title: 'No accounts. No cloud. No cost.',
          description:
            'Everything runs on localhost via a local WebSocket server. No API keys, no telemetry, no subscriptions. Works offline, works on any project.',
        },
        {
          icon: '🌐',
          title: 'Works with plain HTML too',
          description:
            'Not a React project? No problem. Vibedit also edits plain HTML files — inline styles, text, and breakpoint overrides, written directly to the source.',
        },
        {
          icon: '↕️',
          title: 'Drag to reorder elements',
          description:
            'Rearrange sibling elements by dragging them in the browser. The new order is written directly to your source file — no manual copy-paste needed.',
        },
      ],
    },
    ai: {
      badge: 'NEW — LOCAL AI',
      headline: 'Describe what you want. The AI writes the CSS.',
      sub: 'Vibedit connects to Ollama — a free, open-source AI that runs entirely on your machine. No cloud, no API keys, no cost per request. Your code never leaves your computer.',
      steps: [
        'Select any element in your app',
        'Type what you want: "add shadow and round corners"',
        'Review the AI suggestions — apply one by one or all at once',
        'Changes are written to your source files instantly',
      ],
      note: 'Works with any Ollama model: LLaMA 3, Mistral, Gemma, and more.',
      cta: 'ollama.com — free download',
    },
    install: {
      title: 'Get started in under 2 minutes',
      subtitle: 'One command. No manual config. Works with Next.js and Vite.',
      runNote: 'Run',
      runNote2: 'and look for the Vibedit button in the bottom-right corner of your app.',
      copy: 'copy',
      copied: '✓ copied',
      updateTitle: 'Keep it up to date',
      updateLabel: 'Update to the latest version',
      uninstallTitle: 'Want to remove it?',
      uninstallDesc:
        "Vibedit leaves no traces. To uninstall: run `npm uninstall @vibedit/vite` (or `@vibedit/next`), then remove the two lines you added to your config. That's it — no leftover files, no source code changes, no lock-in.",
    },
    openSource: {
      title: 'Open source. What does that actually mean?',
      subtitle: 'Three things worth understanding about how Vibedit is built and distributed.',
      cards: [
        {
          icon: '📦',
          title: 'npm — where you install it',
          description:
            'When you run `npm install @vibedit/vite`, npm downloads the package from a public registry — like an app store for developers. Free, instant, versioned. No account needed.',
        },
        {
          icon: '👁️',
          title: 'GitHub — the code is public',
          description:
            "Every line of Vibedit's source is on GitHub. You can read it, inspect what it does to your files, fork it, or report a bug. Open source means the kitchen is open — nothing hidden.",
        },
        {
          icon: '⚖️',
          title: 'MIT License — use it however you want',
          description:
            'The MIT license lets you use Vibedit in any project — personal, commercial, or modified. Free to use. If you find it valuable, a GitHub star or contribution goes a long way.',
        },
      ],
    },
    footer: { reportIssue: 'Report an issue' },
  },

  es: {
    hero: {
      badge: 'Open Source · Gratis · Licencia MIT',
      headline: 'Dejá de gastar créditos de IA en ajustes visuales.',
      localBadge: '100% local · IA gratis via Ollama · Sin cloud · Sin créditos',
      sub: 'Conocés el loop: DevTools, adivinar el nombre de la clase, buscar el archivo, editar, guardar, revisar. Vibedit reemplaza ese loop — hacé clic en cualquier elemento, editá desde el panel, y mirá cómo tus archivos fuente se actualizan al instante.',
      copy: 'copiar',
      copied: '✓ copiado',
    },
    howItWorks: {
      title: 'Cómo funciona',
      subtitle: 'De la instalación a tu primera edición en vivo en menos de dos minutos.',
      steps: [
        {
          number: '01',
          title: 'Instalá el plugin',
          description:
            'Un solo comando. Se integra como plugin solo en desarrollo para Vite o Next.js — impacto cero en tu build de producción. Nada cambia en cómo corre tu app.',
        },
        {
          number: '02',
          title: 'Hacé clic en cualquier elemento',
          description:
            'Activá el editor con el botón flotante. Hacé clic en cualquier elemento — un panel se despliega con sus estilos, texto y props. Sin DevTools.',
        },
        {
          number: '03',
          title: 'Tus archivos fuente se actualizan',
          description:
            'Ajustá colores, espaciado, tipografía o texto. Cada cambio se escribe en tus archivos fuente usando AST — no reemplazo de strings. El resultado es exactamente lo que hubieras escrito.',
        },
      ],
    },
    features: {
      title: 'Diseñado para el workflow real',
      subtitle: 'Cada feature existe para eliminar una fricción específica en la iteración de UI.',
      items: [
        {
          icon: '🎨',
          title: 'Sin más suposiciones en DevTools',
          description:
            'Editá colores, espaciado, tipografía, bordes y sombras desde un panel limpio. El resultado se ve en el navegador y en tu código — al mismo tiempo.',
        },
        {
          icon: '✏️',
          title: 'Cambios de texto en 3 segundos',
          description:
            'Hacé clic en cualquier texto, escribí el nuevo contenido, Enter. Funciona aunque el texto venga de props o archivos de traducción i18n — sin buscar archivos.',
        },
        {
          icon: '🌳',
          title: 'Código que sigue siendo tuyo',
          description:
            'Los cambios se escriben con ts-morph — no regex ni reemplazo de strings. El resultado es código limpio y formateado, como si lo hubieras escrito vos.',
        },
        {
          icon: '↩️',
          title: 'Undo instantáneo en cada cambio',
          description:
            '¿Cambiaste lo que no era? Cada edición queda registrada. Ctrl+Z en el navegador para deshacer, paso a paso, sin tocar la terminal.',
        },
        {
          icon: '🔒',
          title: 'Edición con IA — local y gratis',
          description:
            'Escribí "hacelo más moderno" y recibí sugerencias CSS de una IA local (Ollama). Sin cloud, sin API keys, sin créditos. Aplicá sugerencias con un click — los cambios van directo a tus archivos.',
        },
        {
          icon: '📱',
          title: 'Mobile vs desktop — editá por breakpoint',
          description:
            'Cambiá entre All, Mobile y Desktop antes de editar. Los cambios van a una regla @media — no inline, no global. Funciona en React y HTML plano.',
        },
        {
          icon: '🏠',
          title: 'Sin cuentas. Sin cloud. Sin costo.',
          description:
            'Todo corre en localhost via WebSocket local. Sin API keys, sin telemetría, sin suscripciones. Funciona offline, funciona en cualquier proyecto.',
        },
        {
          icon: '🌐',
          title: 'Funciona con HTML plano también',
          description:
            '¿No es un proyecto React? No hay problema. Vibedit también edita archivos HTML planos — estilos inline, texto y overrides por breakpoint, escritos directo al fuente.',
        },
        {
          icon: '↕️',
          title: 'Arrastrá para reordenar elementos',
          description:
            'Reorganizá elementos hermanos arrastrándolos en el navegador. El nuevo orden se escribe directo en tu archivo fuente — sin copy-paste manual.',
        },
      ],
    },
    ai: {
      badge: 'NUEVO — IA LOCAL',
      headline: 'Describí lo que querés. La IA escribe el CSS.',
      sub: 'Vibedit se conecta a Ollama — una IA gratuita y open source que corre completamente en tu máquina. Sin cloud, sin API keys, sin costo por request. Tu código nunca sale de tu computadora.',
      steps: [
        'Seleccioná cualquier elemento de tu app',
        'Escribí lo que querés: "agregá sombra y bordes redondeados"',
        'Revisá las sugerencias de la IA — aplicá una por una o todas juntas',
        'Los cambios se escriben en tus archivos fuente al instante',
      ],
      note: 'Funciona con cualquier modelo de Ollama: LLaMA 3, Mistral, Gemma, y más.',
      cta: 'ollama.com — descarga gratuita',
    },
    install: {
      title: 'Empezá en menos de 2 minutos',
      subtitle: 'Un comando. Sin config manual. Funciona con Next.js y Vite.',
      runNote: 'Ejecutá',
      runNote2: 'y buscá el botón de Vibedit en la esquina inferior derecha de tu app.',
      copy: 'copiar',
      copied: '✓ copiado',
      updateTitle: 'Mantenerlo actualizado',
      updateLabel: 'Actualizar a la última versión',
      uninstallTitle: '¿Querés quitarlo?',
      uninstallDesc:
        'Vibedit no deja rastros. Para desinstalar: ejecutá `npm uninstall @vibedit/vite` (o `@vibedit/next`), y eliminá las dos líneas que agregaste en tu config. Listo — sin archivos residuales, sin cambios en el código fuente, sin lock-in.',
    },
    openSource: {
      title: '¿Open source? ¿Qué significa realmente?',
      subtitle:
        'Tres cosas que vale la pena entender sobre cómo se construye y distribuye Vibedit.',
      cards: [
        {
          icon: '📦',
          title: 'npm — donde lo instalás',
          description:
            'Cuando ejecutás `npm install @vibedit/vite`, npm descarga el paquete desde un registro público — como una tienda de apps para developers. Gratis, instantáneo, con versiones. Sin cuenta.',
        },
        {
          icon: '👁️',
          title: 'GitHub — el código es público',
          description:
            'Todo el código de Vibedit está en GitHub. Podés leerlo, inspeccionar qué hace con tus archivos, copiarlo o reportar un bug. Open source significa la cocina está abierta — nada escondido.',
        },
        {
          icon: '⚖️',
          title: 'Licencia MIT — usalo como quieras',
          description:
            'La licencia MIT te permite usar Vibedit en cualquier proyecto — personal, comercial o modificado. Gratis para usar. Si te resulta útil, una estrella en GitHub o una contribución hace la diferencia.',
        },
      ],
    },
    footer: { reportIssue: 'Reportar un problema' },
  },

  pt: {
    hero: {
      badge: 'Open Source · Gratuito · Licença MIT',
      headline: 'Pare de gastar créditos de IA em ajustes visuais.',
      localBadge: '100% local · IA grátis via Ollama · Sem cloud · Sem créditos',
      sub: 'Você conhece o loop: DevTools, adivinhar o nome da classe, procurar o arquivo, editar, salvar, verificar. O Vibedit substitui esse loop — clique em qualquer elemento, edite pelo painel e veja seus arquivos fonte atualizarem na hora.',
      copy: 'copiar',
      copied: '✓ copiado',
    },
    howItWorks: {
      title: 'Como funciona',
      subtitle: 'Da instalação à sua primeira edição ao vivo em menos de dois minutos.',
      steps: [
        {
          number: '01',
          title: 'Instale o plugin',
          description:
            'Um comando só. Se integra como plugin apenas em desenvolvimento para Vite ou Next.js — impacto zero no seu build de produção. Nada muda em como seu app roda.',
        },
        {
          number: '02',
          title: 'Clique em qualquer elemento',
          description:
            'Ative o editor com o botão flutuante. Clique em qualquer elemento — um painel desliza mostrando seus estilos, texto e props. Sem DevTools.',
        },
        {
          number: '03',
          title: 'Seus arquivos fonte atualizam',
          description:
            'Ajuste cores, espaçamento, tipografia ou texto. Cada mudança é escrita diretamente nos seus arquivos fonte usando AST — sem substituição de strings. O resultado é exatamente o que você teria digitado.',
        },
      ],
    },
    features: {
      title: 'Feito para o fluxo de trabalho real',
      subtitle:
        'Cada feature existe para eliminar um ponto de atrito específico na iteração de UI.',
      items: [
        {
          icon: '🎨',
          title: 'Sem mais adivinhações no DevTools',
          description:
            'Edite cores, espaçamento, tipografia, bordas e sombras num painel limpo. Veja o resultado no navegador e no seu código — ao mesmo tempo.',
        },
        {
          icon: '✏️',
          title: 'Mudanças de texto em 3 segundos',
          description:
            'Clique em qualquer texto, digite o novo conteúdo, Enter. Funciona mesmo quando o texto vem de props ou arquivos de tradução i18n — sem procurar arquivos.',
        },
        {
          icon: '🌳',
          title: 'Código que continua sendo seu',
          description:
            'As mudanças são escritas com ts-morph — sem regex ou substituição de strings. O resultado é código limpo e formatado, como se você tivesse digitado.',
        },
        {
          icon: '↩️',
          title: 'Desfazer instantâneo em cada mudança',
          description:
            'Mudou a coisa errada? Cada edição é rastreada. Ctrl+Z no navegador para desfazer, passo a passo, sem tocar no terminal.',
        },
        {
          icon: '✨',
          title: 'Edição com IA — local e grátis',
          description:
            'Digite "deixe mais moderno" e receba sugestões CSS de uma IA local (Ollama). Sem cloud, sem API keys, sem créditos. Aplique sugestões com um clique — as mudanças vão direto pros seus arquivos.',
        },
        {
          icon: '📱',
          title: 'Mobile vs desktop — edite por breakpoint',
          description:
            'Alterne entre All, Mobile e Desktop antes de editar. As mudanças vão para uma regra @media — não inline, não global. Funciona em React e HTML puro.',
        },
        {
          icon: '🏠',
          title: 'Sem contas. Sem cloud. Sem custo.',
          description:
            'Tudo roda em localhost via WebSocket local. Sem API keys, sem telemetria, sem assinaturas. Funciona offline, funciona em qualquer projeto.',
        },
        {
          icon: '🌐',
          title: 'Funciona com HTML puro também',
          description:
            'Não é um projeto React? Sem problema. O Vibedit também edita arquivos HTML puros — estilos inline, texto e overrides por breakpoint, escritos direto no fonte.',
        },
        {
          icon: '↕️',
          title: 'Arraste para reordenar elementos',
          description:
            'Reorganize elementos irmãos arrastando-os no navegador. A nova ordem é escrita diretamente no arquivo fonte — sem copiar e colar manualmente.',
        },
      ],
    },
    ai: {
      badge: 'NOVO — IA LOCAL',
      headline: 'Descreva o que você quer. A IA escreve o CSS.',
      sub: 'Vibedit se conecta ao Ollama — uma IA gratuita e open source que roda inteiramente na sua máquina. Sem cloud, sem API keys, sem custo por request. Seu código nunca sai do seu computador.',
      steps: [
        'Selecione qualquer elemento do seu app',
        'Digite o que quer: "adicione sombra e arredonde os cantos"',
        'Revise as sugestões da IA — aplique uma por uma ou todas de uma vez',
        'As mudanças são escritas nos seus arquivos fonte instantaneamente',
      ],
      note: 'Funciona com qualquer modelo do Ollama: LLaMA 3, Mistral, Gemma, e mais.',
      cta: 'ollama.com — download gratuito',
    },
    install: {
      title: 'Comece em menos de 2 minutos',
      subtitle: 'Um comando. Sem config manual. Funciona com Next.js e Vite.',
      runNote: 'Execute',
      runNote2: 'e procure o botão do Vibedit no canto inferior direito do seu app.',
      copy: 'copiar',
      copied: '✓ copiado',
      updateTitle: 'Manter atualizado',
      updateLabel: 'Atualizar para a última versão',
      uninstallTitle: 'Quer remover?',
      uninstallDesc:
        'O Vibedit não deixa rastros. Para desinstalar: execute `npm uninstall @vibedit/vite` (ou `@vibedit/next`), e remova as duas linhas que você adicionou no seu arquivo de config. Pronto — sem arquivos residuais, sem alterações no código fonte, sem lock-in.',
    },
    openSource: {
      title: 'Open source? O que isso significa de verdade?',
      subtitle: 'Três coisas que vale entender sobre como o Vibedit é construído e distribuído.',
      cards: [
        {
          icon: '📦',
          title: 'npm — onde você instala',
          description:
            'Quando você executa `npm install @vibedit/vite`, o npm baixa o pacote de um registro público — como uma loja de apps para desenvolvedores. Gratuito, instantâneo, versionado. Sem conta.',
        },
        {
          icon: '👁️',
          title: 'GitHub — o código é público',
          description:
            'Todo o código do Vibedit está no GitHub. Você pode ler, inspecionar o que ele faz com seus arquivos, bifurcar ou reportar um bug. Open source significa a cozinha está aberta — nada escondido.',
        },
        {
          icon: '⚖️',
          title: 'Licença MIT — use como quiser',
          description:
            'A licença MIT permite usar o Vibedit em qualquer projeto — pessoal, comercial ou modificado. Gratuito para usar. Se achar útil, uma estrela no GitHub ou uma contribuição faz diferença.',
        },
      ],
    },
    footer: { reportIssue: 'Reportar um problema' },
  },
};
