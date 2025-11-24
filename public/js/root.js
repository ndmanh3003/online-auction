window.submitForm = async (form, options = {}) => {
  const {
    method = "POST",
    url,
    onSuccess,
    transformData,
    getSubmitButton,
  } = options;

  const submitBtn = getSubmitButton
    ? getSubmitButton(form)
    : form.querySelector('[type="submit"]');
  const originalText = submitBtn?.textContent;

  if (submitBtn) {
    submitBtn.disabled = true;
    if (originalText) {
      submitBtn.textContent = "Processing...";
    }
  }

  try {
    const formData = new FormData(form);
    let data = Object.fromEntries(formData.entries());

    if (transformData) {
      data = transformData(data);
    }
 
    const response = await fetch(
      url || form.action || window.location.pathname,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "An error occurred");
      return;
    }

    if (onSuccess) {
      await onSuccess(result);
    }
  } catch (error) {
    console.error("Form submit error:", error);
    alert("Unable to connect to server");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (originalText) {
        submitBtn.textContent = originalText;
      }
    }
  }
};
