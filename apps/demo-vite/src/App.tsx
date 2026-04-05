import { useState } from 'react';
import { T, type Lang } from './i18n';
import { Nav } from './components/Nav';
import { HeroSection } from './components/HeroSection';
import { DemoPreview } from './components/DemoPreview';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { InstallSection } from './components/InstallSection';
import { OpenSourceSection } from './components/OpenSourceSection';
import { Footer } from './components/Footer';

function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = T[lang];

  return (
    <>
      <Nav lang={lang} onLangChange={setLang} />
      <main>
        <HeroSection t={t.hero} />
        <DemoPreview />
        <HowItWorks t={t.howItWorks} />
        <Features t={t.features} />
        <InstallSection t={t.install} />
        <OpenSourceSection t={t.openSource} />
      </main>
      <Footer t={t.footer} />
    </>
  );
}

export default App;
