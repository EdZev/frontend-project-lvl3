const renderFeedback = (loadingState, fields) => {
  const { submit, feedback } = fields;
  submit.removeAttribute('disabled');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.innerHTML = loadingState.error;
};

export default (loadingState, fields) => {
  renderFeedback(loadingState, fields);
};
