import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { encryption } from '../src/utils/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@studymate.com' },
    update: {},
    create: {
      email: 'demo@studymate.com',
      name: 'Demo User',
      passwordHash: hashedPassword,
    },
  })

  console.log('👤 Created demo user:', demoUser.email)

  // Create sample page
  const samplePage = await prisma.page.upsert({
    where: { id: 'demo-page-1' },
    update: {},
    create: {
      id: 'demo-page-1',
      title: 'Introduction to Machine Learning',
      description: 'Comprehensive study materials for ML fundamentals',
      isPublic: true,
      shareUrl: 'ml-intro-demo',
      userId: demoUser.id,
    },
  })

  console.log('📄 Created sample page:', samplePage.title)

  // Create sample flashcards
  const flashcards = [
    {
      front: 'What is supervised learning?',
      back: 'A type of machine learning where the algorithm learns from labeled training data to make predictions on new, unseen data.',
      difficulty: 'medium',
      tags: ['supervised-learning', 'basics'],
    },
    {
      front: 'What is the difference between classification and regression?',
      back: 'Classification predicts discrete categories or classes, while regression predicts continuous numerical values.',
      difficulty: 'medium',
      tags: ['classification', 'regression'],
    },
    {
      front: 'What is overfitting?',
      back: 'When a model learns the training data too well, including noise and specific details, resulting in poor performance on new data.',
      difficulty: 'hard',
      tags: ['overfitting', 'model-evaluation'],
    },
  ]

  for (const flashcard of flashcards) {
    await prisma.flashcard.create({
      data: {
        ...flashcard,
        pageId: samplePage.id,
        isAIGenerated: false,
      },
    })
  }

  console.log('🃏 Created sample flashcards')

  // Create sample study guide
  await prisma.studyGuide.create({
    data: {
      title: 'Machine Learning Fundamentals',
      content: `# Machine Learning Fundamentals

## Overview
Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

## Key Concepts

### Types of Learning
1. **Supervised Learning**: Learning with labeled examples
   - Classification: Predicting categories
   - Regression: Predicting continuous values

2. **Unsupervised Learning**: Finding patterns in unlabeled data
   - Clustering: Grouping similar data points
   - Dimensionality reduction: Simplifying data

3. **Reinforcement Learning**: Learning through interaction and feedback

### Important Terms
- **Training Set**: Data used to train the model
- **Test Set**: Data used to evaluate model performance
- **Features**: Input variables used for prediction
- **Target**: The output variable to predict

## Common Algorithms
1. Linear Regression
2. Decision Trees
3. Random Forest
4. Support Vector Machines
5. Neural Networks

## Best Practices
- Always split data into training and testing sets
- Use cross-validation for model evaluation
- Monitor for overfitting
- Feature engineering is crucial`,
      pageId: samplePage.id,
      isAIGenerated: false,
    },
  })

  console.log('📖 Created sample study guide')

  // Create sample test
  const test = await prisma.test.create({
    data: {
      title: 'ML Fundamentals Quiz',
      timeLimit: 30,
      pageId: samplePage.id,
      isAIGenerated: false,
    },
  })

  // Create sample questions
  const questions = [
    {
      type: 'multiple_choice',
      prompt: 'Which of the following is NOT a type of machine learning?',
      options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Quantum Learning'],
      correctAnswer: 'Quantum Learning',
      points: 10,
      order: 1,
    },
    {
      type: 'multiple_choice',
      prompt: 'What is the main goal of supervised learning?',
      options: ['Find hidden patterns', 'Predict outcomes from labeled data', 'Maximize rewards', 'Reduce data dimensions'],
      correctAnswer: 'Predict outcomes from labeled data',
      points: 10,
      order: 2,
    },
    {
      type: 'short_answer',
      prompt: 'Explain what overfitting means in machine learning.',
      correctAnswer: 'Overfitting occurs when a model learns the training data too well, including noise, resulting in poor generalization to new data.',
      points: 15,
      order: 3,
    },
  ]

  for (const question of questions) {
    await prisma.question.create({
      data: {
        ...question,
        testId: test.id,
      },
    })
  }

  console.log('❓ Created sample test questions')

  // Create sample chat session
  const chatSession = await prisma.chatSession.create({
    data: {
      title: 'ML Questions & Answers',
      apiProvider: 'openai',
      contextFiles: [],
      pageId: samplePage.id,
    },
  })

  // Create sample chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        chatSessionId: chatSession.id,
        role: 'user',
        content: 'Can you explain the bias-variance tradeoff?',
      },
      {
        chatSessionId: chatSession.id,
        role: 'assistant',
        content: 'The bias-variance tradeoff is a fundamental concept in machine learning that describes the relationship between a model\'s ability to minimize bias and variance:\n\n**Bias**: Error from overly simplistic assumptions in the learning algorithm. High bias can cause the algorithm to miss relevant relations (underfitting).\n\n**Variance**: Error from sensitivity to small fluctuations in the training set. High variance can cause overfitting.\n\nThe goal is to find the right balance - a model complex enough to capture the underlying pattern (low bias) but simple enough to generalize well (low variance).',
      },
    ],
  })

  console.log('💬 Created sample chat session')

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 