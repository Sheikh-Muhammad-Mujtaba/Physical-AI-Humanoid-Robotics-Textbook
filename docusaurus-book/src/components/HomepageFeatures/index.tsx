import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

type FeatureItem = {
  title: string;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Module 1: Introduction to Physical AI',
    description: (
      <>
        Explore the fundamental concepts of Physical AI, its components, and the sense-plan-act cycle.
      </>
    ),
    link: '/docs/module1-introduction-to-physical-ai/chapter1-what-is-physical-ai',
  },
  {
    title: 'Module 2: Humanoid Robotics',
    description: (
      <>
        Dive into the world of humanoid robots, their anatomy, and the challenges in creating them.
      </>
    ),
    link: '/docs/module2-humanoid-robotics/chapter1-the-anatomy-of-a-humanoid-robot',
  },
  {
    title: 'Module 3: AI-Native Systems',
    description: (
      <>
        Learn about the rise of AI-native systems and the crucial role of simulation in their development.
      </>
    ),
    link: '/docs/module3-ai-native-systems/chapter1-the-rise-of-ai-native-systems',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="module-card">
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
          <Link
              className="button button--secondary button--md"
              to={link}>
              Explore Module
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
