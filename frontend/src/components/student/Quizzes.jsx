import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quizzes.css';

const Quizzes = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false); // Fixed: Added missing '='
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userSubjects, setUserSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Complete subjects database (all available subjects) with 20 questions each
  const allSubjects = [
    { 
      id: 1, 
      name: 'Mathematics', 
      code: 'MAT1503', 
      icon: '📐',
      color: '#3b82f6',
      description: 'Algebra, Calculus, Trigonometry',
      totalQuizzes: 8,
      quizzes: [
        { 
          id: 101, 
          title: 'Algebra Fundamentals', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Medium',
          attempts: 234,
          success: 78,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'Solve for x: 2x + 5 = 15', options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 5.5'], correct: 0, marks: 1 },
            { id: 2, question: 'What is the value of y when x = 3 in the equation y = 2x² + 3x - 4?', options: ['23', '20', '17', '14'], correct: 0, marks: 1 },
            { id: 3, question: 'Simplify: (3x²y³)²', options: ['9x⁴y⁶', '6x⁴y⁶', '9x²y⁶', '3x⁴y⁶'], correct: 0, marks: 1 },
            { id: 4, question: 'Factor completely: x² - 9', options: ['(x-3)(x+3)', '(x-3)²', '(x+3)²', '(x-9)(x+1)'], correct: 0, marks: 1 },
            { id: 5, question: 'What is the slope of the line through (2,3) and (4,7)?', options: ['2', '1', '3', '4'], correct: 0, marks: 1 },
            { id: 6, question: 'Solve for x: x² - 5x + 6 = 0', options: ['x = 2,3', 'x = -2,-3', 'x = 1,6', 'x = -1,-6'], correct: 0, marks: 1 },
            { id: 7, question: 'What is the derivative of 3x²?', options: ['6x', '3x', '6', '3x²'], correct: 0, marks: 1 },
            { id: 8, question: 'If f(x) = 2x + 1, find f(3)', options: ['7', '6', '8', '5'], correct: 0, marks: 1 },
            { id: 9, question: 'What is the area of a circle with radius 5?', options: ['25π', '10π', '5π', '20π'], correct: 0, marks: 1 },
            { id: 10, question: 'Solve: 3(2x - 4) = 18', options: ['x = 5', 'x = 6', 'x = 4', 'x = 7'], correct: 0, marks: 1 },
            { id: 11, question: 'What is the value of 5! (5 factorial)?', options: ['120', '60', '24', '720'], correct: 0, marks: 1 },
            { id: 12, question: 'Solve for x: 3x - 7 = 2x + 5', options: ['x = 12', 'x = 2', 'x = -2', 'x = 5'], correct: 0, marks: 1 },
            { id: 13, question: 'What is the square root of 144?', options: ['12', '14', '16', '18'], correct: 0, marks: 1 },
            { id: 14, question: 'If f(x) = 3x + 2, find f(4)', options: ['14', '12', '10', '16'], correct: 0, marks: 1 },
            { id: 15, question: 'What is the value of 2⁵?', options: ['32', '25', '10', '64'], correct: 0, marks: 1 },
            { id: 16, question: 'Solve: 4(x - 3) = 20', options: ['x = 8', 'x = 5', 'x = 6', 'x = 7'], correct: 0, marks: 1 },
            { id: 17, question: 'What is the median of 2, 5, 8, 11, 14?', options: ['8', '5', '11', '14'], correct: 0, marks: 1 },
            { id: 18, question: 'Simplify: 2(3x + 4) - 5x', options: ['x + 8', '6x + 8 - 5x', 'x + 4', '6x + 8'], correct: 0, marks: 1 },
            { id: 19, question: 'What is 15% of 200?', options: ['30', '20', '40', '25'], correct: 0, marks: 1 },
            { id: 20, question: 'Solve: 2x² = 50', options: ['x = ±5', 'x = 5', 'x = ±10', 'x = 10'], correct: 0, marks: 1 },
          ]
        },
        { 
          id: 102, 
          title: 'Trigonometry Basics', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Hard',
          attempts: 156,
          success: 62,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'sin(30°) = ?', options: ['1/2', '√3/2', '1/√2', '1'], correct: 0, marks: 1 },
            { id: 2, question: 'cos(60°) = ?', options: ['1/2', '√3/2', '1/√2', '0'], correct: 0, marks: 1 },
            { id: 3, question: 'tan(45°) = ?', options: ['1', '0', '∞', '√3'], correct: 0, marks: 1 },
            { id: 4, question: 'sin(90°) = ?', options: ['1', '0', '1/2', '√2/2'], correct: 0, marks: 1 },
            { id: 5, question: 'cos(0°) = ?', options: ['1', '0', '1/2', '√2/2'], correct: 0, marks: 1 },
            { id: 6, question: 'In a right triangle, sin θ = opposite/?', options: ['hypotenuse', 'adjacent', 'opposite', 'base'], correct: 0, marks: 1 },
            { id: 7, question: 'What is the value of sin²θ + cos²θ?', options: ['1', '0', '2', 'sin θ cos θ'], correct: 0, marks: 1 },
            { id: 8, question: 'If sin θ = 3/5, what is cos θ?', options: ['4/5', '5/4', '3/4', '4/3'], correct: 0, marks: 1 },
            { id: 9, question: 'What is the value of sin(45°)?', options: ['√2/2', '1/2', '√3/2', '1'], correct: 0, marks: 1 },
            { id: 10, question: 'What is the value of cos(30°)?', options: ['√3/2', '1/2', '√2/2', '1'], correct: 0, marks: 1 },
            { id: 11, question: 'What is tan(60°)?', options: ['√3', '1', '1/√3', '0'], correct: 0, marks: 1 },
            { id: 12, question: 'What is the reciprocal of sine?', options: ['cosecant', 'secant', 'cotangent', 'cosine'], correct: 0, marks: 1 },
            { id: 13, question: 'What is the reciprocal of cosine?', options: ['secant', 'cosecant', 'cotangent', 'sine'], correct: 0, marks: 1 },
            { id: 14, question: 'What is the reciprocal of tangent?', options: ['cotangent', 'secant', 'cosecant', 'cosine'], correct: 0, marks: 1 },
            { id: 15, question: 'sin(180°) = ?', options: ['0', '1', '-1', '1/2'], correct: 0, marks: 1 },
            { id: 16, question: 'cos(180°) = ?', options: ['-1', '1', '0', '1/2'], correct: 0, marks: 1 },
            { id: 17, question: 'What is the period of sine function?', options: ['360°', '180°', '90°', '720°'], correct: 0, marks: 1 },
            { id: 18, question: 'What is the amplitude of y = 2 sin x?', options: ['2', '1', '3', '4'], correct: 0, marks: 1 },
            { id: 19, question: 'What is the value of sin(270°)?', options: ['-1', '0', '1', '1/2'], correct: 0, marks: 1 },
            { id: 20, question: 'What is the value of cos(90°)?', options: ['0', '1', '-1', '1/2'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
    { 
      id: 2, 
      name: 'Mathematical Literacy', 
      code: 'MATLIT1501', 
      icon: '🧮',
      color: '#f97316',
      description: 'Financial Maths, Data Handling, Probability',
      totalQuizzes: 6,
      quizzes: [
        { 
          id: 201, 
          title: 'Financial Mathematics', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Medium',
          attempts: 189,
          success: 72,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'Simple interest formula is:', options: ['I = P × r × t', 'I = P(1 + r)^t', 'I = P + rt', 'I = P/r × t'], correct: 0, marks: 1 },
            { id: 2, question: 'If you invest R1000 at 5% simple interest for 2 years, the interest is:', options: ['R100', 'R50', 'R200', 'R150'], correct: 0, marks: 1 },
            { id: 3, question: 'Compound interest formula is:', options: ['A = P(1 + r)^t', 'A = P × r × t', 'A = P + rt', 'A = P(1 + rt)'], correct: 0, marks: 1 },
            { id: 4, question: 'VAT in South Africa is currently:', options: ['15%', '14%', '16%', '13%'], correct: 0, marks: 1 },
            { id: 5, question: 'If a shirt costs R200 excluding VAT, the total price including VAT is:', options: ['R230', 'R220', 'R240', 'R210'], correct: 0, marks: 1 },
            { id: 6, question: 'Profit is calculated as:', options: ['Selling Price - Cost Price', 'Cost Price - Selling Price', 'Selling Price + Cost Price', 'Selling Price × Cost Price'], correct: 0, marks: 1 },
            { id: 7, question: 'A discount of 20% on a R500 item saves you:', options: ['R100', 'R50', 'R150', 'R200'], correct: 0, marks: 1 },
            { id: 8, question: 'Exchange rate: If $1 = R15, how many rands for $50?', options: ['R750', 'R500', 'R650', 'R800'], correct: 0, marks: 1 },
            { id: 9, question: 'If you borrow R5000 at 8% simple interest for 3 years, what is the total interest?', options: ['R1200', 'R1000', 'R800', 'R1400'], correct: 0, marks: 1 },
            { id: 10, question: 'What is 12% of R2500?', options: ['R300', 'R250', 'R350', 'R400'], correct: 0, marks: 1 },
            { id: 11, question: 'If a TV costs R5000 after a 20% discount, what was the original price?', options: ['R6250', 'R6000', 'R5500', 'R6500'], correct: 0, marks: 1 },
            { id: 12, question: 'Calculate 15% tip on a R450 meal', options: ['R67.50', 'R45', 'R90', 'R75'], correct: 0, marks: 1 },
            { id: 13, question: 'If population increases from 2000 to 2500, what is the percentage increase?', options: ['25%', '20%', '30%', '15%'], correct: 0, marks: 1 },
            { id: 14, question: 'A car depreciates 15% per year. If it costs R200000 new, what is it worth after 1 year?', options: ['R170000', 'R180000', 'R165000', 'R175000'], correct: 0, marks: 1 },
            { id: 15, question: 'What is the monthly repayment on a R100000 loan at 12% per annum over 5 years?', options: ['R2224', 'R2000', 'R2500', 'R1800'], correct: 0, marks: 1 },
            { id: 16, question: 'If you save R500 per month for 2 years at 6% compound interest, what is the future value?', options: ['R12700', 'R12000', 'R13000', 'R12500'], correct: 0, marks: 1 },
            { id: 17, question: 'What is the effective annual rate if nominal rate is 12% compounded monthly?', options: ['12.68%', '12%', '13%', '12.5%'], correct: 0, marks: 1 },
            { id: 18, question: 'If you need R50000 in 5 years at 8% compound interest, how much must you invest now?', options: ['R34029', 'R35000', 'R33000', 'R36000'], correct: 0, marks: 1 },
            { id: 19, question: 'What is the future value of R1000 invested for 3 years at 10% compound interest?', options: ['R1331', 'R1300', 'R1400', 'R1250'], correct: 0, marks: 1 },
            { id: 20, question: 'If inflation is 6% per year, what will R100 be worth in 5 years?', options: ['R74.73', 'R70', 'R80', 'R65'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
    { 
      id: 3, 
      name: 'Physical Science', 
      code: 'PHY1501', 
      icon: '⚛️',
      color: '#10b981',
      description: 'Physics, Chemistry',
      totalQuizzes: 6,
      quizzes: [
        { 
          id: 301, 
          title: 'Newton\'s Laws of Motion', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Medium',
          attempts: 178,
          success: 71,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'Newton\'s First Law is also known as:', options: ['Law of Inertia', 'Law of Acceleration', 'Action-Reaction', 'Law of Gravity'], correct: 0, marks: 1 },
            { id: 2, question: 'Force = mass × ?', options: ['acceleration', 'velocity', 'distance', 'time'], correct: 0, marks: 1 },
            { id: 3, question: 'Unit of force is:', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correct: 0, marks: 1 },
            { id: 4, question: 'For every action, there is an equal and opposite reaction. This is:', options: ['Newton\'s Third Law', 'Newton\'s First Law', 'Newton\'s Second Law', 'Law of Gravitation'], correct: 0, marks: 1 },
            { id: 5, question: 'What is acceleration due to gravity on Earth?', options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '9.8 km/s²'], correct: 0, marks: 1 },
            { id: 6, question: 'Mass is measured in:', options: ['kg', 'N', 'm/s²', 'J'], correct: 0, marks: 1 },
            { id: 7, question: 'Weight is:', options: ['mass × gravity', 'mass/gravity', 'gravity/mass', 'mass + gravity'], correct: 0, marks: 1 },
            { id: 8, question: 'If mass = 10kg and acceleration = 2m/s², force = ?', options: ['20N', '5N', '12N', '8N'], correct: 0, marks: 1 },
            { id: 9, question: 'What is the SI unit of energy?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 0, marks: 1 },
            { id: 10, question: 'Kinetic energy depends on:', options: ['mass and velocity', 'mass and height', 'velocity and height', 'mass only'], correct: 0, marks: 1 },
            { id: 11, question: 'Potential energy depends on:', options: ['mass and height', 'mass and velocity', 'velocity and height', 'mass only'], correct: 0, marks: 1 },
            { id: 12, question: 'What is the speed of light in vacuum?', options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁵ m/s', '3 × 10⁷ m/s'], correct: 0, marks: 1 },
            { id: 13, question: 'What is the unit of power?', options: ['Watt', 'Joule', 'Newton', 'Pascal'], correct: 0, marks: 1 },
            { id: 14, question: '1 kilowatt-hour is a unit of:', options: ['energy', 'power', 'force', 'work'], correct: 0, marks: 1 },
            { id: 15, question: 'What is the atomic number of Carbon?', options: ['6', '12', '8', '4'], correct: 0, marks: 1 },
            { id: 16, question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correct: 0, marks: 1 },
            { id: 17, question: 'pH of pure water is:', options: ['7', '0', '14', '10'], correct: 0, marks: 1 },
            { id: 18, question: 'What is the boiling point of water in Celsius?', options: ['100°C', '0°C', '50°C', '212°C'], correct: 0, marks: 1 },
            { id: 19, question: 'What is the freezing point of water in Celsius?', options: ['0°C', '100°C', '32°C', '-10°C'], correct: 0, marks: 1 },
            { id: 20, question: 'What is the chemical formula for water?', options: ['H₂O', 'CO₂', 'O₂', 'H₂'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
    { 
      id: 4, 
      name: 'English', 
      code: 'ENG1502', 
      icon: '📝',
      color: '#f59e0b',
      description: 'Grammar, Literature, Comprehension',
      totalQuizzes: 5,
      quizzes: [
        { 
          id: 401, 
          title: 'Grammar Essentials', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Easy',
          attempts: 201,
          success: 82,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'Which sentence is grammatically correct?', options: [
              'She go to school', 
              'She goes to school', 
              'She going to school', 
              'She is go to school'
            ], correct: 1, marks: 1 },
            { id: 2, question: 'Choose the correct past tense of "run":', options: ['ran', 'runned', 'run', 'running'], correct: 0, marks: 1 },
            { id: 3, question: 'Identify the noun in: "The beautiful girl sings well"', options: ['girl', 'beautiful', 'sings', 'well'], correct: 0, marks: 1 },
            { id: 4, question: 'Which is a preposition?', options: ['under', 'quickly', 'run', 'blue'], correct: 0, marks: 1 },
            { id: 5, question: 'Choose the correct article: "___ university"', options: ['a', 'an', 'the', 'none'], correct: 0, marks: 1 },
            { id: 6, question: 'What is a noun?', options: ['A person, place, or thing', 'An action word', 'A describing word', 'A connecting word'], correct: 0, marks: 1 },
            { id: 7, question: 'What is a verb?', options: ['An action word', 'A person, place, or thing', 'A describing word', 'A connecting word'], correct: 0, marks: 1 },
            { id: 8, question: 'What is an adjective?', options: ['A describing word', 'An action word', 'A person, place, or thing', 'A connecting word'], correct: 0, marks: 1 },
            { id: 9, question: 'Choose the correct plural of "child"', options: ['children', 'childs', 'childes', 'children'], correct: 0, marks: 1 },
            { id: 10, question: 'Choose the correct possessive form: "The car of John"', options: ['John\'s car', 'Johns car', 'Jhon car', 'Car of Johns'], correct: 0, marks: 1 },
            { id: 11, question: 'Which is a conjunction?', options: ['and', 'quickly', 'run', 'blue'], correct: 0, marks: 1 },
            { id: 12, question: 'Which is an adverb?', options: ['quickly', 'happy', 'run', 'house'], correct: 0, marks: 1 },
            { id: 13, question: 'Choose the correct pronoun: "___ is going to the store"', options: ['He', 'Him', 'His', 'Himself'], correct: 0, marks: 1 },
            { id: 14, question: 'Choose the correct verb: "They ___ playing football"', options: ['are', 'is', 'am', 'be'], correct: 0, marks: 1 },
            { id: 15, question: 'What is the past tense of "eat"?', options: ['ate', 'eated', 'eat', 'eaten'], correct: 0, marks: 1 },
            { id: 16, question: 'What is the past tense of "go"?', options: ['went', 'goed', 'gone', 'go'], correct: 0, marks: 1 },
            { id: 17, question: 'What is the comparative form of "good"?', options: ['better', 'gooder', 'more good', 'best'], correct: 0, marks: 1 },
            { id: 18, question: 'What is the superlative form of "bad"?', options: ['worst', 'badder', 'more bad', 'baddest'], correct: 0, marks: 1 },
            { id: 19, question: 'Which sentence uses correct punctuation?', options: ['Hello, how are you?', 'Hello how are you', 'Hello how are you?', 'Hello, how are you'], correct: 0, marks: 1 },
            { id: 20, question: 'What is a synonym for "happy"?', options: ['joyful', 'sad', 'angry', 'tired'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
    { 
      id: 5, 
      name: 'Tourism', 
      code: 'TRM1501', 
      icon: '✈️',
      color: '#06b6d4',
      description: 'Travel, Tourism Geography, Customer Service',
      totalQuizzes: 5,
      quizzes: [
        { 
          id: 501, 
          title: 'Tourism Geography', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Medium',
          attempts: 156,
          success: 74,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'The Big Five refers to:', options: ['Lion, Leopard, Elephant, Rhino, Buffalo', 'Lion, Tiger, Elephant, Giraffe, Zebra', 'Cheetah, Leopard, Hyena, Wild Dog, Jackal', 'Elephant, Rhino, Hippo, Giraffe, Zebra'], correct: 0, marks: 1 },
            { id: 2, question: 'Table Mountain is located in:', options: ['Cape Town', 'Durban', 'Johannesburg', 'Pretoria'], correct: 0, marks: 1 },
            { id: 3, question: 'Kruger National Park is in which province?', options: ['Mpumalanga/Limpopo', 'Gauteng', 'KZN', 'Eastern Cape'], correct: 0, marks: 1 },
            { id: 4, question: 'Robben Island is famous for:', options: ['Nelson Mandela\'s imprisonment', 'Whale watching', 'Gold mining', 'Bird sanctuary'], correct: 0, marks: 1 },
            { id: 5, question: 'The Drakensberg mountains are also known as:', options: ['uKhahlamba', 'Magaliesberg', 'Waterberg', 'Soutpansberg'], correct: 0, marks: 1 },
            { id: 6, question: 'Sun City is a resort in:', options: ['North West', 'Gauteng', 'Limpopo', 'Mpumalanga'], correct: 0, marks: 1 },
            { id: 7, question: 'The Garden Route runs along which coast?', options: ['Southern Cape coast', 'East coast', 'West coast', 'North coast'], correct: 0, marks: 1 },
            { id: 8, question: 'Victoria Falls is on the border of:', options: ['Zambia & Zimbabwe', 'South Africa & Botswana', 'Mozambique & Tanzania', 'Namibia & Angola'], correct: 0, marks: 1 },
            { id: 9, question: 'What is the capital city of South Africa?', options: ['Pretoria', 'Cape Town', 'Bloemfontein', 'Johannesburg'], correct: 0, marks: 1 },
            { id: 10, question: 'Which airport is the main international airport in Johannesburg?', options: ['OR Tambo', 'Cape Town International', 'King Shaka', 'Port Elizabeth'], correct: 0, marks: 1 },
            { id: 11, question: 'What is the currency of South Africa?', options: ['Rand', 'Dollar', 'Euro', 'Pound'], correct: 0, marks: 1 },
            { id: 12, question: 'Which ocean is on the west coast of South Africa?', options: ['Atlantic', 'Indian', 'Pacific', 'Southern'], correct: 0, marks: 1 },
            { id: 13, question: 'Which ocean is on the east coast of South Africa?', options: ['Indian', 'Atlantic', 'Pacific', 'Southern'], correct: 0, marks: 1 },
            { id: 14, question: 'What is the famous mountain in Cape Town?', options: ['Table Mountain', 'Lion\'s Head', 'Devil\'s Peak', 'All of the above'], correct: 3, marks: 1 },
            { id: 15, question: 'Which city is known as the "Mother City"?', options: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'], correct: 0, marks: 1 },
            { id: 16, question: 'Which city is known as the "City of Gold"?', options: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'], correct: 0, marks: 1 },
            { id: 17, question: 'Which city is known for its Golden Mile beachfront?', options: ['Durban', 'Cape Town', 'Port Elizabeth', 'East London'], correct: 0, marks: 1 },
            { id: 18, question: 'What is the name of the cable car that goes up Table Mountain?', options: ['Table Mountain Aerial Cableway', 'Cape Town Cable Car', 'Mountain Lift', 'Sky Ride'], correct: 0, marks: 1 },
            { id: 19, question: 'Which national park is famous for the Big Five?', options: ['Kruger', 'Addo', 'Pilanesberg', 'Hluhluwe-Imfolozi'], correct: 0, marks: 1 },
            { id: 20, question: 'What is the name of the V&A development in Cape Town?', options: ['V&A Waterfront', 'V&A Mall', 'V&A Marina', 'V&A Harbour'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
    { 
      id: 6, 
      name: 'Life Sciences', 
      code: 'LIF1501', 
      icon: '🧬',
      color: '#8b5cf6',
      description: 'Biology, Human Anatomy',
      totalQuizzes: 4,
      quizzes: [
        { 
          id: 601, 
          title: 'Cell Biology', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Medium',
          attempts: 87,
          success: 69,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'What is the powerhouse of the cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'], correct: 0, marks: 1 },
            { id: 2, question: 'DNA is located in the:', options: ['Nucleus', 'Cytoplasm', 'Mitochondria', 'Cell membrane'], correct: 0, marks: 1 },
            { id: 3, question: 'Process of cell division is called:', options: ['Mitosis', 'Photosynthesis', 'Respiration', 'Digestion'], correct: 0, marks: 1 },
            { id: 4, question: 'Which organelle produces proteins?', options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Lysosome'], correct: 0, marks: 1 },
            { id: 5, question: 'Cell membrane is made of:', options: ['Lipid bilayer', 'Protein layer', 'Carbohydrate layer', 'Cellulose'], correct: 0, marks: 1 },
            { id: 6, question: 'Function of red blood cells is to:', options: ['Carry oxygen', 'Fight infection', 'Clot blood', 'Produce antibodies'], correct: 0, marks: 1 },
            { id: 7, question: 'What is the function of the nucleus?', options: ['Control center of the cell', 'Energy production', 'Protein synthesis', 'Waste removal'], correct: 0, marks: 1 },
            { id: 8, question: 'What organelle is responsible for photosynthesis?', options: ['Chloroplast', 'Mitochondria', 'Nucleus', 'Ribosome'], correct: 0, marks: 1 },
            { id: 9, question: 'What is the main function of the cell membrane?', options: ['Regulate what enters/exits', 'Energy production', 'Protein synthesis', 'Store DNA'], correct: 0, marks: 1 },
            { id: 10, question: 'Where are ribosomes located?', options: ['Cytoplasm and ER', 'Nucleus only', 'Mitochondria only', 'Cell membrane'], correct: 0, marks: 1 },
            { id: 11, question: 'What is the function of the Golgi apparatus?', options: ['Modify and package proteins', 'Energy production', 'Protein synthesis', 'Waste breakdown'], correct: 0, marks: 1 },
            { id: 12, question: 'What organelle contains digestive enzymes?', options: ['Lysosome', 'Mitochondria', 'Nucleus', 'Ribosome'], correct: 0, marks: 1 },
            { id: 13, question: 'What is the function of the endoplasmic reticulum?', options: ['Protein and lipid synthesis', 'Energy production', 'DNA storage', 'Waste removal'], correct: 0, marks: 1 },
            { id: 14, question: 'What is the difference between rough and smooth ER?', options: ['Rough has ribosomes', 'Smooth has ribosomes', 'Rough makes lipids', 'No difference'], correct: 0, marks: 1 },
            { id: 15, question: 'What is the function of the vacuole?', options: ['Storage and waste management', 'Energy production', 'Protein synthesis', 'Cell division'], correct: 0, marks: 1 },
            { id: 16, question: 'What is the cell wall made of in plants?', options: ['Cellulose', 'Chitin', 'Protein', 'Lipids'], correct: 0, marks: 1 },
            { id: 17, question: 'What is the function of chloroplasts?', options: ['Photosynthesis', 'Respiration', 'Protein synthesis', 'Cell division'], correct: 0, marks: 1 },
            { id: 18, question: 'What is the function of mitochondria?', options: ['Energy production', 'Photosynthesis', 'Protein synthesis', 'Waste removal'], correct: 0, marks: 1 },
            { id: 19, question: 'What is the function of the nucleolus?', options: ['Produces ribosomes', 'Stores DNA', 'Energy production', 'Protein synthesis'], correct: 0, marks: 1 },
            { id: 20, question: 'What is the function of the cytoskeleton?', options: ['Cell shape and support', 'Energy production', 'Protein synthesis', 'Waste removal'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
    { 
      id: 7, 
      name: 'Geography', 
      code: 'GEO1501', 
      icon: '🌍',
      color: '#ec4899',
      description: 'Physical & Human Geography',
      totalQuizzes: 3,
      quizzes: [
        { 
          id: 701, 
          title: 'Map Work', 
          questions: 20, 
          totalMarks: 20,
          time: '20 min', 
          difficulty: 'Easy',
          attempts: 56,
          success: 71,
          completed: false,
          score: null,
          marksObtained: null,
          questionsList: [
            { id: 1, question: 'Latitude lines run:', options: ['East-West', 'North-South', 'Diagonal', 'Circular'], correct: 0, marks: 1 },
            { id: 2, question: 'The Prime Meridian passes through:', options: ['Greenwich', 'Paris', 'New York', 'Cairo'], correct: 0, marks: 1 },
            { id: 3, question: 'Scale 1:50,000 means:', options: ['1cm = 0.5km', '1cm = 5km', '1cm = 50km', '1cm = 500m'], correct: 0, marks: 1 },
            { id: 4, question: 'Contour lines close together indicate:', options: ['Steep slope', 'Gentle slope', 'Plateau', 'Valley'], correct: 0, marks: 1 },
            { id: 5, question: 'The equator is at:', options: ['0°', '90°', '180°', '23.5°'], correct: 0, marks: 1 },
            { id: 6, question: 'What is a topographic map?', options: ['Shows elevation', 'Shows population', 'Shows climate', 'Shows vegetation'], correct: 0, marks: 1 },
            { id: 7, question: 'What is a thematic map?', options: ['Shows specific data', 'Shows elevation', 'Shows boundaries', 'Shows roads'], correct: 0, marks: 1 },
            { id: 8, question: 'What is GIS?', options: ['Geographic Information System', 'Global Information System', 'Geographic Integration System', 'Global Integration System'], correct: 0, marks: 1 },
            { id: 9, question: 'What is remote sensing?', options: ['Data collection from distance', 'Ground surveying', 'Map reading', 'GPS tracking'], correct: 0, marks: 1 },
            { id: 10, question: 'What is GPS?', options: ['Global Positioning System', 'Geographic Positioning System', 'Global Planning System', 'Geographic Planning System'], correct: 0, marks: 1 },
            { id: 11, question: 'What is a choropleth map?', options: ['Shows data by shading', 'Shows elevation', 'Shows roads', 'Shows boundaries'], correct: 0, marks: 1 },
            { id: 12, question: 'What is a dot distribution map?', options: ['Uses dots to show quantity', 'Shows elevation', 'Shows boundaries', 'Shows roads'], correct: 0, marks: 1 },
            { id: 13, question: 'What is a flow line map?', options: ['Shows movement', 'Shows elevation', 'Shows boundaries', 'Shows population'], correct: 0, marks: 1 },
            { id: 14, question: 'What is a cartogram?', options: ['Map distorted by data', 'Standard map', 'Elevation map', 'Road map'], correct: 0, marks: 1 },
            { id: 15, question: 'What is map scale?', options: ['Ratio of map to real world', 'Map size', 'Map legend', 'Map title'], correct: 0, marks: 1 },
            { id: 16, question: 'What is a large scale map?', options: ['Shows small area in detail', 'Shows large area', 'Shows world', 'Shows continents'], correct: 0, marks: 1 },
            { id: 17, question: 'What is a small scale map?', options: ['Shows large area', 'Shows small area', 'Shows details', 'Shows streets'], correct: 0, marks: 1 },
            { id: 18, question: 'What is a legend on a map?', options: ['Explains symbols', 'Map title', 'Map scale', 'Map orientation'], correct: 0, marks: 1 },
            { id: 19, question: 'What is map orientation?', options: ['Direction (north arrow)', 'Map size', 'Map scale', 'Map legend'], correct: 0, marks: 1 },
            { id: 20, question: 'What are coordinates?', options: ['Latitude and longitude', 'Map symbols', 'Map colors', 'Map lines'], correct: 0, marks: 1 },
          ]
        },
      ]
    },
  ];

  useEffect(() => {
    // Get user data and their selected subjects
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.category !== 'student') {
      navigate('/login');
      return;
    }
    
    // Load student's selected subjects from localStorage
    const savedSubjects = localStorage.getItem(`student_subjects_${parsedUser.id}`);
    
    // FOR TESTING: If no subjects saved, create default subjects
    if (!savedSubjects) {
      console.log('No subjects found. Creating default subjects for testing...');
      
      // Create default subjects (all subjects for testing)
      const defaultSubjects = [
        { id: 1, name: 'Mathematics', icon: '📐', color: '#3b82f6', bgColor: '#eff6ff' },
        { id: 2, name: 'Mathematical Literacy', icon: '🧮', color: '#f97316', bgColor: '#fff7ed' },
        { id: 3, name: 'Physical Science', icon: '⚛️', color: '#10b981', bgColor: '#f0fdf4' },
        { id: 4, name: 'English', icon: '📝', color: '#f59e0b', bgColor: '#fef3c7' },
        { id: 5, name: 'Tourism', icon: '✈️', color: '#06b6d4', bgColor: '#e0f2fe' },
        { id: 6, name: 'Life Sciences', icon: '🧬', color: '#8b5cf6', bgColor: '#f5f3ff' },
        { id: 7, name: 'Geography', icon: '🌍', color: '#ec4899', bgColor: '#fdf2f8' },
      ];
      
      // Save to localStorage
      localStorage.setItem(`student_subjects_${parsedUser.id}`, JSON.stringify(defaultSubjects));
      
      // Filter subjects
      const selectedSubjectIds = [1, 2, 3, 4, 5, 6, 7];
      const filteredSubjects = allSubjects.filter(subject => 
        selectedSubjectIds.includes(subject.id)
      );
      
      setUserSubjects(filteredSubjects);
      console.log('Default subjects loaded:', filteredSubjects.map(s => s.name));
    } else {
      const selectedSubjects = JSON.parse(savedSubjects);
      console.log('Saved subjects from localStorage:', selectedSubjects);
      
      // Get just the IDs from the saved subjects
      const selectedSubjectIds = selectedSubjects.map(s => s.id);
      console.log('Selected subject IDs:', selectedSubjectIds);
      
      // Filter allSubjects to only include the subjects the student selected
      const filteredSubjects = allSubjects.filter(subject => 
        selectedSubjectIds.includes(subject.id)
      );
      
      console.log('Filtered subjects found:', filteredSubjects.map(s => s.name));
      setUserSubjects(filteredSubjects);
    }
    
    setLoading(false);
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            // Time's up - auto submit
            clearInterval(interval);
            setTimerActive(false);
            if (quizStarted && !showResults) {
              handleSubmitQuiz();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, quizStarted, showResults]);

  const handleStartQuiz = (subjectId, quiz) => {
    setSelectedQuiz({ subjectId, ...quiz });
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
    setTimeRemaining(1200); // 20 minutes in seconds
    setTimerActive(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    console.log('Answer selected:', { questionId, optionIndex });
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questionsList.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setTimerActive(false);
    
    let totalMarks = 0;
    let obtainedMarks = 0;
    
    console.log('Submitting quiz. Selected answers:', selectedAnswers);
    console.log('Questions list:', selectedQuiz.questionsList);
    
    selectedQuiz.questionsList.forEach((q) => {
      totalMarks += q.marks || 1;
      const userAnswer = selectedAnswers[q.id];
      const isCorrect = userAnswer === q.correct;
      
      console.log(`Question ${q.id}: User answer = ${userAnswer}, Correct answer = ${q.correct}, Is correct = ${isCorrect}`);
      
      if (isCorrect) {
        obtainedMarks += q.marks || 1;
      }
    });
    
    const percentage = Math.round((obtainedMarks / totalMarks) * 100);
    console.log(`Total marks: ${totalMarks}, Obtained: ${obtainedMarks}, Percentage: ${percentage}%`);
    
    setQuizResults({
      obtainedMarks,
      totalMarks,
      percentage,
      correct: obtainedMarks,
      total: totalMarks,
      score: percentage,
      answers: selectedAnswers
    });
    
    setShowResults(true);
  };

  const handleBackToQuizzes = () => {
    setQuizStarted(false);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
    setTimerActive(false);
  };

  const handleRetryQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
    setTimeRemaining(1200);
    setTimerActive(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getFilteredQuizzes = () => {
    if (selectedSubject === 'all') {
      return userSubjects.flatMap(subject => 
        subject.quizzes.map(quiz => ({ 
          ...quiz, 
          subjectName: subject.name, 
          subjectId: subject.id, 
          subjectIcon: subject.icon, 
          subjectColor: subject.color 
        }))
      );
    } else {
      const subject = userSubjects.find(s => s.id === parseInt(selectedSubject));
      return subject ? subject.quizzes.map(quiz => ({ 
        ...quiz, 
        subjectName: subject.name, 
        subjectId: subject.id, 
        subjectIcon: subject.icon, 
        subjectColor: subject.color 
      })) : [];
    }
  };

  const getSubjectById = (id) => {
    return userSubjects.find(s => s.id === parseInt(id));
  };

  const isCurrentQuestionAnswered = () => {
    if (!selectedQuiz) return false;
    const currentQ = selectedQuiz.questionsList[currentQuestion];
    return selectedAnswers[currentQ.id] !== undefined;
  };

  if (loading) {
    return <div className="loading">Loading your quizzes...</div>;
  }

  // If no subjects, show message
  if (userSubjects.length === 0) {
    return (
      <div className="quizzes-container">
        <div className="no-quizzes" style={{ marginTop: '50px' }}>
          <div className="no-quizzes-icon">📚</div>
          <h3>No Subjects Selected</h3>
          <p>You haven't selected any subjects yet.</p>
          <button 
            className="back-button" 
            onClick={() => navigate('/student/subject-selection')}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}
          >
            Select Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-container">
      {!quizStarted ? (
        // Quiz Selection View
        <div className="quiz-selection-view">
          {/* Header */}
          <div className="quizzes-header">
            <button className="back-button" onClick={() => navigate('/student-dashboard')}>
              ← Back to Dashboard
            </button>
            <h1>Practice Quizzes</h1>
            <p>Select a subject and quiz to test your knowledge</p>
          </div>

          {/* Subject Filter - Only shows subjects the student selected */}
          <div className="subject-filters">
            <button 
              className={`filter-btn ${selectedSubject === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSubject('all')}
            >
              All Subjects
            </button>
            {userSubjects.map(subject => (
              <button
                key={subject.id}
                className={`filter-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject.id)}
                style={{ 
                  '--filter-color': subject.color,
                  color: selectedSubject === subject.id ? 'white' : subject.color,
                  background: selectedSubject === subject.id ? subject.color : 'transparent',
                  borderColor: subject.color
                }}
              >
                <span className="filter-icon">{subject.icon}</span>
                {subject.name}
              </button>
            ))}
          </div>

          {/* Quizzes Grid - Only shows quizzes for selected/all subjects */}
          <div className="quizzes-grid">
            {getFilteredQuizzes().map(quiz => (
              <div key={quiz.id} className="quiz-card" style={{ borderTopColor: quiz.subjectColor }}>
                <div className="quiz-card-header">
                  <div className="quiz-subject-info">
                    <span className="quiz-subject-icon" style={{ background: quiz.subjectColor + '20', color: quiz.subjectColor }}>
                      {quiz.subjectIcon}
                    </span>
                    <div>
                      <span className="quiz-subject-name">{quiz.subjectName}</span>
                      <h3>{quiz.title}</h3>
                    </div>
                  </div>
                  {quiz.completed && (
                    <div className="quiz-completed-badge" style={{ background: quiz.subjectColor }}>
                      Score: {quiz.score}%
                    </div>
                  )}
                </div>

                <div className="quiz-details">
                  <div className="quiz-meta">
                    <div className="meta-item">
                      <span className="meta-label">Questions</span>
                      <span className="meta-value">{quiz.questions}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Total Marks</span>
                      <span className="meta-value">{quiz.totalMarks || 20}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Time</span>
                      <span className="meta-value">{quiz.time}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Difficulty</span>
                      <span className={`difficulty-badge ${quiz.difficulty.toLowerCase()}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="quiz-stats">
                    <div className="stat-chip">
                      <span className="chip-icon">👥</span>
                      {quiz.attempts} attempts
                    </div>
                    <div className="stat-chip">
                      <span className="chip-icon">✅</span>
                      {quiz.success}% success
                    </div>
                  </div>

                  <button 
                    className="start-quiz-btn"
                    onClick={() => handleStartQuiz(quiz.subjectId, quiz)}
                    style={{ background: quiz.subjectColor }}
                  >
                    {quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                  </button>
                </div>
              </div>
            ))}

            {getFilteredQuizzes().length === 0 && (
              <div className="no-quizzes">
                <div className="no-quizzes-icon">📚</div>
                <h3>No Quizzes Available</h3>
                <p>Check back later for new quizzes in this subject</p>
              </div>
            )}
          </div>
        </div>
      ) : showResults ? (
        // Quiz Results View
        <div className="quiz-results-view">
          <button className="back-button" onClick={handleBackToQuizzes}>← Back to Quizzes</button>
          
          <div className="results-header">
            <div className="subject-badge" style={{ background: getSubjectById(selectedQuiz.subjectId)?.color + '20' }}>
              <span>{getSubjectById(selectedQuiz.subjectId)?.icon}</span>
              {getSubjectById(selectedQuiz.subjectId)?.name}
            </div>
            <h2>{selectedQuiz.title}</h2>
            <p className="results-subtitle">Quiz Complete!</p>
          </div>

          <div className="score-display">
            <div className="score-circle" style={{ borderColor: getSubjectById(selectedQuiz.subjectId)?.color }}>
              <span className="score-number">{quizResults.percentage}%</span>
            </div>
          </div>

          <div className="results-stats">
            <div className="result-stat correct">
              <span className="stat-icon">✓</span>
              <div>
                <span className="stat-label">Marks Obtained</span>
                <span className="stat-value">{quizResults.obtainedMarks}/{quizResults.totalMarks}</span>
              </div>
            </div>
            <div className="result-stat total">
              <span className="stat-icon">📝</span>
              <div>
                <span className="stat-label">Questions</span>
                <span className="stat-value">{quizResults.total}</span>
              </div>
            </div>
            <div className="result-stat incorrect">
              <span className="stat-icon">✗</span>
              <div>
                <span className="stat-label">Incorrect</span>
                <span className="stat-value">{quizResults.total - quizResults.obtainedMarks}</span>
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button className="action-btn primary" onClick={handleRetryQuiz}>
              Try Again
            </button>
            <button className="action-btn secondary" onClick={handleBackToQuizzes}>
              Choose Another Quiz
            </button>
          </div>
        </div>
      ) : (
        // Quiz Taking View
        <div className="quiz-taking-view">
          <div className="quiz-header">
            <button className="back-button" onClick={handleBackToQuizzes}>←</button>
            <div>
              <span className="quiz-subject" style={{ color: getSubjectById(selectedQuiz.subjectId)?.color }}>
                {getSubjectById(selectedQuiz.subjectId)?.icon} {getSubjectById(selectedQuiz.subjectId)?.name}
              </span>
              <h2>{selectedQuiz.title}</h2>
            </div>
            <div className="quiz-progress">
              <span className="question-counter">{currentQuestion + 1}/{selectedQuiz.questionsList.length}</span>
              <div className="timer-display" style={{ 
                marginTop: '5px', 
                color: timeRemaining < 300 ? '#ef4444' : '#64748b',
                fontWeight: timeRemaining < 300 ? 'bold' : 'normal'
              }}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${((currentQuestion + 1) / selectedQuiz.questionsList.length) * 100}%`,
                background: getSubjectById(selectedQuiz.subjectId)?.color
              }}
            ></div>
          </div>

          <div className="question-section">
            <div className="question-number">
              Question {currentQuestion + 1} of {selectedQuiz.questionsList.length}
              <span style={{ marginLeft: '10px', color: '#64748b', fontSize: '14px' }}>
                (Marks: {selectedQuiz.questionsList[currentQuestion].marks || 1})
              </span>
            </div>
            <h3 className="question-text">{selectedQuiz.questionsList[currentQuestion].question}</h3>
            
            <div className="options-list">
              {selectedQuiz.questionsList[currentQuestion].options.map((option, index) => {
                const questionId = selectedQuiz.questionsList[currentQuestion].id;
                const isSelected = selectedAnswers[questionId] === index;
                
                return (
                  <button
                    key={index}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(questionId, index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quiz-navigation">
            <button 
              className="nav-btn prev"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            {currentQuestion === selectedQuiz.questionsList.length - 1 ? (
              <button 
                className="nav-btn submit"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length !== selectedQuiz.questionsList.length}
                style={{
                  background: Object.keys(selectedAnswers).length === selectedQuiz.questionsList.length 
                    ? getSubjectById(selectedQuiz.subjectId)?.color 
                    : '#cbd5e1',
                  cursor: Object.keys(selectedAnswers).length === selectedQuiz.questionsList.length 
                    ? 'pointer' 
                    : 'not-allowed',
                  opacity: Object.keys(selectedAnswers).length === selectedQuiz.questionsList.length ? 1 : 0.6
                }}
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                className="nav-btn next"
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionAnswered()}
                style={{
                  background: isCurrentQuestionAnswered() 
                    ? getSubjectById(selectedQuiz.subjectId)?.color 
                    : '#cbd5e1',
                  cursor: isCurrentQuestionAnswered() ? 'pointer' : 'not-allowed',
                  opacity: isCurrentQuestionAnswered() ? 1 : 0.6
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;