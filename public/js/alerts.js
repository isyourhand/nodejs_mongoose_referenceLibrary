// type is 'success' or 'error'
export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
    hideAlert();

    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    console.log('hello from alert!', markup);
    // 'afterbegin' means is inside of the body, but right at the beginning.
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

    window.setTimeout(hideAlert, 5000);
};
