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
    sub: string;
    subHighlight: string;
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
  install: {
    title: string;
    subtitle: string;
    runNote: string;
    runNote2: string;
    copy: string;
    copied: string;
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
      badge: 'Open Source · No AI · No Credits · MIT License',
      headline: 'Visual editing for React. No cloud required.',
      sub: 'Click any element in your app, edit its styles and text in the panel, and watch your source files update instantly. No AI. No accounts. Everything stays local.',
      subHighlight: 'source files update instantly',
      copy: 'copy',
      copied: '✓ copied',
    },
    howItWorks: {
      title: 'How it works',
      subtitle: 'Three steps from install to your first live edit.',
      steps: [
        {
          number: '01',
          title: 'Install the plugin',
          description:
            'Add Vibedit to your project with one command. It integrates as a dev-only plugin for Next.js or Vite — zero impact on your production build.',
        },
        {
          number: '02',
          title: 'Click any element',
          description:
            'Open your app in the browser and activate the editor with the floating button. Click any element — a panel slides in showing all its editable styles.',
        },
        {
          number: '03',
          title: 'Changes write to source',
          description:
            'Adjust colors, spacing, typography, or text. Every change is written directly to your source files using AST parsing — no regex, no surprises.',
        },
      ],
    },
    features: {
      title: 'Everything you need',
      subtitle: 'Built for developers who want to iterate on UI faster.',
      items: [
        {
          icon: '🎨',
          title: 'Visual Style Editing',
          description:
            'Edit colors, spacing, typography, borders, and shadows through a clean panel. See the result instantly in the browser.',
        },
        {
          icon: '✏️',
          title: 'Text & Content Editing',
          description:
            'Edit text directly from the panel — including content from i18n translation objects. No hunting through files.',
        },
        {
          icon: '🌳',
          title: 'AST-powered Writes',
          description:
            'Changes are written back using ts-morph AST parsing — not string replacement or regex. Your code stays clean.',
        },
        {
          icon: '🔒',
          title: 'Shadow DOM Isolation',
          description:
            "The editor overlay lives in its own Shadow DOM. Its styles never interfere with your app's styles.",
        },
        {
          icon: '↩️',
          title: 'Full Undo History',
          description:
            'Every change is tracked server-side. Undo any edit, one step at a time, without leaving the browser.',
        },
        {
          icon: '🏠',
          title: 'Zero Cloud, Zero AI',
          description:
            'Everything runs on localhost. No accounts, no API keys, no telemetry, no recurring costs.',
        },
      ],
    },
    install: {
      title: 'Get started in minutes',
      subtitle: 'Pick your framework and follow the steps below.',
      runNote: 'Run',
      runNote2: 'and look for the Vibedit button in the bottom-right corner of your app.',
      copy: 'copy',
      copied: '✓ copied',
      uninstallTitle: 'Want to remove it?',
      uninstallDesc:
        'Vibedit leaves no traces. To uninstall completely: run `npm uninstall @vibedit/vite` (or `@vibedit/next`), then remove the two lines you added to your config file. That\'s it — no leftover files, no source code changes.',
    },
    openSource: {
      title: 'Open source. What does that mean for you?',
      subtitle:
        'Three concepts that explain how Vibedit is distributed and why it costs nothing.',
      cards: [
        {
          icon: '📦',
          title: 'npm — where you install it from',
          description:
            'When you run `npm install @vibedit/vite`, npm downloads the package from a public registry. Think of it like an app store for developers — free, instant, versioned. No account needed to install.',
        },
        {
          icon: '👁️',
          title: 'GitHub — where the code lives',
          description:
            'Every line of Vibedit\'s source code is public on GitHub. You can read it, inspect it, fork it, or report a bug. This transparency is what "open source" means: the kitchen is open.',
        },
        {
          icon: '⚖️',
          title: 'MIT License — free, forever',
          description:
            'The MIT license lets you use Vibedit in any project — personal, commercial, or modified — at no cost, now and forever. The only rule: keep the copyright notice in the code.',
        },
      ],
    },
    footer: { reportIssue: 'Report an issue' },
  },

  es: {
    hero: {
      badge: 'Open Source · Sin IA · Sin Créditos · Licencia MIT',
      headline: 'Edición visual para React. Sin cloud.',
      sub: 'Hacé clic en cualquier elemento de tu app, editá sus estilos y textos en el panel, y mirá cómo tus archivos fuente se actualizan al instante. Sin IA. Sin cuentas. Todo local.',
      subHighlight: 'archivos fuente se actualizan al instante',
      copy: 'copiar',
      copied: '✓ copiado',
    },
    howItWorks: {
      title: 'Cómo funciona',
      subtitle: 'Tres pasos desde la instalación hasta tu primera edición en vivo.',
      steps: [
        {
          number: '01',
          title: 'Instalá el plugin',
          description:
            'Agregá Vibedit a tu proyecto con un solo comando. Se integra como plugin solo en desarrollo — impacto cero en tu build de producción.',
        },
        {
          number: '02',
          title: 'Hacé clic en cualquier elemento',
          description:
            'Abrí tu app en el navegador y activá el editor con el botón flotante. Hacé clic en cualquier elemento — un panel se despliega con todos sus estilos editables.',
        },
        {
          number: '03',
          title: 'Los cambios se escriben al código',
          description:
            'Ajustá colores, espaciado, tipografía o texto. Cada cambio se escribe directamente en tus archivos fuente usando AST — sin regex, sin sorpresas.',
        },
      ],
    },
    features: {
      title: 'Todo lo que necesitás',
      subtitle: 'Diseñado para developers que quieren iterar en la UI más rápido.',
      items: [
        {
          icon: '🎨',
          title: 'Edición visual de estilos',
          description:
            'Editá colores, espaciado, tipografía, bordes y sombras desde un panel limpio. El resultado se ve al instante en el navegador.',
        },
        {
          icon: '✏️',
          title: 'Edición de texto y contenido',
          description:
            'Editá textos directamente desde el panel — incluyendo contenido de objetos de traducción i18n. Sin buscar en los archivos.',
        },
        {
          icon: '🌳',
          title: 'Escritura con AST',
          description:
            'Los cambios se escriben usando ts-morph — no reemplazo de strings ni regex. Tu código queda limpio.',
        },
        {
          icon: '🔒',
          title: 'Aislamiento con Shadow DOM',
          description:
            'El overlay vive en su propio Shadow DOM. Sus estilos nunca interfieren con los estilos de tu app.',
        },
        {
          icon: '↩️',
          title: 'Historial de deshacer completo',
          description:
            'Cada cambio queda registrado en el servidor. Deshacé cualquier edición, paso a paso, sin salir del navegador.',
        },
        {
          icon: '🏠',
          title: 'Sin Cloud, Sin IA',
          description:
            'Todo corre en localhost. Sin cuentas, sin API keys, sin telemetría, sin costos recurrentes.',
        },
      ],
    },
    install: {
      title: 'Empezá en minutos',
      subtitle: 'Elegí tu framework y seguí los pasos.',
      runNote: 'Ejecutá',
      runNote2: 'y buscá el botón de Vibedit en la esquina inferior derecha de tu app.',
      copy: 'copiar',
      copied: '✓ copiado',
      uninstallTitle: '¿Querés quitarlo?',
      uninstallDesc:
        'Vibedit no deja rastros. Para desinstalar: ejecutá `npm uninstall @vibedit/vite` (o `@vibedit/next`), y eliminá las dos líneas que agregaste en tu config. Listo — sin archivos residuales, sin cambios en el código fuente.',
    },
    openSource: {
      title: '¿Open source? ¿GitHub? ¿npm? ¿Qué significa todo eso?',
      subtitle:
        'Tres conceptos que explican cómo se distribuye Vibedit y por qué no cuesta nada.',
      cards: [
        {
          icon: '📦',
          title: 'npm — donde lo instalás',
          description:
            'Cuando ejecutás `npm install @vibedit/vite`, npm descarga el paquete desde un registro público. Pensalo como una tienda de apps para developers — gratis, instantáneo, con versiones. Sin cuenta para instalar.',
        },
        {
          icon: '👁️',
          title: 'GitHub — donde vive el código',
          description:
            'Todo el código fuente de Vibedit es público en GitHub. Podés leerlo, inspeccionarlo, copiarlo o reportar un bug. Eso es lo que significa "open source": la cocina está abierta.',
        },
        {
          icon: '⚖️',
          title: 'Licencia MIT — gratis, para siempre',
          description:
            'La licencia MIT te permite usar Vibedit en cualquier proyecto — personal, comercial o modificado — sin costo, ahora y siempre. La única regla: mantener el aviso de copyright en el código.',
        },
      ],
    },
    footer: { reportIssue: 'Reportar un problema' },
  },

  pt: {
    hero: {
      badge: 'Open Source · Sem IA · Sem Créditos · Licença MIT',
      headline: 'Edição visual para React. Sem cloud.',
      sub: 'Clique em qualquer elemento do seu app, edite seus estilos e textos no painel e veja seus arquivos fonte atualizarem na hora. Sem IA. Sem contas. Tudo local.',
      subHighlight: 'arquivos fonte atualizarem na hora',
      copy: 'copiar',
      copied: '✓ copiado',
    },
    howItWorks: {
      title: 'Como funciona',
      subtitle: 'Três passos da instalação até sua primeira edição ao vivo.',
      steps: [
        {
          number: '01',
          title: 'Instale o plugin',
          description:
            'Adicione o Vibedit ao seu projeto com um comando. Ele se integra como plugin apenas em desenvolvimento — impacto zero no seu build de produção.',
        },
        {
          number: '02',
          title: 'Clique em qualquer elemento',
          description:
            'Abra seu app no navegador e ative o editor com o botão flutuante. Clique em qualquer elemento — um painel desliza mostrando todos os seus estilos editáveis.',
        },
        {
          number: '03',
          title: 'Mudanças vão para o código',
          description:
            'Ajuste cores, espaçamento, tipografia ou texto. Cada mudança é escrita diretamente nos seus arquivos fonte usando AST — sem regex, sem surpresas.',
        },
      ],
    },
    features: {
      title: 'Tudo que você precisa',
      subtitle: 'Feito para developers que querem iterar na UI mais rápido.',
      items: [
        {
          icon: '🎨',
          title: 'Edição visual de estilos',
          description:
            'Edite cores, espaçamento, tipografia, bordas e sombras num painel limpo. Veja o resultado na hora no navegador.',
        },
        {
          icon: '✏️',
          title: 'Edição de texto e conteúdo',
          description:
            'Edite textos diretamente do painel — incluindo conteúdo de objetos de tradução i18n. Sem procurar nos arquivos.',
        },
        {
          icon: '🌳',
          title: 'Escritas com AST',
          description:
            'As mudanças são escritas usando ts-morph — sem substituição de strings ou regex. Seu código fica limpo.',
        },
        {
          icon: '🔒',
          title: 'Isolamento com Shadow DOM',
          description:
            'O overlay vive em seu próprio Shadow DOM. Seus estilos nunca interferem com os estilos do seu app.',
        },
        {
          icon: '↩️',
          title: 'Histórico completo de desfazer',
          description:
            'Cada mudança é registrada no servidor. Desfaça qualquer edição, passo a passo, sem sair do navegador.',
        },
        {
          icon: '🏠',
          title: 'Sem Cloud, Sem IA',
          description:
            'Tudo roda em localhost. Sem contas, sem API keys, sem telemetria, sem custos recorrentes.',
        },
      ],
    },
    install: {
      title: 'Comece em minutos',
      subtitle: 'Escolha seu framework e siga os passos abaixo.',
      runNote: 'Execute',
      runNote2: 'e procure o botão do Vibedit no canto inferior direito do seu app.',
      copy: 'copiar',
      copied: '✓ copiado',
      uninstallTitle: 'Quer remover?',
      uninstallDesc:
        'O Vibedit não deixa rastros. Para desinstalar: execute `npm uninstall @vibedit/vite` (ou `@vibedit/next`), e remova as duas linhas que você adicionou no seu arquivo de config. Pronto — sem arquivos residuais, sem alterações no código fonte.',
    },
    openSource: {
      title: 'Open source? GitHub? npm? O que significa tudo isso?',
      subtitle:
        'Três conceitos que explicam como o Vibedit é distribuído e por que não custa nada.',
      cards: [
        {
          icon: '📦',
          title: 'npm — onde você instala',
          description:
            'Quando você executa `npm install @vibedit/vite`, o npm baixa o pacote de um registro público. Pense como uma loja de apps para desenvolvedores — gratuito, instantâneo, versionado. Sem conta para instalar.',
        },
        {
          icon: '👁️',
          title: 'GitHub — onde o código vive',
          description:
            'Todo o código fonte do Vibedit é público no GitHub. Você pode ler, inspecionar, bifurcar ou reportar um bug. Isso é o que "open source" significa: a cozinha está aberta.',
        },
        {
          icon: '⚖️',
          title: 'Licença MIT — gratuito, para sempre',
          description:
            'A licença MIT permite usar o Vibedit em qualquer projeto — pessoal, comercial ou modificado — sem custo, agora e sempre. A única regra: manter o aviso de copyright no código.',
        },
      ],
    },
    footer: { reportIssue: 'Reportar um problema' },
  },
};
