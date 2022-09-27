
// load DOM page
document.addEventListener('DOMContentLoaded', function () {
    load_page('posts');
    // use button to toggle between views
    document.querySelector('#profile-nav').addEventListener('click', () => load_page('profile'));
    document.querySelector('#posts-nav').addEventListener('click', () => load_page('posts'));
    document.querySelector('#following-nav').addEventListener('click', () => load_page('following'));
    document.querySelector("#post").onsubmit = new_post;
});

// load each individual page
function load_page(page) {
    if (page === "profile") {
        document.querySelector('#profile-box').style.display = 'block';
        document.querySelector('#posts-box').style.display = 'none';
        document.querySelector('#following-box').style.display = 'none';
        //post_by_user(1)
    } 
    else if (page === "posts") {
        document.querySelector('#posts-box').style.display = 'block';
        document.querySelector('#profile-box').style.display = 'none';
        document.querySelector('#following-box').style.display = 'none';
        allposts(1);
    }
    else if (page === "following") {
        document.querySelector('#following-box').style.display = 'block';
        document.querySelector('#profile-box').style.display = 'none';
        document.querySelector('#posts-box').style.display = 'none'; 
        following_posts(1);
    }
    document.querySelector('#title').innerHTML = `<h3>${page.charAt(0).toUpperCase() + page.slice(1)}</h3>`; 
}

// load new post
function new_post() {
    const post_body = document.querySelector("#post-body").value

    fetch("/post", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: post_body
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(error)
        })
    location.reload()
    return false;
}

function edit_post(id) {
    // get input value
    console.log(id) 
    const edit_info = document.querySelector(`#editpost${id}`).value
    // submit value to backend
    fetch(`/edit_post/${id}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: edit_info
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            document.getElementById(`eachpost${result.newpostcontent.post_id}`).innerHTML = result.newpostcontent.content;
        })
        .catch(error => {
            console.log(error)
        })
    //location.reload()
    return false; 
}

// load all posts
function allposts(counter) {
    // remove previous posts
    document.querySelector("#page-number").innerHTML = '';
    document.querySelector("#allposts").innerHTML = '';
    change_counter(counter)
    fetch(`/allposts/posts?page=${counter}`)
        .then(response => response.json())
        .then(items => {
            console.log("allposts", items)
            items.posts.forEach(function(post) {
                console.log("each_post", post); 
                // card parent 
                const div = document.createElement('div');
                div.className = "card w-75 mt-2"
                const span_user = document.createElement('span');
                span_user.innerHTML = post.user
                // check if items.viewing_user.user is undefined:
                if (typeof items.viewing_user !== 'undefined') {
                // separate div if user is the one that created the post
                    if (items.viewing_user.user === post.user) {
                        // show post content
                        div.innerHTML = `<div class="card-body">
                                            <h5 id="card-title${post.post_id}" class="card-title"><a></a></h5>
                                            <p class="card-text" id="eachpost${post.post_id}">${post.content}</p>
                                            <h6 id="post-likes${post.post_id}" class="card-subtitle mb-2 text-muted">Likes : ${post.likes}</h6>
                                        </div>
                                        <div class="card-footer" text-muted>${post.date}</div>`;
                        document.querySelector("#allposts").append(div);
                        document.querySelector(`#card-title${post.post_id}`).append(span_user)
                        // create an edit button
                        let edit_button = document.createElement('a');
                        edit_button.innerHTML = "<a href='#' class='btn btn-primary mt-2 mb-2'>Edit</a>";
                        document.querySelector("#allposts").append(edit_button);
                        edit_button.addEventListener('click', (event) => {
                            // create edit form
                            event.preventDefault();
                            edit_button.style.display="none";
                            let edit_form = document.createElement('form');
                            edit_form.innerHTML = `<textarea class='form-control mt-3' id='editpost${post.post_id}'>${post.content}</textarea>`
                            let save_button = document.createElement('a');
                            save_button.innerHTML = "<a href='#' class='btn btn-primary mt-2 mb-2'>Save</a>"
                            document.querySelector(`#eachpost${post.post_id}`).append(edit_form, save_button);
                            // run edit_post function when clicking save_button
                            save_button.addEventListener('click', (event) => {
                                event.preventDefault();
                                edit_post(post.post_id)});
                        }) 
                    } else { // user is not the one that created the post
                        div.innerHTML = `<div class="card-body">
                                            <h5 id="card-title${post.post_id}" class="card-title"><a></a></h5>
                                            <p class="card-text" id="eachpost${post.post_id}">${post.content}</p>
                                            <h6 id="post-likes${post.post_id}" class="card-subtitle mb-2 text-muted">Likes : ${post.likes}</h6>
                                        </div>
                                        <div class="card-footer" text-muted>${post.date}</div>`;
                        document.querySelector("#allposts").append(div);
                        document.querySelector(`#card-title${post.post_id}`).append(span_user);
                    }
                    // create a like button and call to update
                    let like_button = document.createElement('span')
                    like_button.innerHTML = "<a href='#' class='mx-2 btn btn-primary mt-2 mb-2'>Like</a>"
                    document.querySelector("#allposts").append(like_button)
                    like_button.addEventListener('click', (event) => {
                        event.preventDefault();
                        likebutton(post.post_id)});
                    span_user.addEventListener('click', () => profile(post.user_id));
                } else {
                        div.innerHTML = `<div class="card-body">
                                            <h5 id="card-title${post.post_id}" class="card-title"><a></a></h5>
                                            <p class="card-text" id="eachpost">${post.content}</p>
                                            <h6 id="post-likes${post.post_id}" class="card-subtitle mb-2 text-muted">Likes : ${post.likes}</h6>
                                        </div>
                                        <div class="card-footer" text-muted>${post.date}</div>`;
                    document.querySelector("#allposts").append(div);
                    document.querySelector(`#card-title${post.post_id}`).append(span_user);
                }
            }) 
        })
        .catch(error => {
            console.log(error)
        })
}

