function createAIReplyButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.textContent = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");
  return button;
}

function getOriginalEmailContent() {
  const emailContentSelectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];

  for (const selector of emailContentSelectors) {
    const contentElement = document.querySelector(selector);
    if (contentElement) {
      return contentElement.innerText.trim();
    }
  }
  return "";
}

function findComposeToolbar() {
  const toolbarSelectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];

  for (const selector of toolbarSelectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

async function onAIReplyButtonClick(button) {
  button.textContent = "Generating...";
  button.disabled = true;

  try {
    const emailContent = getOriginalEmailContent();
    if (!emailContent) {
      alert("Could not find the email content.");
      return;
    }

    const apiResponse = await fetch(
      "http://localhost:8145/api/email/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional",
        }),
      }
    );

    if (!apiResponse.ok) {
      throw new Error("API request failed");
    }

    const generatedReply = await apiResponse.text();
    const composeBox = document.querySelector(
      '[role="textbox"][g_editable="true"]'
    );

    if (composeBox) {
      composeBox.focus();
      document.execCommand("insertText", false, generatedReply);
    } else {
      console.error("Compose box was not found");
      alert("Failed to insert the reply.");
    }
  } catch (error) {
    console.error("Error generating reply:", error);
    alert("Failed to generate reply.");
  } finally {
    button.textContent = "AI Reply";
    button.disabled = false;
  }
}

function injectAIReplyButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) {
    existingButton.remove();
  }

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.warn("Compose toolbar not found.");
    return;
  }

  const aiReplyButton = createAIReplyButton();
  aiReplyButton.classList.add("ai-reply-button");
  aiReplyButton.addEventListener("click", () =>
    onAIReplyButtonClick(aiReplyButton)
  );

  toolbar.insertBefore(aiReplyButton, toolbar.firstChild);
  console.log("AI Reply button injected.");
}

const composeWindowObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const composeWindowOpened = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );

    if (composeWindowOpened) {
      console.log("Compose window detected.");
      setTimeout(injectAIReplyButton, 500);
    }
  }
});

composeWindowObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
