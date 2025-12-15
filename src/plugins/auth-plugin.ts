import type { Plugin, LoadContext, PluginOptions } from '@docusaurus/types';

export default function authPlugin(
  context: LoadContext,
  options: PluginOptions
): Plugin<void> {
  return {
    name: 'docusaurus-auth-plugin',
    // Auth is handled via Root.tsx wrapper, no additional page wrapping needed here
    // This plugin can be used for auth-related build-time configurations if needed
  };
}