function likebutton(id) {
    console.log(id)
    fetch(`/like_post/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id: id
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log("likes", result.number_likes)
        console.log(id)
        document.getElementById(`post-likes${id}`).innerHTML = `Likes : ${result.number_likes}`;

      })
      .catch(function(error) {
        console.log(error);
      })
    //location.reload()
    return false;
}


// change counter for all posts
function change_counter(counter) {
    fetch(`/allposts/posts?page=${counter}`)
        .then(response => response.json())
        .then(data => {
            // console log
            console.log("string", data)
            // button creation & append
            let previous = document.createElement('li')
            previous.setAttribute("id", "previous");
            previous.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">Previous</span></a>`
            previous.classList.add("page-item")
            let next = document.createElement('li')
            next.setAttribute("id", "next");
            next.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">Next</span></a>`
            next.classList.add("page-item")
            document.querySelector("#page-number").append(previous)
            document.querySelector("#page-number").append(next)
            // click event next & previous
            if (counter === data.pages) {
                document.querySelector("#next").style.display = "none";
            }
            if (counter === 1) {
                document.querySelector("#previous").style.display = "none";
            }
            previous.addEventListener('click', () => {
                counter--;
                allposts(counter)
                return counter;
            })
            next.addEventListener('click', () => {
                counter++;
                allposts(counter)
                return counter;
            })
            return counter;
    })
}

// load all following_posts
function following_posts(counter) {
    document.querySelector("#following-box").innerHTML = "";
    document.querySelector("#page-number").innerHTML = '';
    change_counter_follow(counter);
    fetch(`/following_posts/posts?page=${counter}`)
        .then(response => response.json())
        .then(posts => { console.log("following_posts" ,posts)
            posts.following_posts.forEach(post => {post
                console.log("each following post",post)
                const div = document.createElement('div');
                div.className = "card w-75 mt-3"
                const span_user = document.createElement('span');
                span_user.innerHTML = post.user
                div.innerHTML = `<div class="card-body">
                                            <h5 class="card-title"><a>${span_user.innerHTML}</a></h5>
                                            <p class="card-text" id="eachpost">${post.content}</p>
                                            <h6 id="post-likes${post.post_id}" class="card-subtitle mb-2 text-muted">Likes : ${post.likes}</h6>
                                        </div>
                                        <div class="card-footer" text-muted>${post.date}</div>`;
                document.querySelector("#following-box").append(div);
            }) 
        })
        .catch(error => {
            console.log(error)
        })
}

// load change counter for following posts
function change_counter_follow(counter) {
    fetch(`/following_posts/posts?page=${counter}`)
        .then(response => response.json())
        .then(data => {
            console.log("change_counter_follow", data)
            // button creation & append
            let previous = document.createElement('li')
            previous.setAttribute("id", "previous");
            previous.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">Previous</span></a>`
            previous.classList.add("page-item")
            let next = document.createElement('li')
            next.setAttribute("id", "next");
            next.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">Next</span></a>`
            next.classList.add("page-item")
            document.querySelector("#page-number").append(previous)
            document.querySelector("#page-number").append(next) 
            // click event next & previous
            if (counter === data.number_pages) {
                document.querySelector("#next").style.display = "none";
            }
            if (counter === 1) {
                document.querySelector("#previous").style.display = "none";
            }
            previous.addEventListener('click', () => {
                counter--;
                following_posts(counter)
                return counter;
            })
            next.addEventListener('click', () => {
                counter++;
                following_posts(counter)
                return counter;
            })
            return counter; 
        })
    .catch(error => console.log(error))
}

