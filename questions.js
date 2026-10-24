// Answers are stored as option numbers (0-based positions in these arrays),
// so reordering or editing options after people have voted would change what old votes mean.
module.exports = [
  {
    text: 'What is the best first step when asking an AI to build an app?',
    options: [
      'Ask for the whole app in one giant prompt',
      'Describe the goal, the stack and the constraints, then build in small steps',
      'Let it pick everything and accept the first answer',
      'Skip planning and start by deploying',
    ],
  },
  {
    text: 'The AI wrote code you do not understand. What should you do?',
    options: [
      'Paste it in and hope',
      'Ask it to explain, then run and test it yourself',
      'Delete it and start over without asking',
    ],
  },
  {
    text: 'Where should a database password live?',
    options: [
      'Hardcoded in the source code',
      'In a public GitHub README',
      'In an environment variable that is kept out of git',
      'In the frontend JavaScript',
    ],
  },
  {
    text: 'Your app works locally but fails after deploying. What is the most useful first move?',
    options: [
      'Read the host\'s logs for the real error message',
      'Redeploy ten times',
      'Rewrite the app from scratch',
      'Blame the AI and stop',
      'Turn off all error handling',
    ],
  },
  {
    text: 'Why should you test AI-generated code before shipping it?',
    options: [
      'AI code is always wrong',
      'It can look right and still contain bugs or unsafe shortcuts',
      'Testing is only for big companies',
    ],
  },
];
