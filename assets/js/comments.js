function show_comment_form(el) {
    let thread = el.closest('.thread')
    let comment = el.parentElement
    let comment_id = comment.getAttribute('id')
    let form = document.querySelector('template[id="comment-form"]').content.cloneNode(true)
    form.querySelector('.comment-form').appendChild(parent_id_input_element(comment_id))
    thread.appendChild(form)
    thread.querySelector('form').scrollIntoView({behavior: 'smooth'})
}

function remove_comment_form(el) {
    let form = el.closest('.comment-box')
    form.remove()
}

function parent_id_input_element(parent_id) {
    let input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', 'parent_id')
    input.setAttribute('value', parent_id)
    return input
}

function post_comment(api_point, el) {
    show_loading(el)
    let data = extract_form_data(el)
    send_post_request(api_point, data, function () {
        handle_api_response(el, data, this)
    })
}

function handle_api_response(el, data, xhr) {
    if (xhr.readyState === 4) {
        hide_loading(el)
        if (xhr.status === 200) {
            let comment = JSON.parse(xhr.response).comment
            append_comment(comment)
            if (data.parent_id)
                remove_comment_form(el)
        } else {
            alert('Error! Could not post comment.')
        }
    }
}

function append_comment(data) {
    let thread = get_thread(data)
    let comment = create_comment(data)
    thread.appendChild(comment);
}

function get_thread(data) {
    let thread;
    if (data.parent_id)
        thread = document.querySelector(`div[id=${data.parent_id}]`)
    else
        thread = document.querySelector('section[class="post-comments"]')
    return thread
}

function create_comment(data) {
    let comment_template = document.querySelector('template[id="comment"]')
    comment_template = doT.template(comment_template.innerHTML)
    el = document.createElement('template')
    el.innerHTML = comment_template(data).trim()
    return el.content.firstChild
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

function extract_form_data(el) {
    let form = el.closest('form')
    let branch, email, parent_id

    let branch_el = form.querySelector('.comment-form input[name="branch"]')
    if (branch_el !== null)
        branch = branch_el.value

    let email_el = form.querySelector('.comment-form input[name="email"]')
    if (email_el !== null)
        email = email_el.value


    let parent_id_el = form.querySelector('.comment-form input[name="parent_id"]')
    if (parent_id_el !== null)
        parent_id = parent_id_el.value

    return {
        post: form.querySelector('.comment-form input[name="post"]').value,
        branch: branch,
        name: form.querySelector('.comment-form input[name="name"]').value,
        email: email,
        timestamp: current_date(),
        comment: form.querySelector('.comment-form textarea[name="comment"]').value,
        parent_id: parent_id,
    }
}

function current_date()
{
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    let date = new Date()
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}