// load each user profile
function profile(user) {
    load_page('profile')
    fetch(`/profile/${user}`)
        .then(response => response.json())
        .then(profile => { 
                console.log("profile", profile)
                const user_p = document.createElement('p');
                const followers_p = document.createElement('p');
                const follows_p = document.createElement('p');
                user_p.innerHTML = `User: ${profile.user_profile.user}`;
                followers_p.innerHTML = `Followers: ${profile.user_profile.followers}`;
                followers_p.setAttribute("id", `followers${profile.user_profile.user_id}`)
                follows_p.innerHTML = `Follows: ${profile.user_profile.follows}`;
                follows_p.setAttribute("id", `follows${profile.user_profile.user_id}`)
                document.querySelector("#profile-user").innerHTML = "";
                document.querySelector("#profile-user").append(user_p);
                document.querySelector("#followers-count").innerHTML = "";
                document.querySelector("#followers-count").append(followers_p);
                document.querySelector("#follows-count").innerHTML = "";
                document.querySelector("#follows-count").append(follows_p);
                post_by_user(1, profile.user_profile.user_id)
                follow_button = document.getElementById("follow-button");
                // check if user is the same as profile
                if (profile.user_profile.user === profile.same_user) {
                    // then dissapear the buttons because user cant follow itself
                    follow_button.style.display = 'none';
                    return;
                } else {  // if user is different as profile
                    // check if profile has followers
                    console.log("check if data" ,profile.following_users)
                    if (profile.following_users.length > 0) {
                    // check if user is already following the profile user:
                        profile.following_users.forEach(following_user => {
                            console.log("following_user", following_user, "profile_user", profile.user_profile.user, "same_user", profile.same_user)
                            if (following_user === profile.same_user) {
                                follow_button.style.display = "block";
                                follow_button.innerHTML = "Unfollow"
                                follow_button.addEventListener('click', () => follow(profile.user_profile.user_id))
                                return;
                            } else { // user is not following the profile user
                                follow_button.style.display = "block"
                                follow_button.innerHTML = "Follow"
                                follow_button.addEventListener('click', () => follow(profile.user_profile.user_id));
                                return;
                            }
                        })
                    } else { // profile has no followers
                        follow_button.style.display = "block";
                        follow_button.innerHTML = "Follow";
                        follow_button.addEventListener('click', () => follow(profile.user_profile.user_id));
                        return;
                    }
                }
        })
        .catch(error => {
            console.log(error)
        })
}

// follow user 
function follow(user) {
    console.log("user", user);
    fetch(`/follow/${user}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: user
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result)
        if (result.success === 1) { // user is following so add user
            document.getElementById(`followers${user}`).innerHTML = `Followers: ${result.add_follower_count}`
            //document.getElementById(`follows${user}`).innerHTML = `Follows: ${result.add_follow_count}`
            document.getElementById("follow-button").innerHTML = "Unfollow"
        } 
        else if (result.success === 0) { // user already is followed so remove user
            document.getElementById(`followers${user}`).innerHTML = `Followers: ${result.remove_follower_count}`
            //document.getElementById(`follows${user}`).innerHTML = `Follows: ${result.remove_follow_count}`
            document.getElementById("follow-button").innerHTML = "Follow"
        }
      })
      .catch(function(error) {
        console.log(error);
      })
    //window.location.reload();
    return false;
}

// load each post by user on profile
function post_by_user(counter, user) {
    document.querySelector("#posts_by_user").innerHTML = "";
    document.querySelector("#page-number").innerHTML = '';
    change_counter_user_posts(counter, user)
    fetch(`/posts_by_user/posts?page=${counter}&user=${user}`)
        .then(response => response.json())
        .then(post => { console.log("post_by_user", post)
            post.posts.forEach(function(post) {
                console.log(post)
                let div = document.createElement('div');
                div.className = "card w-75 mt-2";
                let span_user = document.createElement('span');
                span_user.innerHTML = post.user
                div.innerHTML = `<div class="card-body">
                                        <h5 class="card-title"><a>${span_user.innerHTML}</a></h5>
                                        <p class="card-text" id="eachpost">${post.content}</p>
                                        <h6 id="post-likes${post.post_id}" class="card-subtitle mb-2 text-muted">Likes : ${post.likes}</h6>
                                    </div>
                                    <div class="card-footer" text-muted>${post.date}</div>`;
                document.querySelector("#posts_by_user").append(div);
            }) 
        })
        .catch(error => {
            console.log(error)
        })
}

function change_counter_user_posts(counter, user) {
    fetch(`/posts_by_user/posts?page=${counter}&user=${user}`)
    .then(response => response.json())
    .then(data => {
        console.log("change_counter_user_posts", data)
        // button creation & append
        let previous = document.createElement('li')
        previous.setAttribute("id", "previous");
        previous.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">Previous</span></a>`
        previous.classList.add("page-item")
        let next = document.createElement('li')
        next.setAttribute("id", "next");
        next.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">Next</span></a>`
        next.classList.add("page-item")
        document.querySelector("#page-number").append(previous)
        document.querySelector("#page-number").append(next) 
        // click event next & previous
        if (counter === data.number_pages) {
            document.querySelector("#next").style.display = "none";
        }
        if (counter === 1) {
            document.querySelector("#previous").style.display = "none";
        }
        const user_id = []
        data.posts.forEach((data) => { 
            console.log("data.posts", data)
            user_id.push(data.user_id)
        })
        console.log("user_id", user_id[0])
        previous.addEventListener('click', () => {
            counter--;
            post_by_user(counter, user_id[0])
            return counter;
        })
        next.addEventListener('click', () => {
            counter++;
            post_by_user(counter, user_id[0])
            console.log("add", counter)
            return counter;
        })
        return counter; 
    })
    .catch(error => console.log(error))
}

