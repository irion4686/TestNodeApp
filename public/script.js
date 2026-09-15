async function getText() {
  const response = await fetch("/api/quote", { cache: "no-store" });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to load a quote.");
  }

  return `“${result.text}” — ${result.author}`;
}

const displayText = document.querySelector("#display-text");
const changeTextButton = document.querySelector("#change-text-button");

async function updateDisplayedText() {
  changeTextButton.disabled = true;

  try {
    displayText.textContent = await getText();
  } catch (error) {
    displayText.textContent = error.message;
  } finally {
    changeTextButton.disabled = false;
  }
}

changeTextButton.addEventListener("click", updateDisplayedText);
updateDisplayedText();
