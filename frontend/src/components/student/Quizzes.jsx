import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quizzes.css';

const Quizzes = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Subjects with their quizzes
  const [subjects] = useState([
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
          questions: 10, 
          time: '15 min', 
          difficulty: 'Medium',
          attempts: 234,
          success: 78,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Solve for x: 2x + 5 = 15', options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 5.5'], correct: 0 },
            { id: 2, question: 'What is the value of y when x = 3 in the equation y = 2x² + 3x - 4?', options: ['23', '20', '17', '14'], correct: 0 },
            { id: 3, question: 'Simplify: (3x²y³)²', options: ['9x⁴y⁶', '6x⁴y⁶', '9x²y⁶', '3x⁴y⁶'], correct: 0 },
            { id: 4, question: 'Factor completely: x² - 9', options: ['(x-3)(x+3)', '(x-3)²', '(x+3)²', '(x-9)(x+1)'], correct: 0 },
            { id: 5, question: 'What is the slope of the line through (2,3) and (4,7)?', options: ['2', '1', '3', '4'], correct: 0 },
            { id: 6, question: 'Solve for x: x² - 5x + 6 = 0', options: ['x = 2,3', 'x = -2,-3', 'x = 1,6', 'x = -1,-6'], correct: 0 },
            { id: 7, question: 'What is the derivative of 3x²?', options: ['6x', '3x', '6', '3x²'], correct: 0 },
            { id: 8, question: 'If f(x) = 2x + 1, find f(3)', options: ['7', '6', '8', '5'], correct: 0 },
            { id: 9, question: 'What is the area of a circle with radius 5?', options: ['25π', '10π', '5π', '20π'], correct: 0 },
            { id: 10, question: 'Solve: 3(2x - 4) = 18', options: ['x = 5', 'x = 6', 'x = 4', 'x = 7'], correct: 0 },
          ]
        },
        { 
          id: 102, 
          title: 'Trigonometry Basics', 
          questions: 8, 
          time: '12 min', 
          difficulty: 'Hard',
          attempts: 156,
          success: 62,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'sin(30°) = ?', options: ['1/2', '√3/2', '1/√2', '1'], correct: 0 },
            { id: 2, question: 'cos(60°) = ?', options: ['1/2', '√3/2', '1/√2', '0'], correct: 0 },
            { id: 3, question: 'tan(45°) = ?', options: ['1', '0', '∞', '√3'], correct: 0 },
            { id: 4, question: 'sin(90°) = ?', options: ['1', '0', '1/2', '√2/2'], correct: 0 },
            { id: 5, question: 'cos(0°) = ?', options: ['1', '0', '1/2', '√2/2'], correct: 0 },
            { id: 6, question: 'In a right triangle, sin θ = opposite/?', options: ['hypotenuse', 'adjacent', 'opposite', 'base'], correct: 0 },
            { id: 7, question: 'What is the value of sin²θ + cos²θ?', options: ['1', '0', '2', 'sin θ cos θ'], correct: 0 },
            { id: 8, question: 'If sin θ = 3/5, what is cos θ?', options: ['4/5', '5/4', '3/4', '4/3'], correct: 0 },
          ]
        },
        { 
          id: 103, 
          title: 'Calculus: Derivatives', 
          questions: 6, 
          time: '20 min', 
          difficulty: 'Hard',
          attempts: 89,
          success: 45,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Derivative of x² is:', options: ['2x', 'x', '2', 'x²'], correct: 0 },
            { id: 2, question: 'Derivative of sin(x) is:', options: ['cos(x)', '-cos(x)', 'sec²(x)', '-sin(x)'], correct: 0 },
            { id: 3, question: 'Derivative of ln(x) is:', options: ['1/x', 'x', 'e^x', '1'], correct: 0 },
            { id: 4, question: 'Derivative of e^x is:', options: ['e^x', 'x·e^x', 'e^(x-1)', 'ln(x)'], correct: 0 },
            { id: 5, question: 'Derivative of 5x³ is:', options: ['15x²', '5x²', '15x', '5x³'], correct: 0 },
            { id: 6, question: 'Derivative of cos(x) is:', options: ['-sin(x)', 'sin(x)', '-cos(x)', 'sec(x)'], correct: 0 },
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
          questions: 8, 
          time: '15 min', 
          difficulty: 'Medium',
          attempts: 189,
          success: 72,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Simple interest formula is:', options: ['I = P × r × t', 'I = P(1 + r)^t', 'I = P + rt', 'I = P/r × t'], correct: 0 },
            { id: 2, question: 'If you invest R1000 at 5% simple interest for 2 years, the interest is:', options: ['R100', 'R50', 'R200', 'R150'], correct: 0 },
            { id: 3, question: 'Compound interest formula is:', options: ['A = P(1 + r)^t', 'A = P × r × t', 'A = P + rt', 'A = P(1 + rt)'], correct: 0 },
            { id: 4, question: 'VAT in South Africa is currently:', options: ['15%', '14%', '16%', '13%'], correct: 0 },
            { id: 5, question: 'If a shirt costs R200 excluding VAT, the total price including VAT is:', options: ['R230', 'R220', 'R240', 'R210'], correct: 0 },
            { id: 6, question: 'Profit is calculated as:', options: ['Selling Price - Cost Price', 'Cost Price - Selling Price', 'Selling Price + Cost Price', 'Selling Price × Cost Price'], correct: 0 },
            { id: 7, question: 'A discount of 20% on a R500 item saves you:', options: ['R100', 'R50', 'R150', 'R200'], correct: 0 },
            { id: 8, question: 'Exchange rate: If $1 = R15, how many rands for $50?', options: ['R750', 'R500', 'R650', 'R800'], correct: 0 },
          ]
        },
        { 
          id: 202, 
          title: 'Data Handling', 
          questions: 7, 
          time: '12 min', 
          difficulty: 'Easy',
          attempts: 145,
          success: 80,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'The mean is also known as the:', options: ['Average', 'Middle value', 'Most common value', 'Range'], correct: 0 },
            { id: 2, question: 'The median is the:', options: ['Middle value', 'Average', 'Most common value', 'Difference'], correct: 0 },
            { id: 3, question: 'The mode is the:', options: ['Most frequent value', 'Middle value', 'Average', 'Largest value'], correct: 0 },
            { id: 4, question: 'Range is calculated as:', options: ['Largest - Smallest', 'Largest + Smallest', 'Average × 2', 'Sum ÷ Count'], correct: 0 },
            { id: 5, question: 'A bar graph is used to show:', options: ['Comparisons', 'Trends over time', 'Parts of a whole', 'Distribution'], correct: 0 },
            { id: 6, question: 'A pie chart shows:', options: ['Parts of a whole', 'Changes over time', 'Comparisons', 'Correlation'], correct: 0 },
            { id: 7, question: 'Probability is expressed as a number between:', options: ['0 and 1', '1 and 10', '0 and 100', '-1 and 1'], correct: 0 },
          ]
        },
        { 
          id: 203, 
          title: 'Maps and Scales', 
          questions: 6, 
          time: '10 min', 
          difficulty: 'Medium',
          attempts: 112,
          success: 68,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Scale 1:100 means:', options: ['1cm = 100cm', '1cm = 1m', '1cm = 10cm', '1cm = 100m'], correct: 0 },
            { id: 2, question: 'On a map with scale 1:50,000, 5cm represents:', options: ['2.5km', '1km', '5km', '10km'], correct: 0 },
            { id: 3, question: 'A floor plan uses which type of scale?', options: ['Bar scale', 'Line scale', 'Ratio scale', 'Word scale'], correct: 2 },
            { id: 4, question: 'If actual length is 10m and scale is 1:100, drawing length is:', options: ['10cm', '1cm', '100cm', '5cm'], correct: 0 },
            { id: 5, question: 'North is usually at the _____ of a map:', options: ['Top', 'Bottom', 'Left', 'Right'], correct: 0 },
            { id: 6, question: 'Contour lines on a map show:', options: ['Height above sea level', 'Distance', 'Population', 'Temperature'], correct: 0 },
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
          questions: 8, 
          time: '12 min', 
          difficulty: 'Medium',
          attempts: 178,
          success: 71,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Newton\'s First Law is also known as:', options: ['Law of Inertia', 'Law of Acceleration', 'Action-Reaction', 'Law of Gravity'], correct: 0 },
            { id: 2, question: 'Force = mass × ?', options: ['acceleration', 'velocity', 'distance', 'time'], correct: 0 },
            { id: 3, question: 'Unit of force is:', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correct: 0 },
            { id: 4, question: 'For every action, there is an equal and opposite reaction. This is:', options: ['Newton\'s Third Law', 'Newton\'s First Law', 'Newton\'s Second Law', 'Law of Gravitation'], correct: 0 },
            { id: 5, question: 'What is acceleration due to gravity on Earth?', options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '9.8 km/s²'], correct: 0 },
            { id: 6, question: 'Mass is measured in:', options: ['kg', 'N', 'm/s²', 'J'], correct: 0 },
            { id: 7, question: 'Weight is:', options: ['mass × gravity', 'mass/gravity', 'gravity/mass', 'mass + gravity'], correct: 0 },
            { id: 8, question: 'If mass = 10kg and acceleration = 2m/s², force = ?', options: ['20N', '5N', '12N', '8N'], correct: 0 },
          ]
        },
        { 
          id: 302, 
          title: 'Thermodynamics', 
          questions: 6, 
          time: '10 min', 
          difficulty: 'Hard',
          attempts: 92,
          success: 48,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'First Law of Thermodynamics deals with:', options: ['Energy Conservation', 'Entropy', 'Heat Transfer', 'Pressure'], correct: 0 },
            { id: 2, question: 'Second Law of Thermodynamics deals with:', options: ['Entropy', 'Energy', 'Temperature', 'Pressure'], correct: 0 },
            { id: 3, question: 'Temperature is measured in:', options: ['Kelvin', 'Joule', 'Watt', 'Pascal'], correct: 0 },
            { id: 4, question: 'Heat transfer through direct contact is:', options: ['Conduction', 'Convection', 'Radiation', 'Induction'], correct: 0 },
            { id: 5, question: 'Specific heat capacity unit is:', options: ['J/kg·K', 'J/kg', 'J/K', 'J·kg/K'], correct: 0 },
            { id: 6, question: 'Absolute zero is:', options: ['0K', '0°C', '-273K', '100K'], correct: 0 },
          ]
        },
        { 
          id: 303, 
          title: 'Electricity & Magnetism', 
          questions: 7, 
          time: '15 min', 
          difficulty: 'Medium',
          attempts: 112,
          success: 65,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Ohm\'s Law states:', options: ['V = IR', 'I = VR', 'R = VI', 'V = I/R'], correct: 0 },
            { id: 2, question: 'Unit of resistance is:', options: ['Ohm', 'Volt', 'Ampere', 'Watt'], correct: 0 },
            { id: 3, question: 'Current is measured in:', options: ['Amperes', 'Volts', 'Ohms', 'Watts'], correct: 0 },
            { id: 4, question: 'Magnetic field lines:', options: ['Form closed loops', 'Start at north pole', 'End at south pole', 'Are straight'], correct: 0 },
            { id: 5, question: 'A device that converts electrical energy to mechanical energy is:', options: ['Motor', 'Generator', 'Transformer', 'Battery'], correct: 0 },
            { id: 6, question: 'In a series circuit, current is:', options: ['Same everywhere', 'Different everywhere', 'Zero', 'Maximum at source'], correct: 0 },
            { id: 7, question: 'Power is measured in:', options: ['Watts', 'Joules', 'Volts', 'Amperes'], correct: 0 },
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
          questions: 5, 
          time: '20 min', 
          difficulty: 'Easy',
          attempts: 201,
          success: 82,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Which sentence is grammatically correct?', options: [
              'She go to school', 
              'She goes to school', 
              'She going to school', 
              'She is go to school'
            ], correct: 1 },
            { id: 2, question: 'Choose the correct past tense of "run":', options: ['ran', 'runned', 'run', 'running'], correct: 0 },
            { id: 3, question: 'Identify the noun in: "The beautiful girl sings well"', options: ['girl', 'beautiful', 'sings', 'well'], correct: 0 },
            { id: 4, question: 'Which is a preposition?', options: ['under', 'quickly', 'run', 'blue'], correct: 0 },
            { id: 5, question: 'Choose the correct article: "___ university"', options: ['a', 'an', 'the', 'none'], correct: 0 },
          ]
        },
        { 
          id: 402, 
          title: 'Literature Analysis', 
          questions: 4, 
          time: '15 min', 
          difficulty: 'Medium',
          attempts: 134,
          success: 73,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'What is a metaphor?', options: [
              'Comparison without using like/as', 
              'Comparison using like/as', 
              'Giving human qualities to objects', 
              'Exaggeration'
            ], correct: 0 },
            { id: 2, question: 'Which is an example of personification?', options: [
              'The wind whispered', 
              'He runs like the wind', 
              'Strong as an ox', 
              'I\'ve told you a million times'
            ], correct: 0 },
            { id: 3, question: 'What is the main character called?', options: ['Protagonist', 'Antagonist', 'Narrator', 'Author'], correct: 0 },
            { id: 4, question: 'The sequence of events in a story is the:', options: ['Plot', 'Theme', 'Setting', 'Character'], correct: 0 },
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
          questions: 8, 
          time: '15 min', 
          difficulty: 'Medium',
          attempts: 156,
          success: 74,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'The Big Five refers to:', options: ['Lion, Leopard, Elephant, Rhino, Buffalo', 'Lion, Tiger, Elephant, Giraffe, Zebra', 'Cheetah, Leopard, Hyena, Wild Dog, Jackal', 'Elephant, Rhino, Hippo, Giraffe, Zebra'], correct: 0 },
            { id: 2, question: 'Table Mountain is located in:', options: ['Cape Town', 'Durban', 'Johannesburg', 'Pretoria'], correct: 0 },
            { id: 3, question: 'Kruger National Park is in which province?', options: ['Mpumalanga/Limpopo', 'Gauteng', 'KZN', 'Eastern Cape'], correct: 0 },
            { id: 4, question: 'Robben Island is famous for:', options: ['Nelson Mandela\'s imprisonment', 'Whale watching', 'Gold mining', 'Bird sanctuary'], correct: 0 },
            { id: 5, question: 'The Drakensberg mountains are also known as:', options: ['uKhahlamba', 'Magaliesberg', 'Waterberg', 'Soutpansberg'], correct: 0 },
            { id: 6, question: 'Sun City is a resort in:', options: ['North West', 'Gauteng', 'Limpopo', 'Mpumalanga'], correct: 0 },
            { id: 7, question: 'The Garden Route runs along which coast?', options: ['Southern Cape coast', 'East coast', 'West coast', 'North coast'], correct: 0 },
            { id: 8, question: 'Victoria Falls is on the border of:', options: ['Zambia & Zimbabwe', 'South Africa & Botswana', 'Mozambique & Tanzania', 'Namibia & Angola'], correct: 0 },
          ]
        },
        { 
          id: 502, 
          title: 'Customer Service in Tourism', 
          questions: 6, 
          time: '12 min', 
          difficulty: 'Easy',
          attempts: 98,
          success: 85,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'The first step in handling a complaint is:', options: ['Listen actively', 'Apologize', 'Offer a solution', 'Explain policy'], correct: 0 },
            { id: 2, question: 'Good customer service includes:', options: ['All of these', 'Being polite', 'Being helpful', 'Being knowledgeable'], correct: 0 },
            { id: 3, question: 'When a guest is angry, you should:', options: ['Stay calm and listen', 'Get defensive', 'Ignore them', 'Call security'], correct: 0 },
            { id: 4, question: 'Verbal communication includes:', options: ['Tone of voice', 'Body language', 'Facial expressions', 'All of these'], correct: 3 },
            { id: 5, question: 'Non-verbal communication is:', options: ['Body language', 'Words used', 'Written messages', 'Phone calls'], correct: 0 },
            { id: 6, question: 'The phrase "The customer is always right" means:', options: ['Value customer feedback', 'Customers never make mistakes', 'Employees are wrong', 'Ignore policies'], correct: 0 },
          ]
        },
        { 
          id: 503, 
          title: 'Travel Documentation', 
          questions: 7, 
          time: '10 min', 
          difficulty: 'Medium',
          attempts: 87,
          success: 69,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'A passport is valid for how many years in South Africa?', options: ['10 years', '5 years', '15 years', '2 years'], correct: 0 },
            { id: 2, question: 'A visa allows you to:', options: ['Enter a foreign country', 'Drive a car', 'Work anywhere', 'Get discounts'], correct: 0 },
            { id: 3, question: 'Which document is needed for international travel?', options: ['Passport', 'ID book', 'Driver\'s license', 'Birth certificate'], correct: 0 },
            { id: 4, question: 'Travel insurance covers:', options: ['Medical emergencies', 'Flight tickets', 'Hotel bookings', 'All of these'], correct: 3 },
            { id: 5, question: 'A boarding pass gives you:', options: ['Permission to board the plane', 'Entry to the airport', 'Luggage allowance', 'Seat selection'], correct: 0 },
            { id: 6, question: 'Check-in time for international flights is usually:', options: ['2-3 hours before', '30 minutes before', '1 hour before', 'The day before'], correct: 0 },
            { id: 7, question: 'Excess baggage means:', options: ['Luggage over the weight limit', 'Extra bags', 'Lost luggage', 'Hand luggage'], correct: 0 },
          ]
        },
        { 
          id: 504, 
          title: 'South African Tourism', 
          questions: 6, 
          time: '10 min', 
          difficulty: 'Easy',
          attempts: 134,
          success: 78,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'SA Tourism\'s slogan is:', options: ['South Africa: Inspiring New Ways', 'Incredible South Africa', 'South Africa: A World in One Country', 'Discover South Africa'], correct: 0 },
            { id: 2, question: 'The Cape Winelands are famous for:', options: ['Wine production', 'Gold mining', 'Diamonds', 'Big Five'], correct: 0 },
            { id: 3, question: 'Durban is known for its:', options: ['Golden Mile beachfront', 'Table Mountain', 'Kruger Park', 'Cango Caves'], correct: 0 },
            { id: 4, question: 'The Cradle of Humankind is a:', options: ['World Heritage Site', 'National Park', 'Game Reserve', 'Mountain Range'], correct: 0 },
            { id: 5, question: 'iSimangaliso Wetland Park is in:', options: ['KwaZulu-Natal', 'Western Cape', 'Eastern Cape', 'Mpumalanga'], correct: 0 },
            { id: 6, question: 'Bloemfontein is the capital of:', options: ['Free State', 'Gauteng', 'Northern Cape', 'North West'], correct: 0 },
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
          questions: 6, 
          time: '10 min', 
          difficulty: 'Medium',
          attempts: 87,
          success: 69,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'What is the powerhouse of the cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'], correct: 0 },
            { id: 2, question: 'DNA is located in the:', options: ['Nucleus', 'Cytoplasm', 'Mitochondria', 'Cell membrane'], correct: 0 },
            { id: 3, question: 'Process of cell division is called:', options: ['Mitosis', 'Photosynthesis', 'Respiration', 'Digestion'], correct: 0 },
            { id: 4, question: 'Which organelle produces proteins?', options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Lysosome'], correct: 0 },
            { id: 5, question: 'Cell membrane is made of:', options: ['Lipid bilayer', 'Protein layer', 'Carbohydrate layer', 'Cellulose'], correct: 0 },
            { id: 6, question: 'Function of red blood cells is to:', options: ['Carry oxygen', 'Fight infection', 'Clot blood', 'Produce antibodies'], correct: 0 },
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
          questions: 5, 
          time: '10 min', 
          difficulty: 'Easy',
          attempts: 56,
          success: 71,
          completed: false,
          score: null,
          questionsList: [
            { id: 1, question: 'Latitude lines run:', options: ['East-West', 'North-South', 'Diagonal', 'Circular'], correct: 0 },
            { id: 2, question: 'The Prime Meridian passes through:', options: ['Greenwich', 'Paris', 'New York', 'Cairo'], correct: 0 },
            { id: 3, question: 'Scale 1:50,000 means:', options: ['1cm = 0.5km', '1cm = 5km', '1cm = 50km', '1cm = 500m'], correct: 0 },
            { id: 4, question: 'Contour lines close together indicate:', options: ['Steep slope', 'Gentle slope', 'Plateau', 'Valley'], correct: 0 },
            { id: 5, question: 'The equator is at:', options: ['0°', '90°', '180°', '23.5°'], correct: 0 },
          ]
        },
      ]
    },
  ]);

  const handleStartQuiz = (subjectId, quiz) => {
    setSelectedQuiz({ subjectId, ...quiz });
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
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
    let correct = 0;
    selectedQuiz.questionsList.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    
    const score = Math.round((correct / selectedQuiz.questionsList.length) * 100);
    
    setQuizResults({
      correct,
      total: selectedQuiz.questionsList.length,
      score,
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
  };

  const handleRetryQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResults(null);
    setShowResults(false);
  };

  const getFilteredQuizzes = () => {
    if (selectedSubject === 'all') {
      return subjects.flatMap(subject => 
        subject.quizzes.map(quiz => ({ 
          ...quiz, 
          subjectName: subject.name, 
          subjectId: subject.id, 
          subjectIcon: subject.icon, 
          subjectColor: subject.color 
        }))
      );
    } else {
      const subject = subjects.find(s => s.id === parseInt(selectedSubject));
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
    return subjects.find(s => s.id === parseInt(id));
  };

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

          {/* Subject Filter */}
          <div className="subject-filters">
            <button 
              className={`filter-btn ${selectedSubject === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSubject('all')}
            >
              All Subjects
            </button>
            {subjects.map(subject => (
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

          {/* Quizzes Grid */}
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
              <span className="score-number">{quizResults.score}%</span>
            </div>
          </div>

          <div className="results-stats">
            <div className="result-stat correct">
              <span className="stat-icon">✓</span>
              <div>
                <span className="stat-label">Correct</span>
                <span className="stat-value">{quizResults.correct}</span>
              </div>
            </div>
            <div className="result-stat total">
              <span className="stat-icon">📝</span>
              <div>
                <span className="stat-label">Total</span>
                <span className="stat-value">{quizResults.total}</span>
              </div>
            </div>
            <div className="result-stat incorrect">
              <span className="stat-icon">✗</span>
              <div>
                <span className="stat-label">Incorrect</span>
                <span className="stat-value">{quizResults.total - quizResults.correct}</span>
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
            <div className="question-number">Question {currentQuestion + 1}</div>
            <h3 className="question-text">{selectedQuiz.questionsList[currentQuestion].question}</h3>
            
            <div className="options-list">
              {selectedQuiz.questionsList[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswers[selectedQuiz.questionsList[currentQuestion].id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(selectedQuiz.questionsList[currentQuestion].id, index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
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
                    : '#cbd5e1'
                }}
              >
                Submit Quiz
              </button>
            ) : (
              <button 
                className="nav-btn next"
                onClick={handleNextQuestion}
                disabled={!selectedAnswers[selectedQuiz.questionsList[currentQuestion].id]}
                style={{
                  background: selectedAnswers[selectedQuiz.questionsList[currentQuestion].id] 
                    ? getSubjectById(selectedQuiz.subjectId)?.color 
                    : '#cbd5e1'
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