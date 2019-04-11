<template>
    <div id="app">

            <table class="table">
                <tr>
                    <td><input type="file" v-on:change="createFile"></td>
                </tr>
                <tr>
                    <td>
                        <a :href="loginLink" v-if="!isLogged">login</a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>{{img}}</p>
                    </td>
                </tr>
            </table>

    </div>


</template>

<script>
    import axios from 'axios'
    import stringRandom from 'string-random'
    import {
        querySearch,
        queryStringify
    } from './components/utils'

    export default {
        name: 'app',
        data: function () {
            return {
                loginLink: 'Hello Vue!',
                img: '',
                isLogged: false
            }
        },
        methods: {

            login: function () {
                const clientID = '9ba42a30e49015b1f1dc';
                const githubOauthUrl = 'http://github.com/login/oauth/authorize'
                const query = {
                    client_id: clientID,
                    redirect_uri: window.location.href,
                    scope: 'public_repo'
                }
                return `${githubOauthUrl}?${queryStringify(query)}`;
            },

            test: function () {
                const clientID = '9ba42a30e49015b1f1dc';
                const clientSecret = '70df2bd365c472a5ecaf1b741685bd14a0c4973b';
                const url = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token';
                const queryStr = querySearch();
                if (queryStr.code) {
                    const code = queryStr.code;
                    delete queryStr.code
                    const replacedUrl = `${window.location.origin}${window.location.pathname}${queryStringify(queryStr)}${window.location.hash}`
                    history.replaceState(null, null, replacedUrl)
                    const thiz = this;
                    axios.post(url, {
                        code: code,
                        client_id: clientID,
                        client_secret: clientSecret
                    }, {
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(res => {
                        if (res) {
                            window.localStorage.setItem('access_token', res.data.access_token);
                            thiz.isLogged = true;
                        }
                    })
                }
            },
            issues: function () {
                const url = 'https://api.github.com/repos/diycat/diycat.github.io/issues';
                const access_token = window.localStorage.getItem('access_token');
                axios.post(url, {
                    title: 'Found a bug',
                    body: 'I\'m having a problem with this.',
                }, {
                    headers: {
                        'Accept': 'application/json',
                        Authorization: `token ${access_token}`
                    }
                }).then(res => {
                    alert(res)
                })
            },
            createFile: function (e) {
                var thiz = this;
                const name = stringRandom();
                const url = `https://api.github.com/repos/diycat/img/contents/${name}.jpg`;
                const access_token = window.localStorage.getItem('access_token');
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    const base64 = e.target.result;
                    axios.put(url, {
                        message: 'my commit message',
                        content: btoa(base64),
                        committer: {
                            name: 'fuzhouxxdong',
                            email: 'fuzhouxxdong@gmail.com'
                        }
                    }, {
                        headers: {
                            'Accept': 'application/json',
                            Authorization: `token ${access_token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            thiz.img = res.data.content.download_url;
                        }
                    })
                }
            }
        },
        created() {
            this.loginLink = this.login();
            if (localStorage.getItem('access_token')) {
                this.isLogged = true;
            } else {
                this.isLogged = false;
                this.test();
            }
        }
    }
</script>

<style>
    /*#app {*/
        /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
        /*-webkit-font-smoothing: antialiased;*/
        /*-moz-osx-font-smoothing: grayscale;*/
        /*text-align: center;*/
        /*color: #2c3e50;*/
        /*margin-top: 60px;*/
    /*}*/
</style>
