import { sample } from 'lodash-es'

import type { User } from '../src/client'
/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { db } from '../src/index'

const THREAD_SEED_DATA = [
  {
    setup: 'Why did the engineer cross the road?',
    punchlines: [
      {
        text: 'To optimize the crossing algorithm for minimal time complexity',
        reactions: [
          '*groans*',
          "That's such an engineer answer",
          'Of course they did',
          '*slow clap*',
        ],
      },
      {
        text: 'Because the light finally turned green after debugging for 3 hours',
        reactions: [
          'Too real',
          'I feel attacked',
          '*nervous laughter*',
          'Why must you hurt me this way?',
        ],
      },
      {
        text: 'To avoid the undefined behavior on this side',
        reactions: [
          '*snort laugh*',
          'Classic',
          "Someone's been coding in C",
          'Segmentation fault: humor core dumped',
        ],
      },
      {
        text: 'The requirements specified the deliverable must be on the other side',
        reactions: [
          '*bitter laughter*',
          'Agile in a nutshell',
          'But did they update the Jira ticket?',
          '*cries in scope creep*',
        ],
      },
    ],
  },
  {
    setup: 'How many engineers does it take to change a lightbulb?',
    punchlines: [
      {
        text: "None, it's a hardware problem",
        reactions: [
          'Typical software engineer',
          '*eye roll*',
          'Not my department!',
          'Have you tried turning it off and on again?',
        ],
      },
      {
        text: "Just one, but they'll need six months to design a robot to do it",
        reactions: [
          "And it'll be over budget",
          "Don't forget the 200-page documentation",
          '*laughs then cries*',
          'But the robot is really cool though',
        ],
      },
      {
        text: "Three: one to hold the ladder, one to document the process, and one to argue we should've gone with LEDs from the start",
        reactions: [
          "There's always that one guy",
          'LED guy has a point',
          'You forgot the project manager',
          '*nods knowingly*',
        ],
      },
      {
        text: 'Five: one to change it and four to argue about whether it meets specifications',
        reactions: [
          'This is why nothing gets done',
          'Only four arguing?',
          'Standards committee has entered the chat',
          '*Vietnam flashback to design reviews*',
        ],
      },
    ],
  },
  {
    setup: 'An engineer walks into a bar...',
    punchlines: [
      {
        text: 'Orders 1.0 beers, gets floating point error',
        reactions: [
          '*cries in IEEE 754*',
          "Should've used decimal type",
          '0.999999999 beers close enough?',
          'JavaScript moment',
        ],
      },
      {
        text: 'Orders 0 beers. Orders 999999999 beers. Orders -1 beers. Orders a lizard.',
        reactions: [
          'Found the QA engineer',
          'Fuzzing the bartender',
          "This is why we can't have nice things",
          "*chef's kiss* Perfect edge case testing",
        ],
      },
      {
        text: "And says 'This could be 30% more efficient'",
        reactions: [
          'Let people enjoy things!',
          "He's not wrong though",
          '*exhausted sigh*',
          "Sir, this is a Wendy's",
        ],
      },
      {
        text: "The bartender says 'We don't serve time travelers.' An engineer walks into a bar.",
        reactions: [
          '*confused screaming*',
          'Race condition detected',
          'Took me a second',
          '*brain.exe has stopped working*',
        ],
      },
    ],
  },
  {
    setup:
      "What's the difference between mechanical engineers and civil engineers?",
    punchlines: [
      {
        text: 'Mechanical engineers build weapons, civil engineers build targets',
        reactions: [
          'Dark but accurate',
          '*nervous laughter*',
          'Oof',
          'Military-industrial complex has entered the chat',
        ],
      },
      {
        text: 'Mechanical engineers deal with moving disasters, civil engineers deal with stationary ones',
        reactions: [
          'As a MechE, can confirm',
          'Bridge has left the chat',
          '*laughs in structural failure*',
          'Tacoma Narrows Bridge would like a word',
        ],
      },
      {
        text: 'About $5,000 in starting salary',
        reactions: [
          '*cries in student loans*',
          "It's funny because it's true",
          'Software engineers: *laughs in $150k*',
          'Pain',
        ],
      },
      {
        text: "One makes things that move, the other makes things that shouldn't",
        reactions: [
          '*looks nervously at bridge*',
          "Emphasis on SHOULDN'T",
          'Until the earthquake',
          'Tell that to my washing machine',
        ],
      },
    ],
  },
  {
    setup: 'Why do programmers always mix up Halloween and Christmas?',
    punchlines: [
      {
        text: 'Because Oct 31 = Dec 25',
        reactions: [
          "*chef's kiss*",
          'This is peak nerd humor',
          'Took me a minute',
          'Base 8 joke, nice',
        ],
      },
      {
        text: 'Because both involve dealing with scary legacy code',
        reactions: [
          '*PTSD intensifies*',
          'Too real, too real',
          'The horror... the horror...',
          'COBOL has entered the chat',
        ],
      },
      {
        text: 'Because both require extensive debugging of decorations',
        reactions: [
          'Why is there always that ONE bulb?',
          'Untangling Christmas lights = untangling spaghetti code',
          '*frustrated programmer noises*',
          'Have you tried replacing all the bulbs?',
        ],
      },
      {
        text: 'Because stack overflow happens at family dinners',
        reactions: [
          'Recursive family drama',
          'Maximum call stack exceeded',
          '*uncomfortable laugh*',
          'Catch(familyException)',
        ],
      },
    ],
  },
  {
    setup: 'What did the electrical engineer say when they got shocked?',
    punchlines: [
      {
        text: 'That hertz!',
        reactions: [
          '*angry upvote*',
          'Get out',
          'Dad joke level: electrical engineer',
          '*throws multimeter*',
        ],
      },
      {
        text: 'Current situation: not grounded',
        reactions: [
          'I see what you did there',
          'Resistance is futile',
          'Pun game is strong',
          '*slow clap while groaning*',
        ],
      },
      {
        text: 'Watt just happened?',
        reactions: [
          'Ohm my god, stop',
          'These puns are revolting',
          "I'm not even mad",
          'Somebody call the pun police',
        ],
      },
      {
        text: 'This is revolting... I need more resistance to this job',
        reactions: [
          'Double pun combo!',
          "You've gone too far",
          'Peak electrical humor',
          'The capacity for these puns is unlimited',
        ],
      },
    ],
  },
  {
    setup:
      'A software engineer, a hardware engineer, and a manager are in a car going down a mountain when the brakes fail...',
    punchlines: [
      {
        text: "The manager says: 'Let's have a meeting to discuss our options'",
        reactions: [
          "While we're actively crashing",
          'Let me schedule that for next Tuesday',
          'We need a steering committee',
          '*dies in bureaucracy*',
        ],
      },
      {
        text: "The hardware engineer says: 'I can fix the brake caliper mechanism'",
        reactions: [
          'At 60 mph?',
          'Good luck with that',
          'With what tools?!',
          "Should've brought the oscilloscope",
        ],
      },
      {
        text: "The software engineer says: 'Let's push it back up and see if it happens again'",
        reactions: [
          'Can reproduce: death',
          'Classic debugging',
          'It works on my mountain',
          'Have you tried rebooting the car?',
        ],
      },
      {
        text: "All three say in unison: 'Should've done more testing'",
        reactions: [
          'QA team vindicated',
          "Unit tests would've caught this",
          'But we had to meet the deadline!',
          '*laughs then realizes this is their actual job*',
        ],
      },
    ],
  },
  {
    setup: "Why don't engineers tell good jokes timing?",
    punchlines: [
      {
        text: 'Because they always try to parallelize the punchline',
        reactions: [
          'Multithreaded humor',
          'Race condition on the punchline',
          'Async/await the laughter',
          'Concurrent comedy is hard',
        ],
      },
      {
        text: 'The punchline is still compiling',
        reactions: [
          '*waiting intensifies*',
          'Must be using Maven',
          'C++ template joke',
          "Go make coffee, this'll take a while",
        ],
      },
      {
        text: "They're waiting for the callback",
        reactions: [
          'Promise rejected: humor',
          'Node.js has entered the chat',
          '.then(laugh)',
          'Callback hell is real',
        ],
      },
      {
        text: 'Because... *buffering*... timing',
        reactions: [
          'I felt this joke loading',
          '*dial-up modem sounds*',
          'Network latency strikes again',
          'Needs more bandwidth',
        ],
      },
    ],
  },
  {
    setup: "What's an engineer's favorite type of tree?",
    punchlines: [
      {
        text: 'Binary tree (software engineers)',
        reactions: [
          'Perfectly balanced',
          'As all things should be',
          'O(log n) joke',
          'But is it a red-black tree?',
        ],
      },
      {
        text: 'Geometry (civil engineers)',
        reactions: [
          "That's not even a tree!",
          '*facepalm*',
          "Civil engineers: 'Close enough'",
          'Within tolerance',
        ],
      },
      {
        text: 'Current bush (electrical engineers)',
        reactions: [
          'AC or DC?',
          "That's shockingly bad",
          'Watt a terrible pun',
          'Branch current method approved',
        ],
      },
      {
        text: 'Fault tree (quality engineers)',
        reactions: [
          'Root cause: this joke',
          'Analysis shows 100% groan rate',
          'FMEA of this humor: critical failure',
          'Six Sigma certified dad joke',
        ],
      },
    ],
  },
  {
    setup:
      'Two engineers are standing at the base of a flagpole, trying to measure its height...',
    punchlines: [
      {
        text: "A manager walks by and says 'You're doing it wrong, just measure the shadow'",
        reactions: [
          'Classic management',
          'Thanks for the helpful input',
          "Why didn't we think of that?",
          '*at night*',
        ],
      },
      {
        text: "An artist walks by, lays it down, measures it, and walks away. The engineers say 'We wanted the height, not the length!'",
        reactions: [
          'Peak engineer brain',
          'Task failed successfully',
          '*facepalm*',
          'Technically correct, the best kind',
        ],
      },
      {
        text: 'They spend three hours deriving equations using trigonometry when a kid with a tape measure solves it in 30 seconds',
        reactions: [
          'Over-engineering at its finest',
          'But the math was beautiful',
          'PhD vs practical knowledge',
          'Sometimes the simple solution...',
        ],
      },
      {
        text: 'They write a 47-page proposal for a drone-based LIDAR measurement system',
        reactions: [
          'Only 47 pages?',
          'Budget: $2.3 million',
          'Timeline: 18 months',
          'Meanwhile the flagpole falls over',
        ],
      },
    ],
  },
]

