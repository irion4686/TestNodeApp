const messages = [
  "Hello from Node.js!",
  "The text has changed.",
  "You can replace this text source later.",
];

let messageIndex = 0;

// Change this function later to get text from an API, database, or other source.
function getText() {
  const text = messages[messageIndex];
  messageIndex = (messageIndex + 1) % messages.length;
  return text;
}

const displayText = document.querySelector("#display-text");
const changeTextButton = document.querySelector("#change-text-button");

function updateDisplayedText() {
  displayText.textContent = getText();
}

changeTextButton.addEventListener("click", updateDisplayedText);
updateDisplayedText();
