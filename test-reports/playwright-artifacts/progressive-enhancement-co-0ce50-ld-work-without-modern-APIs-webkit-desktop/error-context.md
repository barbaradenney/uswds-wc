# Page snapshot

```yaml
- generic [ref=e2]:
  - heading "QEe is not a function. (In 'QEe(ZEe)', 'QEe' is undefined)" [level=1] [ref=e3]
  - paragraph [ref=e4]: "The component failed to render properly, likely due to a configuration issue in Storybook. Here are some common causes and how you can address them:"
  - list [ref=e5]:
    - listitem [ref=e6]:
      - strong [ref=e7]: Missing Context/Providers
      - text: ": You can use decorators to supply specific contexts or providers, which are sometimes necessary for components to render correctly. For detailed instructions on using decorators, please visit the"
      - link "Decorators documentation" [ref=e8]:
        - /url: https://storybook.js.org/docs/writing-stories/decorators
      - text: .
    - listitem [ref=e9]:
      - strong [ref=e10]: Misconfigured Webpack or Vite
      - text: ": Verify that Storybook picks up all necessary settings for loaders, plugins, and other relevant parameters. You can find step-by-step guides for configuring"
      - link "Webpack" [ref=e11]:
        - /url: https://storybook.js.org/docs/builders/webpack
      - text: or
      - link "Vite" [ref=e12]:
        - /url: https://storybook.js.org/docs/builders/vite
      - text: with Storybook.
    - listitem [ref=e13]:
      - strong [ref=e14]: Missing Environment Variables
      - text: ": Your Storybook may require specific environment variables to function as intended. You can set up custom environment variables as outlined in the"
      - link "Environment Variables documentation" [ref=e15]:
        - /url: https://storybook.js.org/docs/configure/environment-variables
      - text: .
  - code [ref=e17]: getStoryIndexFromServer@http://localhost:6006/node_modules/.cache/storybook/1c3385a5d25e538d10b518b310c74d3ca2690b6aaffeadccd74da79736171f86/sb-vite/deps/storybook_internal_preview_runtime.js:43143:22 getStoryIndexFromServer@http://localhost:6006/node_modules/.cache/storybook/1c3385a5d25e538d10b518b310c74d3ca2690b6aaffeadccd74da79736171f86/sb-vite/deps/storybook_internal_preview_runtime.js:43142:35 initializeWithProjectAnnotations@http://localhost:6006/node_modules/.cache/storybook/1c3385a5d25e538d10b518b310c74d3ca2690b6aaffeadccd74da79736171f86/sb-vite/deps/storybook_internal_preview_runtime.js:43129:49 initializeWithProjectAnnotations@http://localhost:6006/node_modules/.cache/storybook/1c3385a5d25e538d10b518b310c74d3ca2690b6aaffeadccd74da79736171f86/sb-vite/deps/storybook_internal_preview_runtime.js:43126:44 initialize@http://localhost:6006/node_modules/.cache/storybook/1c3385a5d25e538d10b518b310c74d3ca2690b6aaffeadccd74da79736171f86/sb-vite/deps/storybook_internal_preview_runtime.js:43104:82
```