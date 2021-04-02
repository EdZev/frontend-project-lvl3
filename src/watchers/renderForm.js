const renderSending = (fields) => {
  const { submit, input, feedback } = fields;
  submit.disabled = true;
  input.readOnly = true;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.innerHTML = '';
};

const renderFilling = (fields, error) => {
  const { input, feedback } = fields;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = error;
};

const renderFinished = (fields) => {
  const {
    submit,
    form,
    input,
    feedback,
  } = fields;
  form.reset();
  submit.removeAttribute('disabled');
  input.removeAttribute('readOnly');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = 'Rss loaded successfully';
};

export default (state, fields) => {
  switch (state.status) {
    case 'filling':
      renderFilling(fields, state.error);
      break;
    case 'sending':
      renderSending(fields);
      break;
    case 'finished':
      renderFinished(fields);
      break;
    default:
      throw new Error('No such status of state is defined');
  }
};
