import Translate from '@docusaurus/Translate';
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
    title: <Translate id="homepage.features.module1.title">Module 1: Introduction to Physical AI</Translate>,
    description: (
      <Translate id="homepage.features.module1.description">
        Explore the foundational concepts of Physical AI, its components, and the sense-plan-act cycle.
      </Translate>
    ),
    link: '/docs/module1-introduction-to-physical-ai/what-is-physical-ai',
  },
  {
    title: <Translate id="homepage.features.module2.title">Module 2: Hardware Requirements</Translate>,
    description: (
      <Translate id="homepage.features.module2.description">
        Understand the hardware necessary to build and run your own Physical AI projects.
      </Translate>
    ),
    link: '/docs/module2-hardware-requirements/workstation-requirements',
  },
  {
    title: <Translate id="homepage.features.module3.title">Module 3: Cloud-Native Lab</Translate>,
    description: (
      <Translate id="homepage.features.module3.description">
        Learn how to set up a cloud-native lab for Physical AI development.
      </Translate>
    ),
    link: '/docs/module3-cloud-native-lab/cloud-workstations',
  },
  {
    title: <Translate id="homepage.features.module4.title">Module 4: Economy Jetson Student Kit</Translate>,
    description: (
      <Translate id="homepage.features.module4.description">
        Get a detailed breakdown of an affordable and powerful hardware kit for students.
      </Translate>
    ),
    link: '/docs/module4-economy-jetson-student-kit/jetson-student-kit',
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
                    <Translate id="homepage.features.exploreModule">Explore Module</Translate>
                  </Link>      </div>
    </div>
  );
}

function WhyThisBook(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <Heading as="h2" className="text--center">
                    <Translate id="homepage.whyThisBook.title">Why This Book?</Translate>
                </Heading>
                <div className="row">
                    <div className={clsx('col col--4')}>
                        <h3>
                            <Translate id="homepage.whyThisBook.handsOnLearning.title">Hands-On Learning</Translate>
                        </h3>
                        <p>
                            <Translate id="homepage.whyThisBook.handsOnLearning.description">
                                This book is not just about theory. You will get your hands dirty with practical exercises and projects that will solidify your understanding of Physical AI.
                            </Translate>
                        </p>
                    </div>
                    <div className={clsx('col col--4')}>
                        <h3>
                            <Translate id="homepage.whyThisBook.industryStandardTools.title">Industry-Standard Tools</Translate>
                        </h3>
                        <p>
                            <Translate id="homepage.whyThisBook.industryStandardTools.description">
                                Learn to use the same tools that are used by professionals in the robotics industry, including ROS 2, Gazebo, and NVIDIA Isaac.
                            </Translate>
                        </p>
                    </div>
                    <div className={clsx('col col--4')}>
                        <h3>
                            <Translate id="homepage.whyThisBook.comprehensiveCurriculum.title">Comprehensive Curriculum</Translate>
                        </h3>
                        <p>
                            <Translate id="homepage.whyThisBook.comprehensiveCurriculum.description">
                                From the basics of ROS 2 to advanced topics like VLA models, this book covers everything you need to know to get started with Physical AI.
                            </Translate>
                        </p>
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
                <Heading as="h2" className="text--center">
                    <Translate id="homepage.testimonials.title">What Our Readers Say</Translate>
                </Heading>
                <div className="row">
                    <div className={clsx('col col--4')}>
                        <blockquote>
                            <p>
                                <Translate id="homepage.testimonials.testimonial1.quote">
                                    "This is the best book on Physical AI I have ever read. It's comprehensive, practical, and easy to follow."
                                </Translate>
                            </p>
                            <cite>
                                <Translate id="homepage.testimonials.testimonial1.author">- John Doe, Robotics Engineer</Translate>
                            </cite>
                        </blockquote>
                    </div>
                    <div className={clsx('col col--4')}>
                        <blockquote>
                            <p>
                                <Translate id="homepage.testimonials.testimonial2.quote">
                                    "I was able to build my first robot after reading this book. Highly recommended!"
                                </Translate>
                            </p>
                            <cite>
                                <Translate id="homepage.testimonials.testimonial2.author">- Jane Smith, AI Enthusiast</Translate>
                            </cite>
                        </blockquote>
                    </div>
                    <div className={clsx('col col--4')}>
                        <blockquote>
                            <p>
                                <Translate id="homepage.testimonials.testimonial3.quote">
                                    "A must-read for anyone who wants to get into the exciting field of robotics."
                                </Translate>
                            </p>
                            <cite>
                                <Translate id="homepage.testimonials.testimonial3.author">- Sam Wilson, Researcher</Translate>
                            </cite>
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
                <Heading as="h2" className="text--center">
                    <Translate id="homepage.quickLinks.title">Quick Links</Translate>
                </Heading>
                <div className="quick-links-container">
                    <Link to="/docs/module1-introduction-to-physical-ai/what-is-physical-ai">
                        <Translate id="homepage.quickLinks.module1">Module 1: Intro to Physical AI</Translate>
                    </Link>
                    <Link to="/docs/module2-hardware-requirements/workstation-requirements">
                        <Translate id="homepage.quickLinks.module2">Module 2: Hardware</Translate>
                    </Link>
                    <Link to="/docs/module3-cloud-native-lab/cloud-workstations">
                        <Translate id="homepage.quickLinks.module3">Module 3: Cloud Lab</Translate>
                    </Link>
                    <Link to="/docs/module4-economy-jetson-student-kit/jetson-student-kit">
                        <Translate id="homepage.quickLinks.module4">Module 4: Student Kit</Translate>
                    </Link>
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