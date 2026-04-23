-- ============================================================
--  CogniChain — Categories & Problems Seed
--  Run in Supabase SQL Editor
-- ============================================================

-- Update existing categories with colors, add new ones
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;

-- Upsert categories
INSERT INTO public.categories (name, icon, color, description) VALUES
  ('Math',       '∑',  '#4d9cff', 'Numbers, equations, and mathematical reasoning'),
  ('Science',    '🔬', '#a855f7', 'Physics, chemistry, biology, and scientific thinking'),
  ('Puzzles',    '🧩', '#f97316', 'Brain teasers, riddles, and creative problem solving'),
  ('Logic',      '🧠', '#00cc6a', 'Deductive reasoning, patterns, and logical analysis'),
  ('Aptitude',   '⚡', '#eab308', 'Verbal, spatial, and general aptitude challenges'),
  ('Mystery',    '🔍', '#ec4899', 'Lateral thinking and detective-style problems')
ON CONFLICT (name) DO UPDATE SET
  icon        = EXCLUDED.icon,
  color       = EXCLUDED.color,
  description = EXCLUDED.description;

-- ── MATH PROBLEMS ────────────────────────────────────────────
INSERT INTO public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward) VALUES

-- Novice
('Sum of First N Numbers',
 'What is the sum of all integers from 1 to 100?',
 (SELECT id FROM categories WHERE name='Math'), 'novice', 'numeric', '5050', 10),

('Percentage Basics',
 'A shirt costs $80. It is on sale for 25% off. What is the sale price in dollars?',
 (SELECT id FROM categories WHERE name='Math'), 'novice', 'numeric', '60', 10),

-- Apprentice
('Prime Factorization',
 'What is the largest prime factor of 360?',
 (SELECT id FROM categories WHERE name='Math'), 'apprentice', 'numeric', '5', 20),

('Quadratic Roots',
 'Find the positive root of: x² - 5x + 6 = 0',
 (SELECT id FROM categories WHERE name='Math'), 'apprentice', 'numeric', '3', 20),

-- Expert
('Modular Arithmetic',
 'What is the remainder when 2^100 is divided by 7?',
 (SELECT id FROM categories WHERE name='Math'), 'expert', 'numeric', '2', 40),

('Combinatorics',
 'In how many ways can you arrange the letters of the word BANANA?',
 (SELECT id FROM categories WHERE name='Math'), 'expert', 'numeric', '60', 40),

-- Master
('Number Theory',
 'Find the last two digits of 7^999. (Answer as a two-digit number, e.g. 07)',
 (SELECT id FROM categories WHERE name='Math'), 'master', 'numeric', '43', 80),

('Infinite Series',
 'What is the sum of the infinite series: 1 + 1/2 + 1/4 + 1/8 + ... ?',
 (SELECT id FROM categories WHERE name='Math'), 'master', 'numeric', '2', 80);

-- ── SCIENCE PROBLEMS ─────────────────────────────────────────
INSERT INTO public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward) VALUES

-- Novice
('Speed of Light',
 'Approximately how fast does light travel in a vacuum? (in km/s, rounded to nearest hundred thousand)',
 (SELECT id FROM categories WHERE name='Science'), 'novice', 'numeric', '300000', 10),

('Boiling Point',
 'At standard atmospheric pressure, at what temperature (°C) does water boil?',
 (SELECT id FROM categories WHERE name='Science'), 'novice', 'numeric', '100', 10),

-- Apprentice
('Ohm''s Law',
 'A circuit has a voltage of 12V and a resistance of 4 ohms. What is the current in amperes?',
 (SELECT id FROM categories WHERE name='Science'), 'apprentice', 'numeric', '3', 20),

('Chemical Formula',
 'How many atoms are in one molecule of glucose (C₆H₁₂O₆)? Count all atoms.',
 (SELECT id FROM categories WHERE name='Science'), 'apprentice', 'numeric', '24', 20),

-- Expert
('Half-Life',
 'A radioactive substance has a half-life of 5 years. After 20 years, what fraction of the original sample remains? (as a fraction like 1/16)',
 (SELECT id FROM categories WHERE name='Science'), 'expert', 'exact', '1/16', 40),

('Gravitational Force',
 'If the distance between two masses is doubled, by what factor does the gravitational force between them change? (e.g. 1/4)',
 (SELECT id FROM categories WHERE name='Science'), 'expert', 'exact', '1/4', 40),

-- Master
('Entropy',
 'Explain why entropy of the universe always increases. What would a Maxwell''s Demon actually violate, and why can it not exist?',
 (SELECT id FROM categories WHERE name='Science'), 'master', 'peer_review', NULL, 80),

('Quantum Tunneling',
 'A particle with energy E approaches a potential barrier of height U > E and width L. In classical mechanics it cannot pass. Explain qualitatively why quantum mechanics allows tunneling, and how the tunneling probability depends on L.',
 (SELECT id FROM categories WHERE name='Science'), 'master', 'peer_review', NULL, 80);

