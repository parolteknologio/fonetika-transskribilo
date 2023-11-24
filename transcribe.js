document.getElementById("rulesSelect").addEventListener("change", function () {
  const selectedRuleFile = this.value;
  loadRules(selectedRuleFile);
});

function loadRules(ruleFileName) {
  fetch(ruleFileName + ".json")
    .then((response) => response.json())
    .then((data) => {
      // Assuming 'transcribeEsperantoToPolish' function will use this data
      // Update your transcription rules here
      rules = data;
    })
    .catch((error) => console.error("Error loading rules:", error));
}

// Initial load
loadRules(document.getElementById("rulesSelect").value);

// Your transcribing functions here, modified for the browser

function transcribeNumber(whole, fraction, rules) {
  const transcribeNumberPart = (number) => {
    const getNumber = (num) => rules.numbers[num.toString()] || num.toString();

    const transcribe = (one, ten, hundred, includeOne) => {
      let result = "";

      if (hundred > 0) {
        result +=
          hundred === 1
            ? ` ${getNumber(100)}`
            : ` ${getNumber(hundred)} ${getNumber(100)}`;
      }

      if (ten > 0) {
        result +=
          ten === 1
            ? ` ${getNumber(10)}`
            : ` ${getNumber(ten)} ${getNumber(10)}`;
      }

      if (one === 1) {
        if (includeOne) {
          result += ` ${getNumber(1)}`;
        }
      } else if (one !== 0) {
        result += ` ${getNumber(one)}`;
      }

      return result.trim();
    };

    let ones = number % 10;
    let tens = Math.floor((number / 10) % 10);
    let hundreds = Math.floor((number / 100) % 10);
    let thousands = Math.floor((number / 1000) % 10);
    let tenThousands = Math.floor((number / 10000) % 10);
    let hundredThousands = Math.floor((number / 100000) % 10);
    let millions = Math.floor((number / 1000000) % 10);
    let tenMillions = Math.floor((number / 10000000) % 10);
    let hundredMillions = Math.floor((number / 100000000) % 10);

    let first = transcribe(ones, tens, hundreds, true);
    let second = transcribe(thousands, tenThousands, hundredThousands, false);
    let third = transcribe(millions, tenMillions, hundredMillions, false);

    let result = "";

    if (millions || tenMillions || hundredMillions) {
      result += `${third} ${getNumber(1000000)},`;
    }

    if (thousands || tenThousands || hundredThousands) {
      result += ` ${second} ${getNumber(1000)},`;
    }

    if (ones || tens || hundreds) {
      result += ` ${first}`;
    }

    return result.trim().replace(/,$/, ""); // Remove trailing comma
  };

  let result = transcribeNumberPart(whole);

  if (fraction !== 0 && fraction < 100) {
    result = `${result}, komo ${transcribeNumberPart(fraction)}`;
  }

  return result;
}
function transcribeEsperantoToPolish(text) {
  // Convert text to lowercase
  text = text.toLowerCase();

  // Apply overrides first
  for (let override of rules.overrides) {
    text = text.replace(new RegExp(override.eo, "g"), override.pl);
  }

  // Transcribe letter by letter
  let transcribedText = "";
  for (let char of text) {
    if (rules.letters[char]) {
      transcribedText += rules.letters[char];
    } else {
      transcribedText += char; // Keep the character as is if no rule applies
    }
  }
  
   // Apply fragment replacements
  for (let fragment of rules.fragments) {
    text = text.replace(new RegExp(fragment.match, "g"), fragment.replace);
  }
  
  // Apply number replacements with more complex logic
  text = text.replace(/\b(\d+)(?:\.(\d+))?\b/g, (match, whole, fraction) => {
    whole = parseInt(whole, 10);
    fraction = fraction ? parseInt(fraction, 10) : 0;
    return transcribeNumber(whole, fraction, rules);
  });
  

  return transcribedText;
}

// Add event listener to the button
document.getElementById("transcribeButton").addEventListener("click", () => {
  const inputText = document.getElementById("inputField").value;
  console.log("Transcribing:", inputText);
  const transcribedText = transcribeEsperantoToPolish(inputText);
  console.log("Result:", transcribedText);
  document.getElementById("outputField").innerText =
    transcribedText || "No transcription available";
});
