import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Module 1: Introduction to Physical AI',
      items: [
        'module1-introduction-to-physical-ai/what-is-physical-ai',
        'module1-introduction-to-physical-ai/the-ai-robot-brain',
        'module1-introduction-to-physical-ai/the-digital-twin',
        'module1-introduction-to-physical-ai/the-robotic-nervous-system',
        'module1-introduction-to-physical-ai/vision-language-action',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Hardware Requirements',
      items: [
        'module2-hardware-requirements/workstation-requirements',
        'module2-hardware-requirements/edge-kit-requirements',
        'module2-hardware-requirements/robot-lab-options',
        'module2-hardware-requirements/summary-of-architecture',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: Cloud-Native Lab',
      items: [
        'module3-cloud-native-lab/cloud-workstations',
        'module3-cloud-native-lab/local-bridge-hardware',
        'module3-cloud-native-lab/the-latency-trap',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Economy Jetson Student Kit',
      items: [
        'module4-economy-jetson-student-kit/jetson-student-kit',
      ],
    },
  ],
};

export default sidebars;