-- ── PUZZLES PROBLEMS ─────────────────────────────────────────
INSERT INTO public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward) VALUES

-- Novice
('River Crossing',
 'A farmer has a fox, a chicken, and a bag of grain. He must cross a river in a boat that fits only him and one item. The fox eats the chicken and the chicken eats the grain when left alone. How many trips does the farmer need to get everything across?',
 (SELECT id FROM categories WHERE name='Puzzles'), 'novice', 'numeric', '7', 10),

('Missing Number',
 'Find the missing number in the sequence: 2, 6, 12, 20, 30, __',
 (SELECT id FROM categories WHERE name='Puzzles'), 'novice', 'numeric', '42', 10),

-- Apprentice
('Weighing Puzzle',
 'You have 12 identical-looking balls, one is slightly heavier. Using a balance scale with only 3 weighings, you can always find the heavier ball. What is the minimum number of balls you need to guarantee finding the odd one in exactly 2 weighings?',
 (SELECT id FROM categories WHERE name='Puzzles'), 'apprentice', 'numeric', '9', 20),

('Monty Hall',
 'In the Monty Hall problem, you pick door 1. The host opens door 3 (empty). Should you switch to door 2? What is your probability of winning if you switch? (as a fraction)',
 (SELECT id FROM categories WHERE name='Puzzles'), 'apprentice', 'exact', '2/3', 20),

-- Expert
('Knights and Knaves',
 'On an island, knights always tell the truth and knaves always lie. You meet A and B. A says "At least one of us is a knave." What are A and B?',
 (SELECT id FROM categories WHERE name='Puzzles'), 'expert', 'exact', 'A is knight B is knave', 40),

('The Liars',
 'Five people stand in a row. Each says "The person next to me is lying." If the first person tells the truth, how many truth-tellers are there?',
 (SELECT id FROM categories WHERE name='Puzzles'), 'expert', 'numeric', '3', 40),

-- Master
('Four Fours',
 'Using exactly four 4s and any standard mathematical operations (+, -, ×, ÷, √, !, ^, parentheses), express the number 100. Write one valid expression.',
 (SELECT id FROM categories WHERE name='Puzzles'), 'master', 'peer_review', NULL, 80),

('Prisoners and Hats',
 '100 prisoners stand in a line. Each wears a black or white hat. Starting from the back, each must guess their own hat color (others can hear). What strategy guarantees at least 99 prisoners survive? Describe it fully.',
 (SELECT id FROM categories WHERE name='Puzzles'), 'master', 'peer_review', NULL, 80);

-- ── LOGIC PROBLEMS ───────────────────────────────────────────
INSERT INTO public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward) VALUES

-- Novice
('Syllogism',
 'All cats are mammals. All mammals are animals. Therefore, all cats are ___?',
 (SELECT id FROM categories WHERE name='Logic'), 'novice', 'exact', 'animals', 10),

('Odd One Out',
 'Which does not belong: Apple, Banana, Carrot, Mango, Grape?',
 (SELECT id FROM categories WHERE name='Logic'), 'novice', 'exact', 'Carrot', 10),

-- Apprentice
('Pattern Completion',
 'If APPLE → 1-16-16-12-5, what does GRAPE map to? (sum of letter positions)',
 (SELECT id FROM categories WHERE name='Logic'), 'apprentice', 'numeric', '46', 20),

('Logical Deduction',
 'Alice is taller than Bob. Bob is taller than Carol. Carol is taller than Dave. Who is the shortest?',
 (SELECT id FROM categories WHERE name='Logic'), 'apprentice', 'exact', 'Dave', 20),

-- Expert
('Set Theory',
 'In a class of 40 students, 25 play cricket, 20 play football, and 10 play both. How many play neither?',
 (SELECT id FROM categories WHERE name='Logic'), 'expert', 'numeric', '5', 40),

('Truth Tables',
 'How many rows in the truth table for a logical expression with 4 variables have an even number of TRUE values?',
 (SELECT id FROM categories WHERE name='Logic'), 'expert', 'numeric', '8', 40),

-- Master
('Gödel''s Incompleteness',
 'Describe in your own words what Gödel''s First Incompleteness Theorem states, and give a real-world analogy that captures the essence of the proof.',
 (SELECT id FROM categories WHERE name='Logic'), 'master', 'peer_review', NULL, 80),

('Sorting Algorithm Logic',
 'Prove that any comparison-based sorting algorithm must make at least Ω(n log n) comparisons in the worst case. Use the decision-tree argument.',
 (SELECT id FROM categories WHERE name='Logic'), 'master', 'peer_review', NULL, 80);

-- ── APTITUDE PROBLEMS ────────────────────────────────────────
INSERT INTO public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward) VALUES

