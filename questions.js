// Answers are stored as option numbers (0-based positions in these arrays),
// so reordering or editing options after people have voted would change what old votes mean.
module.exports = [
  {
    text: 'How was the pace of today\'s session?',
    options: ['Too slow', 'Just right', 'A bit fast', 'Far too fast'],
  },
  {
    text: 'Which part of today\'s deployment demo was most useful?',
    options: [
      'Setting up the server over SSH',
      'Pushing code and watching GitHub Actions deploy it',
      'Secrets and keeping credentials out of the code',
      'Checking the app is healthy after a deploy',
    ],
  },
  {
    text: 'How confident are you that you could deploy an app on your own now?',
    options: ['Not at all', 'Slightly', 'Fairly confident', 'Very confident'],
  },
  {
    text: 'Which part was hardest to follow?',
    options: [
      'Linux commands and nano',
      'SSH keys',
      'The GitHub Actions workflow file',
      'Nothing, it all made sense',
    ],
  },
  {
    text: 'What should the next session focus on?',
    options: [
      'More hands-on practice time',
      'Fixing things when a deploy breaks',
      'Domain names and HTTPS',
      'Building more features in the app',
      'Revision of the basics',
    ],
  },
];
