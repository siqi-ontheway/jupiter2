(function() {
    // get all elements
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oLoginBtn = document.getElementById('login-btn'),
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oLogoutErrorField = document.getElementById('logout-error'),
        oRegisterBtn = document.getElementById('register-btn'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterForm = document.getElementById('register-form'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),
        oNavBtnList = document.getElementsByClassName('main-nav-btn'),
        oItemNav = document.getElementById('item-nav'),
        oItemList = document.getElementById('item-list'),
        oFavBtn = document.getElementById('fav-btn'),
        oTpl = document.getElementById("tpl").innerHTML,
        deleteuserBtn = document.getElementById('delete-link'),
        odeleteErrorField = document.getElementById('delete-error'),
        odeleteresult = document.getElementById('delete-result'),
        userId = 'user',
        userFullName = 'user',
        lng = -122.08,
        lat = 37.38,
        itemArr;

    // init
    function init() {
        // validate session
        validateSession();
        // bind event
        bindEvent();
    }

    function validateSession() {
        validateSessionExecutor();
    }




    function bindEvent() {
        // switch between login and register
        oRegisterFormBtn.addEventListener('click', function(){
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function() {
            switchLoginRegister('login')
        }, false);

        // click login button
        oLoginBtn.addEventListener('click', loginExecutor, false);
        //click logout button
        oLogoutBtn.addEventListener('click',logoutExecutor, false);

        // click register button
        oRegisterBtn.addEventListener('click', registerExecutor, false);
        oNearbyBtn.addEventListener('click', loadNearbyData, false);

        oFavBtn.addEventListener('click', loadFavoriteItems, false);
        oRecommendBtn.addEventListener('click', loadRecommendedItems, false);
        oItemList.addEventListener('click', changeFavoriteItem, false);
        deleteuserBtn.addEventListener('click',deleteExecutor, false);
    }

    function validateSessionExecutor() {
        ajax({
            method: 'POST',
            url: './login',
            data: {},
            success: function (res) {
                // show login form
                showOrHideElement(oLoginForm, 'none');
                showOrHideElement(oRegisterForm, 'none');
                welcomeMsg(res);
                fetchData();
            },
            error: function () {
                // throw new Error('session invalid, going to login page');
                switchLoginRegister('login');
            }
        })
    }

    function loginExecutor() {
        console.log('login');
        let username = oLoginUsername.value,
            password = oLoginPwd.value;

        if (username === "" || password == "") {
            oLoginErrorField.innerHTML = 'Please fill in all fields';
            return;
        }
        password = md5(username + md5(password));
        ajax({
            method: 'POST',
            url: './login',
            data: {
                user_id: username,
                password: password,
            },
            success: function (res) {
                if (res.status === 'OK') {
                    welcomeMsg(res);
                    fetchData();
                }
            },
            error: function () {
                oLoginErrorField.innerHTML = 'Invalid username or password';
                throw new Error('Invalid username or password');
            }
        })
    }
    function logoutExecutor() {
        console.log('logout');

        ajax({
            method: 'POST',
            url: './logout',
            data: null,
            success: function (res) {
                if (res.result === 'OK') {
                    switchLoginRegister('login');
                } else {
                    oLogoutErrorField.innerHTML = 'Logout  Unsuccessful';
                }
            },
            error: function () {
                throw new Error('Logout Unsuccessful');
            }
        })
    }
    function deleteExecutor() {
        console.log('delete user');

        ajax({
            method: 'DELETE',
            url: './delete',
            data: null,
            success: function (res) {
                if (res.result === userId +" Account Deleted.") {
                    switchLoginRegister('register');
                    odeleteresult.innerHTML = 'Your account is successfully deleted. You can register a new account in this form.';
                } else {

                    odeleteErrorField.innerHTML = 'Delete Account Unsuccessful';
                }
            },
            error: function () {
                throw new Error('Delete Account Unsuccessful');
            }
        })
    }
    function changeFavoriteItem(evt) {
        let tar = evt.target,
            oParent = tar.parentElement;

        if (oParent && oParent.className === 'fav-link') {
            console.log('change ...')
            let oCurLi = oParent.parentElement,
                classname = tar.className,
                isFavorite = classname === 'fa fa-heart',
                oItems = oItemList.getElementsByClassName('item'),
                index = Array.prototype.indexOf.call(oItems, oCurLi),
                url = './history',
                req = {
                    user_id: userId,
                    favorite: itemArr[index]
                };
            let method = !isFavorite ? 'POST' : 'DELETE';

            ajax({
                method: method,
                url: url,
                data: req,
                success: function (res) {
                    if (res.status === 'OK' || res.result === 'SUCCESS') {
                        tar.className = !isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
                    } else {
                        throw new Error('Change Favorite failed!')
                    }
                },
                error: function () {
                    throw new Error('Change Favorite failed!')
                }
            })
        }
    }

    /**
     * API Register
     */
    function registerExecutor() {
        let username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;

        if (username === "" || password == "" || firstName === ""
            || lastName === "") {
            oRegisterResultField.innerHTML = 'Please fill in all fields';
            return;
        }

        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = 'Invalid username';
            return;
        }
        password = md5(username + md5(password));

        ajax({
            method: 'POST',
            url: './register',
            data: {
                user_id : username,
                password : password,
                first_name : firstName,
                last_name : lastName,
            },
            success: function (res) {
                if (res.status === 'OK' || res.result === 'OK') {
                    oRegisterResultField.innerHTML = 'Successfully registered!'
                } else {
                    oRegisterResultField.innerHTML = 'User already existed!'
                }
            },
            error: function () {
                //show login error
                throw new Error('Failed to register');
            }
        })
    }
    /**
     * API Load Nearby Items
     */
    function loadNearbyData() {
        // active side bar buttons
        activeBtn('nearby-btn');

        let opt = {
            method: 'GET',
            url: './search?lat=' + lat + '&lon=' + lng+ '&user_id=' + userId,
            data: null,
            message: 'nearby'
        }
        serverExecutor(opt);
    }
    /**
     * API Load Favorite Items
     */
    function loadFavoriteItems() {
        activeBtn('fav-btn');
        let opt = {
            method: 'GET',
            url: './history?user_id=' + userId,
            data: null,
            message: 'favorite'
        }
        serverExecutor(opt);
    }
    /**
     * API Load Recommended Items
     */
    function loadRecommendedItems() {
        activeBtn('recommend-btn');
        let opt = {
            method: 'GET',
            url: './recommendation?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'recommended'
        }
        serverExecutor(opt);
    }
    /**
     * Render Data
     * @param data
     */
    function render(data) {
        let len = data.length,
            list = '',
            item;
        for (let i = 0; i < len; i++) {
            item = data[i];
            list += oTpl.replace(/{{(.*?)}}/gmi, function (node, key) {
                console.log(key)
                if(key === 'company_logo') {
                    return item[key] || 'https://via.placeholder.com/100';
                }
                if (key === 'location') {
                    return item[key].replace(/,/g, '<br/>').replace(/"/g, '');
                }
                if (key === 'favorite') {
                    return item[key] ? "fa fa-heart" : "fa fa-heart-o";
                }
                return item[key];
            })
        }
        oItemList.innerHTML = list;
    }
    function activeBtn(btnId) {
        let len = oNavBtnList.length;
        for (let i = 0; i < len; i++) {
            oNavBtnList[i].className = 'main-nav-btn';
        }
        let btn = document.getElementById(btnId);
        btn.className += ' active';
    }
    /**
     * Fetch Geolocation
     * @param cb
     */
    function initGeo(cb) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    lat = position.coords.latitude || lat;
                    lng = position.coords.longitude || lng;
                    cb();
                },
                function () {
                    throw new Error('Geo location fetch failed!!')
                }, {
                    maximumAge: 60000
                });
            console.log(lat);
            console.log(lng);
            oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
        } else {
            throw new Error('Your browser does not support navigator!!')
        }
    }
    function showOrHideElement(ele, style) {
        ele.style.display = style;
    }

    function welcomeMsg(info) {
        userId = info.user_id || userId;
        userFullName = info.name || userFullName;
        oWelcomeMsg.innerHTML = 'Welcome ' + userFullName;

        // show welcome, avatar, item area, logout btn
        showOrHideElement(oWelcomeMsg, 'block');
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');
        showOrHideElement(deleteuserBtn,'block');
        // hide login form
        showOrHideElement(oLoginForm, 'none');
    }
    function fetchData() {
        // get geo-location info
        initGeo(loadNearbyData);
    }

    /**
     * Helper - AJAX
     * @param opt
     */
    function ajax(opt) {
       let method = (opt.method || 'GET').toUpperCase(),
            url = opt.url,
            data = opt.data || null,
            success = opt.success || function () {
            },
            error = opt.error || function () {
            },
            xhr = new XMLHttpRequest();

        if (!url) {
            throw new Error('missing url');
        }

        xhr.open(method, url, true);

        if (!data) {
            xhr.send();
        } else {
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify(data));
        }

        xhr.onload = function () {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText))
            } else {
                error()
            }
        }

        xhr.onerror = function () {
            throw new Error('The request could not be completed.')
        }
    }

    /**
     * Helper - Get Data from Server
     */
    function serverExecutor(opt) {
        oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>Loading ' + opt.message + ' item...</p>';
        ajax({
            method: opt.method,
            url: opt.url,
            data: opt.data,
            success: function (res) {
                if (!res || res.length === 0) {
                    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No ' + opt.message + ' item!</p>';
                } else {
                    render(res);
                    itemArr = res;
                }
            },
            error: function () {
                throw new Error('No ' + opt.message + ' items!');
            }
        })
    }

    function switchLoginRegister(name) {
        // hide header elements
        showOrHideElement(oAvatar, 'none');
        showOrHideElement(oWelcomeMsg, 'none');
        showOrHideElement(oLogoutBtn, 'none');
        showOrHideElement(deleteuserBtn,'none');
        // hide item list area
        showOrHideElement(oItemNav, 'none');
        showOrHideElement(oItemList, 'none');

        if(name === 'login') {
            // hide register form
            showOrHideElement(oRegisterForm, 'none');
            // clear register error
            oRegisterResultField.innerHTML = ''

            // show login form
            showOrHideElement(oLoginForm, 'block');

        } else {
            // hide login form
            showOrHideElement(oLoginForm, 'none');
            // clear login error if existed
            oLoginErrorField.innerHTML = '';

            // show register form
            showOrHideElement(oRegisterForm, 'block');
        }
    }

    init();
})();