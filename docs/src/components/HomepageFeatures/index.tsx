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
        Explore the foundational concepts of Physical AI, its components, and the sense-plan-act cycle.
      </>
    ),
    link: './docs/module1-introduction-to-physical-ai/what-is-physical-ai',
  },
  {
    title: 'Module 2: Hardware Requirements',
    description: (
      <>
        Understand the hardware necessary to build and run your own Physical AI projects.
      </>
    ),
    link: './docs/module2-hardware-requirements/workstation-requirements',
  },
  {
    title: 'Module 3: Cloud-Native Lab',
    description: (
      <>
        Learn how to set up a cloud-native lab for Physical AI development.
      </>
    ),
    link: './docs/module3-cloud-native-lab/cloud-workstations',
  },
  {
    title: 'Module 4: Economy Jetson Student Kit',
    description: (
      <>
        Get a detailed breakdown of an affordable and powerful hardware kit for students.
      </>
    ),
    link: './docs/module4-economy-jetson-student-kit/jetson-student-kit',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div>
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
        <div className="feature-list">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}