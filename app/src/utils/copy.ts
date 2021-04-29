const noop = () => {};
function fallbackCopyTextToClipboard(text, success = noop, error = noop) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      success();
    } else {
      error();
    }
  } catch (err) {
    error();
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text, success = noop, error = noop) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text, success, error);
    return;
  }
  navigator.clipboard.writeText(text).then(success, error);
}

export default copyTextToClipboard;
