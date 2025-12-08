import React, {type ReactNode} from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type {WrapperProps} from '@docusaurus/types';
import ChatBot from '../../components/ChatBot'; // Import the ChatBot

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): ReactNode {
  return (
    <>
      <Layout {...props} />
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        width: '400px', // Adjust width as needed
        height: '600px', // Adjust height as needed
        maxHeight: '80vh',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        overflow: 'hidden', // Ensures the chatbot stays within the rounded corners
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        <ChatBot />
      </div>
    </>
  );
}
