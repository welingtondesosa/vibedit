import { useState } from 'react';
import { T, type Lang } from './i18n';
import { Nav } from './components/Nav';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { InstallSection } from './components/InstallSection';
import { Footer } from './components/Footer';

function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = T[lang];

  return (
    <>
      <Nav lang={lang} onLangChange={setLang} />
      <main>
        <HeroSection t={t.hero} />
        <HowItWorks t={t.howItWorks} />
        <Features t={t.features} />
        <InstallSection t={t.install} />
      </main>
      <Footer t={t.footer} />
    </>
  );
}

export default App;
