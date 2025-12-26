import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

import Translate from '@docusaurus/Translate';

// ...

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    setIsDarkMode(darkMode);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroContent}>
        {/* Emoji icon - Responsive and smaller */}
        <div style={{
          display: 'inline-block',
          marginBottom: '0.75rem',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          animation: 'bounce 3s ease-in-out infinite'
        }}>
        </div>

        <Heading as="h1" className="hero__title" style={{
          fontSize: 'clamp(1.5rem, 6vw, 3.5rem)',
          letterSpacing: '-0.02em',
          fontWeight: 900,
          color: 'white',
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
          marginBottom: '1rem'
        }}>
          <Translate id="homepage.hero.title">{siteConfig.title}</Translate>
        </Heading>

        <p className="hero__subtitle" style={{
          fontSize: 'clamp(0.85rem, 2.5vw, 1.15rem)',
          color: 'rgba(255, 255, 255, 0.95)',
          fontWeight: 400,
          lineHeight: 1.6,
          maxWidth: '90%',
          margin: '0 auto 1.5rem',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
        }}>
          <Translate id="homepage.hero.tagline">{siteConfig.tagline}</Translate>
        </p>

        {/* Premium CTA Buttons - Responsive */}
        <div className={styles.buttons} style={{
          display: 'flex',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: 'clamp(1rem, 3vw, 2rem)',
          paddingX: '1rem'
        }}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
            style={{
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 3vw, 2rem)',
              borderRadius: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(255, 0, 0, 0.3)',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const target = e.currentTarget as HTMLAnchorElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = '0 12px 30px rgba(255, 0, 0, 0.4)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const target = e.currentTarget as HTMLAnchorElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 8px 20px rgba(255, 0, 0, 0.3)';
            }}>
            <Translate id="homepage.hero.startLearning">Start Learning</Translate>
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/intro"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              color: 'white',
              fontWeight: 600,
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 3vw, 2rem)',
              borderRadius: '0.5rem',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const target = e.currentTarget as HTMLAnchorElement;
              target.style.background = 'rgba(255, 255, 255, 0.25)';
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const target = e.currentTarget as HTMLAnchorElement;
              target.style.background = 'rgba(255, 255, 255, 0.15)';
              target.style.transform = 'translateY(0)';
            }}>
            Explore Features
          </Link>
        </div>

        {/* Feature highlights - Responsive */}
        <div style={{
          marginTop: 'clamp(1.5rem, 3vw, 3rem)',
          display: 'flex',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
          color: 'rgba(255, 255, 255, 0.85)',
          paddingX: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <span>⚡</span> <span style={{ display: 'block' }}>Instant Answers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <span>🎯</span> <span style={{ display: 'block' }}>Personalized</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            <span>📚</span> <span style={{ display: 'block' }}>Complete</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </header>
  );
}

import Layout from '@theme/Layout';

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <div className="container">
          <div>
            <HomepageFeatures />
          </div>
        </div>
      </main>
    </Layout>
  );
}