-- Novice
('Work Rate',
 'A can finish a job in 10 days, B in 15 days. Working together, how many days to finish the job?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'novice', 'numeric', '6', 10),

('Simple Interest',
 'What is the simple interest on $1000 at 5% per annum for 3 years?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'novice', 'numeric', '150', 10),

-- Apprentice
('Trains Passing',
 'Two trains 150m and 250m long run at 60 km/h and 40 km/h in opposite directions. How many seconds to pass each other?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'apprentice', 'numeric', '18', 20),

('Profit and Loss',
 'A shopkeeper buys 100 pens at $2 each and sells 80 at $3 and the remaining at $1. What is the overall profit or loss in dollars?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'apprentice', 'numeric', '20', 20),

-- Expert
('Pipes and Cistern',
 'Pipe A fills a tank in 6 hours, pipe B in 8 hours, pipe C empties in 12 hours. All open together — how many hours to fill the tank?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'expert', 'numeric', '24', 40),

('Ages Problem',
 'The ratio of ages of father and son is 7:2. After 6 years it becomes 5:2. What is the current age of the father?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'expert', 'numeric', '42', 40),

-- Master
('Compound Interest',
 'What principal amount will grow to $10,000 in 3 years at 10% per annum compounded annually? Round to the nearest dollar.',
 (SELECT id FROM categories WHERE name='Aptitude'), 'master', 'numeric', '7513', 80),

('Mixture Problem',
 'A 60-litre vessel contains milk and water in ratio 3:1. How many litres of water must be added to make the ratio 3:2?',
 (SELECT id FROM categories WHERE name='Aptitude'), 'master', 'numeric', '15', 80);

-- ── MYSTERY PROBLEMS ─────────────────────────────────────────
INSERT INTO public.problems (title, body, category_id, difficulty, answer_type, correct_answer, token_reward) VALUES

-- Novice
('The Missing Dollar',
 'Three friends share a $30 hotel room ($10 each). The manager refunds $5, split among them ($1 each back, $2 tip to bellboy). They paid $9 each = $27 + $2 tip = $29. Where is the missing dollar?',
 (SELECT id FROM categories WHERE name='Mystery'), 'novice', 'peer_review', NULL, 10),

('Who Owns the Fish',
 'There are five houses in a row, each painted a different color. In each house lives a person of different nationality. They each drink a different drink, smoke a different brand, and own a different pet. The Brit lives in the red house. The Swede keeps dogs. The Dane drinks tea. The green house is left of the white house. The green house owner drinks coffee. Who owns the fish? (classic Zebra puzzle — answer the nationality)',
 (SELECT id FROM categories WHERE name='Mystery'), 'novice', 'exact', 'German', 10),

-- Apprentice
('The Poisoned Wine',
 'A king has 1000 bottles of wine, one is poisoned. He has 10 prisoners to test. A prisoner dies exactly 24 hours after drinking poison. The king needs to find the poisoned bottle in 24 hours using the fewest tests. What is the minimum number of prisoners needed?',
 (SELECT id FROM categories WHERE name='Mystery'), 'apprentice', 'numeric', '10', 20),

('The Unexpected Hanging',
 'A judge tells a prisoner he will be hanged on an unexpected day next week (Mon–Fri). The prisoner reasons he cannot be hanged — why? And what is the flaw in his reasoning?',
 (SELECT id FROM categories WHERE name='Mystery'), 'apprentice', 'peer_review', NULL, 20),

-- Expert
('The Blue Eyes Puzzle',
 'On an island, 100 people have blue eyes and 100 have brown. No one knows their own eye color. If you have blue eyes you must leave on the night you figure it out. A visitor announces "I see at least one person with blue eyes." What happens and on which night?',
 (SELECT id FROM categories WHERE name='Mystery'), 'expert', 'peer_review', NULL, 40),

('The Two Envelopes',
 'You are given two envelopes; one has twice as much money as the other. You pick one and see $100. Should you switch? Calculate the expected value both ways and explain the paradox.',
 (SELECT id FROM categories WHERE name='Mystery'), 'expert', 'peer_review', NULL, 40),

-- Master
('Sleeping Beauty',
 'Sleeping Beauty is put to sleep. A coin is flipped. Heads: she is woken once on Monday. Tails: she is woken on Monday and Tuesday (memory wiped each time). On waking, what probability should she assign to the coin being Heads? Defend your answer.',
 (SELECT id FROM categories WHERE name='Mystery'), 'master', 'peer_review', NULL, 80),

('Newcomb''s Problem',
 'A predictor with near-perfect accuracy places $1M in box B if it predicts you take only box B, or leaves it empty if it predicts you take both boxes. Box A always has $1000. Do you take one box or two? Give your reasoning and address the counterargument.',
 (SELECT id FROM categories WHERE name='Mystery'), 'master', 'peer_review', NULL, 80);
