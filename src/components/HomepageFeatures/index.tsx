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
    link: '/module1-introduction-to-physical-ai/what-is-physical-ai',
  },
  {
    title: 'Module 2: Hardware Requirements',
    description: (
      <>
        Understand the hardware necessary to build and run your own Physical AI projects.
      </>
    ),
    link: '/module2-hardware-requirements/workstation-requirements',
  },
  {
    title: 'Module 3: Cloud-Native Lab',
    description: (
      <>
        Learn how to set up a cloud-native lab for Physical AI development.
      </>
    ),
    link: '/module3-cloud-native-lab/cloud-workstations',
  },
  {
    title: 'Module 4: Economy Jetson Student Kit',
    description: (
      <>
        Get a detailed breakdown of an affordable and powerful hardware kit for students.
      </>
    ),
    link: '/module4-economy-jetson-student-kit/jetson-student-kit',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className="module-card">
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link
            className="button button--primary button--md"
            to={link}>
            Explore Module
          </Link>
      </div>
    </div>
  );
}

function WhyThisBook(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <Heading as="h2" className="text--center">Why This Book?</Heading>
                <div className="row">
                    <div className={clsx('col col--4')}>
                        <h3>Hands-On Learning</h3>
                        <p>This book is not just about theory. You will get your hands dirty with practical exercises and projects that will solidify your understanding of Physical AI.</p>
                    </div>
                    <div className={clsx('col col--4')}>
                        <h3>Industry-Standard Tools</h3>
                        <p>Learn to use the same tools that are used by professionals in the robotics industry, including ROS 2, Gazebo, and NVIDIA Isaac.</p>
                    </div>
                    <div className={clsx('col col--4')}>
                        <h3>Comprehensive Curriculum</h3>
                        <p>From the basics of ROS 2 to advanced topics like VLA models, this book covers everything you need to know to get started with Physical AI.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Testimonials(): ReactNode {
    return (
        <section className={clsx(styles.features, styles.testimonials)}>
            <div className="container">
                <Heading as="h2" className="text--center">What Our Readers Say</Heading>
                <div className="row">
                    <div className={clsx('col col--4')}>
                        <blockquote>
                            <p>"This is the best book on Physical AI I have ever read. It's comprehensive, practical, and easy to follow."</p>
                            <cite>- John Doe, Robotics Engineer</cite>
                        </blockquote>
                    </div>
                    <div className={clsx('col col--4')}>
                        <blockquote>
                            <p>"I was able to build my first robot after reading this book. Highly recommended!"</p>
                            <cite>- Jane Smith, AI Enthusiast</cite>
                        </blockquote>
                    </div>
                    <div className={clsx('col col--4')}>
                        <blockquote>
                            <p>"A must-read for anyone who wants to get into the exciting field of robotics."</p>
                            <cite>- Sam Wilson, Researcher</cite>
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    );
}

function QuickLinks(): ReactNode {
    return (
        <section className="quick-links-section">
            <div className="container">
                <Heading as="h2" className="text--center">Quick Links</Heading>
                <div className="quick-links-container">
                    <Link to="/docs/module1-introduction-to-physical-ai/what-is-physical-ai">Module 1: Intro to Physical AI</Link>
                    <Link to="/docs/module2-hardware-requirements/workstation-requirements">Module 2: Hardware</Link>
                    <Link to="/docs/module3-cloud-native-lab/cloud-workstations">Module 3: Cloud Lab</Link>
                    <Link to="/docs/module4-economy-jetson-student-kit/jetson-student-kit">Module 4: Student Kit</Link>
                </div>
            </div>
        </section>
    );
}


export default function HomepageFeatures(): ReactNode {
  return (
    <>
        <QuickLinks />
        <section className={styles.features}>
          <div className="container">
            <div className="feature-list">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
        <WhyThisBook />
        <Testimonials />
    </>
  );
}