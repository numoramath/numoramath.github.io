(() => {
  const format = value => Number.isFinite(value) ? Number(value.toFixed(10)).toString() : 'undefined';
  const numbered = steps => steps.map((step, index) => `${index + 1}. ${step}`).join('\n');

  function calculateExpression(source) {
    const tokens = [];
    let index = 0;
    let expectsValue = true;
    while (index < source.length) {
      const char = source[index];
      if (/\s/.test(char)) { index++; continue; }
      if (/[0-9.]/.test(char) || (char === '-' && expectsValue && /[0-9.]/.test(source[index + 1] || ''))) {
        const start = index;
        if (char === '-') index++;
        while (/[0-9.]/.test(source[index] || '')) index++;
        const value = Number(source.slice(start, index));
        if (!Number.isFinite(value)) return null;
        tokens.push({ type: 'number', value });
        expectsValue = false;
        continue;
      }
      if (char === '(') { tokens.push({ type: 'left' }); expectsValue = true; index++; continue; }
      if (char === ')') { tokens.push({ type: 'right' }); expectsValue = false; index++; continue; }
      if ('+-*/'.includes(char) && !expectsValue) { tokens.push({ type: 'operator', value: char }); expectsValue = true; index++; continue; }
      return null;
    }
    if (!tokens.length || expectsValue) return null;

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const output = [], operators = [];
    for (const token of tokens) {
      if (token.type === 'number') output.push(token);
      else if (token.type === 'left') operators.push(token);
      else if (token.type === 'right') {
        while (operators.length && operators.at(-1).type !== 'left') output.push(operators.pop());
        if (!operators.length) return null;
        operators.pop();
      } else {
        while (operators.length && operators.at(-1).type === 'operator' && precedence[operators.at(-1).value] >= precedence[token.value]) output.push(operators.pop());
        operators.push(token);
      }
    }
    while (operators.length) {
      const token = operators.pop();
      if (token.type === 'left') return null;
      output.push(token);
    }

    const values = [], steps = [];
    for (const token of output) {
      if (token.type === 'number') { values.push(token.value); continue; }
      const right = values.pop(), left = values.pop();
      if (left === undefined || right === undefined || (token.value === '/' && right === 0)) return null;
      const result = token.value === '+' ? left + right : token.value === '-' ? left - right : token.value === '*' ? left * right : left / right;
      if (!Number.isFinite(result)) return null;
      steps.push(`${format(left)} ${token.value} ${format(right)} = ${format(result)}`);
      values.push(result);
    }
    return values.length === 1 ? { result: values[0], steps } : null;
  }

  function mathAnswer(question) {
    const normalized = question.replace(/\bdivided by\b/gi, '/').replace(/\b(?:multiplied by|times)\b/gi, '*').replace(/\bplus\b/gi, '+').replace(/\bminus\b/gi, '-').replace(/\bover\b/gi, '/').replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '');
    const equation = normalized.match(/(-?\d+(?:\.\d+)?)\s*x\s*([+-])\s*(-?\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/i);
    if (equation) {
      const [, aText, operation, bText, cText] = equation;
      const a = Number(aText), b = Number(bText), c = Number(cText);
      if (a === 0) return 'This equation has no single x value because the coefficient of x is zero. Please check the equation.';
      const isolated = operation === '+' ? c - b : c + b;
      const x = isolated / a;
      return `Let’s solve it in three steps:\n\n${numbered([`Start with ${a}x ${operation} ${b} = ${c}.`, `Undo ${operation === '+' ? 'addition' : 'subtraction'}: ${a}x = ${format(isolated)}.`, `Divide both sides by ${a}: x = ${format(x)}. Then substitute it back to check.`])}\n\nAnswer: **x = ${format(x)}**.`;
    }

    const percent = normalized.match(/(-?\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(-?\d+(?:\.\d+)?)/i);
    if (percent) {
      const rate = Number(percent[1]), base = Number(percent[2]), decimal = rate / 100, result = decimal * base;
      return `Let’s solve it in three steps:\n\n${numbered([`Write the percent as a fraction: ${rate}% = ${rate}/100.`, `Convert to a decimal: ${rate}/100 = ${format(decimal)}.`, `Multiply by ${base}: ${format(decimal)} × ${base} = ${format(result)}.`])}\n\nAnswer: **${format(result)}**.`;
    }

    const fraction = normalized.match(/(-?\d+)\s*\/\s*(\d+)\s*([+-])\s*(-?\d+)\s*\/\s*(\d+)/);
    if (fraction && /fraction/i.test(question)) {
      const a = Number(fraction[1]), b = Number(fraction[2]), c = Number(fraction[4]), d = Number(fraction[5]);
      if (!b || !d) return 'A fraction cannot have zero as its denominator. Please check the problem.';
      const numerator = fraction[3] === '+' ? a * d + c * b : a * d - c * b;
      const denominator = b * d;
      const gcd = (x, y) => y ? gcd(y, x % y) : Math.abs(x);
      const divisor = gcd(numerator, denominator) || 1;
      const reducedN = numerator / divisor, reducedD = denominator / divisor;
      return `Let’s solve it in three steps:\n\n${numbered([`Find a common denominator: ${b} × ${d} = ${denominator}.`, `Rewrite and combine the numerators: (${a} × ${d}) ${fraction[3]} (${c} × ${b}) = ${numerator}.`, `Simplify ${numerator}/${denominator} to ${reducedN}/${reducedD}.`])}\n\nAnswer: **${reducedN}/${reducedD}**.`;
    }

    const average = question.match(/(?:average|mean)\D*((?:-?\d+(?:\.\d+)?\s*(?:,|and)?\s*){2,})/i);
    if (average) {
      const values = average[1].match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      if (values.length > 1) {
        const sum = values.reduce((total, value) => total + value, 0), result = sum / values.length;
        return `Let’s find the average in three steps:\n\n${numbered([`Add the values: ${values.map(format).join(' + ')} = ${format(sum)}.`, `Count the values: there are ${values.length}.`, `Divide the total by the count: ${format(sum)} ÷ ${values.length} = ${format(result)}.`])}\n\nAnswer: **${format(result)}**.`;
      }
    }

    const shape = question.match(/\b(area|perimeter)\b.*?\b(rectangle|square|triangle)\b[^\d-]*(-?\d+(?:\.\d+)?)(?:\D+(-?\d+(?:\.\d+)?))?/i);
    if (shape) {
      const [, measure, kind, firstText, secondText] = shape;
      const first = Number(firstText), second = secondText === undefined ? first : Number(secondText);
      if (first >= 0 && second >= 0) {
        let result, steps;
        if (measure.toLowerCase() === 'area' && kind.toLowerCase() === 'triangle') {
          result = first * second / 2;
          steps = [`Use the triangle area formula: base × height ÷ 2.`, `Substitute the measurements: ${first} × ${second} ÷ 2.`, `Calculate the area: **${format(result)} square units**.`];
        } else if (measure.toLowerCase() === 'area') {
          result = first * second;
          steps = [`Use the area formula: length × width.`, `Substitute the measurements: ${first} × ${second}.`, `Calculate the area: **${format(result)} square units**.`];
        } else {
          result = kind.toLowerCase() === 'square' ? first * 4 : (first + second) * 2;
          steps = [`Perimeter is the distance around the shape.`, `For a ${kind.toLowerCase()}, add its side lengths: ${kind.toLowerCase() === 'square' ? `${first} + ${first} + ${first} + ${first}` : `${first} + ${second} + ${first} + ${second}`}.`, `Add the sides: **${format(result)} units**.`];
        }
        return `Let’s find the ${measure.toLowerCase()} in three steps:\n\n${numbered(steps)}\n\nAnswer: **${format(result)} ${measure.toLowerCase() === 'area' ? 'square units' : 'units'}**.`;
      }
    }

    const expression = normalized.match(/(?:-?\d|\()[\d\s().+\-*/]*(?:\d|\))/);
    if (expression && /[+*/-]/.test(expression[0])) {
      const solved = calculateExpression(expression[0]);
      if (solved) {
        const steps = [...solved.steps];
        if (steps.length === 0) return null;
        if (steps.length === 1) {
          const op = steps[0].split(' = ')[0];
          steps.unshift(`Identify the operation in ${op}.`);
          steps.push(`Check the result by using the inverse operation where possible.`);
        } else {
          steps.unshift(`Use order of operations to work through ${expression[0]}.`);
          steps.push(`Check the result by substituting the intermediate values back into the expression.`);
        }
        return `Let’s solve it step by step:\n\n${numbered(steps)}\n\nAnswer: **${format(solved.result)}**.`;
      }
    }
    return null;
  }

  function scienceAnswer(question) {
    const q = question.toLowerCase();
    if (/photosynthesis/.test(q)) return `Photosynthesis is how plants make sugars using light.\n\n${numbered(['Leaves capture energy from sunlight using chlorophyll.', 'Roots bring in water, while leaves take in carbon dioxide from the air.', 'The plant uses light energy to turn water and carbon dioxide into sugar, releasing oxygen.'])}\n\nIn short: light + water + carbon dioxide → sugar + oxygen.`;
    if (/water cycle|rain cycle/.test(q)) return `The water cycle moves water around Earth.\n\n${numbered(['The Sun warms water, which evaporates into water vapor.', 'The vapor cools and condenses into clouds.', 'Water falls as precipitation and flows or seeps back into rivers, lakes, and oceans.'])}`;
    if (/gravity/.test(q)) return `Gravity is the attraction between objects that have mass.\n\n${numbered(['Every object with mass attracts other objects.', 'The pull is stronger when objects have more mass and weaker when they are farther apart.', 'Near Earth, gravity pulls objects toward Earth’s center, which is why unsupported objects fall.'])}`;
    if (/states of matter|solid liquid gas/.test(q)) return `Matter commonly appears as a solid, liquid, or gas.\n\n${numbered(['In a solid, particles stay close together and mostly vibrate in place.', 'In a liquid, particles stay close but move past one another, so the liquid flows.', 'In a gas, particles spread out and move freely, filling their container.'])}`;
    if (/why is the sky blue|why.*sky.*blue/.test(q)) return `The sky looks blue because air scatters sunlight.\n\n${numbered(['Sunlight contains many colors, even though it looks white.', 'Tiny molecules in the atmosphere scatter shorter blue wavelengths more strongly than longer red wavelengths.', 'Blue light reaches your eyes from many directions, making the daytime sky look blue.'])}`;
    if (/planets.*solar system|order.*planets|planets.*order/.test(q)) return `The eight planets, moving outward from the Sun, are:\n\n${numbered(['Start with the four inner planets: Mercury, Venus, Earth, and Mars.', 'Next are the outer giants: Jupiter and Saturn.', 'Finish with Uranus and Neptune.'])}\n\nMemory tip: “My Very Eager Mother Just Served Us Noodles.”`;
    if (/boil(?:ing)? point|what temperature.*boil|boil.*water/.test(q)) return `At normal sea-level pressure, pure water boils at 100°C (212°F).\n\n${numbered(['Heat gives water molecules more energy.', 'At the boiling point, vapor bubbles can form throughout the liquid.', 'Air pressure changes the boiling temperature, so water boils at a lower temperature at high elevations.'])}`;
    if (/\b(noun|verb|adjective)\b/i.test(q)) {
      const grammar = q.match(/\b(noun|verb|adjective)\b/i)?.[1].toLowerCase();
      const definitions = { noun: ['A noun names a person, place, thing, or idea.', 'Find the word doing the naming in a sentence.', 'Example: in “The puppy ran,” puppy is the noun.'], verb: ['A verb tells an action or a state of being.', 'Ask what the subject does or is.', 'Example: in “The puppy ran,” ran is the verb.'], adjective: ['An adjective describes a noun.', 'Look for a word that tells what kind, which one, or how many.', 'Example: in “The small puppy ran,” small is the adjective.'] };
      return `A ${grammar} is a part of speech.\n\n${numbered(definitions[grammar])}`;
    }
    return null;
  }

  function answerMore(question) {
    const q = question.trim();
    const math = mathAnswer(q);
    if (math) return math;
    const science = scienceAnswer(q);
    if (science) return science;
    const capitalQuestion = q.match(/\bcapital of ([a-z ]+)\??/i);
    if (capitalQuestion) {
      const country = capitalQuestion[1].trim().toLowerCase();
      const capitals = { france: 'Paris', 'the united states': 'Washington, D.C.', 'united states': 'Washington, D.C.', usa: 'Washington, D.C.', india: 'New Delhi', 'the united kingdom': 'London', 'united kingdom': 'London', uk: 'London', canada: 'Ottawa', japan: 'Tokyo', australia: 'Canberra', italy: 'Rome', spain: 'Madrid', mexico: 'Mexico City', china: 'Beijing', germany: 'Berlin' };
      if (capitals[country]) return `The capital of ${country.replace(/\b\w/g, letter => letter.toUpperCase())} is **${capitals[country]}**.\n\n${numbered([`Identify the place asked about: ${country}.`, 'A capital is the city where a country’s national government is based.', `The capital city is ${capitals[country]}.`])}`;
    }
    if (/\b(what is|who was|who is|define|explain)\b/i.test(q)) {
      const topic = q.replace(/^(?:what is|who was|who is|define|explain)\s+/i, '').replace(/[?.!]+$/, '').trim();
      if (/photosynthesis|water cycle|gravity|states of matter/i.test(topic)) return scienceAnswer(q);
      return `I can help explain **${topic || q}**, but I don’t have a live knowledge source connected right now.\n\n${numbered(['Tell me the subject area or where you encountered the term.', 'Share any sentence, example, or details you already have.', 'I’ll use that context to give you a focused explanation and check that it answers your question.'])}`;
    }
    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i.test(q)) return `Hi! I’m Numora AI.\n\n${numbered(['Ask a math question or paste a calculation.', 'Ask me to explain a science topic or make a study plan.', 'Include the grade level or details you want me to use.'])}`;
    if (/\b(how|steps|plan|teach|learn|write|make|create|build|solve|explain)\b/i.test(q)) {
      return `Here’s a useful three-step way to approach **${q.replace(/[?.!]+$/, '')}**:\n\n${numbered(['Clarify the goal and collect the details that matter.', 'Break the work into small actions and complete the first one.', 'Review the result, correct anything missing, and decide the next action.'])}\n\nGive me more details and I can tailor these steps to your question.`;
    }
    return `I’m not sure what you mean yet.\n\n${numbered(['Tell me the topic.', 'Add the question or example you want help with.', 'I’ll answer using those details and show the reasoning in steps.'])}`;
  }

  answer = answerMore;
  globalThis.numoraEnhancedAnswer = answerMore;
})();