const seedUsers = () => {
  return db.user.createManyAndReturn({
    data: [
      {
        name: 'User',
        email: 'user@open.gov.sg',
      },
      {
        name: 'Alice',
        email: 'alice@open.gov.sg',
      },
      {
        name: 'Bob',
        email: 'bob@open.gov.sg',
      },
      {
        name: 'Eve',
        email: 'eve@open.gov.sg',
      },
    ],
  })
}

async function seedThreadData(users: User[]) {
  const promises = THREAD_SEED_DATA.map(async (seed) => {
    const punchlines = sample(seed.punchlines)
    const thread = await db.thread.create({
      data: {
        title: seed.setup,
        content: punchlines?.text ?? '',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        authorId: sample(users)!.id,
      },
    })
    await db.comment.create({
      data: {
        threadId: thread.id,
        content: sample(punchlines?.reactions) ?? 'sounds good to me',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        authorId: sample(users)!.id,
      },
    })
    await db.comment.create({
      data: {
        threadId: thread.id,
        content: sample(punchlines?.reactions) ?? 'sounds good to me',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        authorId: sample(users)!.id,
      },
    })
  })

  await Promise.all(promises)
}

async function main() {
  // Add seed data here
  const users = await seedUsers()
  await seedThreadData(users)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

  .finally(async () => {
    await db.$disconnect()
  })
