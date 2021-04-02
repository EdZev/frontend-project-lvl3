const renderFeedback = (loadingState, fields) => {
  const { submit, feedback, input } = fields;
  submit.removeAttribute('disabled');
  input.removeAttribute('readOnly');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.innerHTML = loadingState.error;
};

export default (loadingState, fields) => {
  renderFeedback(loadingState, fields);
};
