function show_comment_form(el) {
    let thread = el.closest('.thread')
    let comment = el.parentElement
    let comment_id = comment.getAttribute('id')
    let form = document.querySelector('template[id="comment-form"]').content.cloneNode(true)
    form.querySelector('.comment-form').appendChild(reply_id_input_element(comment_id))
    thread.appendChild(form)
    thread.querySelector('form').scrollIntoView({behavior: 'smooth'})
}

function remove_comment_form(el) {
    let form = el.closest('.comment-box')
    form.remove()
}

function reply_id_input_element(reply_id) {
    let input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', 'reply_id')
    input.setAttribute('value', reply_id)
    return input
}

function post_comment(api_point, el) {
    show_loading(el)
    let data = extract_form_data()
    send_post_request(api_point, data,function() { handle_api_response(el, this) } )
}

function handle_api_response(el, xhr) {
    if (xhr.readyState === 4) {
        hide_loading(el)
        if (xhr.status === 200) {
        } else {
            alert('Error! Could not post comment.')
        }
    }
}

function show_loading(btn) {
    btn.setAttribute('disabled', 'disabled')
    btn.innerHTML = '<span class="loader"></span>'
}

function hide_loading(btn) {
    btn.removeAttribute('disabled')
    btn.innerHTML = 'Comment'
}

function send_post_request(api_point, data, callback) {
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = callback
    xhttp.open('POST', api_point, true)
    xhttp.setRequestHeader("Content-type", "application/json")
    xhttp.send(prepare_form_data(data))
}

function prepare_form_data(data) {
    return JSON.stringify(data)
}

function extract_form_data() {

    let branch, email, reply_to

    let branch_el = document.querySelector('.comment-form input[name="branch"]')
    if (branch_el !== null)
        branch = branch_el.value

    let email_el = document.querySelector('.comment-form input[name="email"]')
    if (email_el !== null)
        email = email_el.value


    let reply_to_el = document.querySelector('.comment-form input[name="reply_to"]')
    if (reply_to_el !== null)
        reply_to = reply_to_el.value

    return {
        post: document.querySelector('.comment-form input[name="post"]').value,
        branch: branch,
        name: document.querySelector('.comment-form input[name="name"]').value,
        email: email,
        comment: document.querySelector('.comment-form textarea[name="comment"]').value,
        reply_to: reply_to,
    }
}